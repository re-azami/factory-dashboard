import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ChatToolBlock } from '../../models/chat-event';
import { ChatToolCardComponent } from './chat-tool-card.component';

/**
 * Unit tests for ChatToolCardComponent.
 *
 * This is the rendering surface for the agent's four tool calls plus a generic fallback.
 * We import the real Material modules (Expansion, Icon, ProgressSpinner) so the panel
 * actually renders, and pin animations to NoopAnimationsModule to avoid timing flakes.
 *
 * Per the Stage-1 template, the expansion panel starts collapsed (`[expanded]="false"`).
 * Material Expansion still renders the panel body content into the DOM (with a CSS
 * transform); querying via `querySelector` therefore returns the body elements even when
 * collapsed. Tests assert on rendered DOM rather than on visibility/expanded state.
 *
 * Edge-case checklist coverage:
 *  1. Empty / missing input      — covered: empty SQL rows ("نتیجه‌ای یافت نشد"); python_exec
 *                                  with no stdout/error; missing kind in save_memory.
 *  2. Boundary values            — covered: 1-row table, multi-cell row, 0-row table.
 *  3. Persian / Unicode text     — covered: "نتیجه‌ای یافت نشد", "ذخیره شد", "در حال اجرا…",
 *                                  "تکمیل شد", "ورودی", "نتیجه" — exact codepoints.
 *  4. Duplicate rows             — covered: a 2-row tabular result with the same row twice
 *                                  renders both cells.
 *  5. Null DB columns            — covered: a JSON null cell renders as empty <td> (NOT the
 *                                  string "null").
 *  6. Calendar conversion        — N/A: tool card is not date-aware.
 *  7. Permission denials         — N/A: auth lands in AUTH-003+.
 *  8. LLM provider switches      — covered indirectly: all four known tool names exercised.
 */
describe('ChatToolCardComponent', () => {
    let fixture: ComponentFixture<ChatToolCardComponent>;
    let component: ChatToolCardComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChatToolCardComponent],
            imports: [NoopAnimationsModule, MatExpansionModule, MatIconModule, MatProgressSpinnerModule],
        }).compileComponents();

        fixture = TestBed.createComponent(ChatToolCardComponent);
        component = fixture.componentInstance;
    });

    function render(tool: ChatToolBlock): void {
        component.tool = tool;
        fixture.detectChanges();
    }

    function host(): HTMLElement {
        return fixture.nativeElement as HTMLElement;
    }

    // ── State / header indicators ────────────────────────────────────────────

    describe('state indicators', () => {
        it("state==='running': spinner visible with Persian aria-label «در حال اجرا…»", () => {
            render({
                kind: 'tool',
                id: 't1',
                name: 'execute_sql',
                args: { query: 'SELECT 1' },
                state: 'running',
            });

            const spinner = host().querySelector('mat-progress-spinner');
            expect(spinner).not.toBeNull();
            expect(spinner!.getAttribute('aria-label')).toBe('در حال اجرا…');

            const statusLabel = host().querySelector('.status-label') as HTMLElement | null;
            expect(statusLabel?.textContent?.trim()).toBe('در حال اجرا…');

            // No complete icon in running state.
            expect(host().querySelector('.status-icon-complete')).toBeNull();
        });

        it("state==='complete': check icon visible with Persian aria-label «تکمیل شد»", () => {
            render({
                kind: 'tool',
                id: 't1',
                name: 'execute_sql',
                args: { query: 'SELECT 1' },
                state: 'complete',
                output: '{}',
            });

            const completeIcon = host().querySelector('.status-icon-complete');
            expect(completeIcon).not.toBeNull();
            expect(completeIcon!.getAttribute('aria-label')).toBe('تکمیل شد');
            // Material icon ligature text is "check_circle".
            expect(completeIcon!.textContent?.trim()).toBe('check_circle');

            const statusLabel = host().querySelector('.status-label') as HTMLElement | null;
            expect(statusLabel?.textContent?.trim()).toBe('تکمیل شد');

            // No spinner in complete state.
            expect(host().querySelector('mat-progress-spinner')).toBeNull();
        });

        it('header renders the tool name as-is', () => {
            render({
                kind: 'tool',
                id: 't1',
                name: 'execute_sql',
                args: {},
                state: 'running',
            });

            const nameEl = host().querySelector('.tool-name') as HTMLElement | null;
            expect(nameEl).not.toBeNull();
            expect(nameEl!.textContent?.trim()).toBe('execute_sql');
        });

        it('Persian header labels «ورودی» / «نتیجه» are present (codepoint-preserving)', () => {
            render({
                kind: 'tool',
                id: 't1',
                name: 'execute_sql',
                args: { query: 'SELECT 1' },
                state: 'complete',
                output: '{"columns":["n"],"rows":[{"n":1}]}',
            });

            const titles = Array.from(host().querySelectorAll('.section-title')).map(
                (el) => (el as HTMLElement).textContent?.trim(),
            );
            expect(titles).toContain('ورودی');
            expect(titles).toContain('نتیجه');
        });

        it('result section is omitted while running (no «نتیجه» until tool completes)', () => {
            render({
                kind: 'tool',
                id: 't1',
                name: 'execute_sql',
                args: { query: 'SELECT 1' },
                state: 'running',
            });

            const titles = Array.from(host().querySelectorAll('.section-title')).map(
                (el) => (el as HTMLElement).textContent?.trim(),
            );
            expect(titles).toContain('ورودی');
            expect(titles).not.toContain('نتیجه');
        });
    });

    // ── Expansion panel default state ────────────────────────────────────────

    it('expansion panel default state: collapsed (matches Stage-1 [expanded]="false")', () => {
        // Stage 1 sets `[expanded]="false"` on the mat-expansion-panel — assert that here.
        // The most stable signal is the aria-expanded attribute on the panel header, which
        // Material reflects from the parent panel's `expanded` state. The literal binding
        // [expanded]="false" must produce aria-expanded="false" at initialization.
        render({
            kind: 'tool',
            id: 't1',
            name: 'execute_sql',
            args: { query: 'SELECT 1' },
            state: 'complete',
            output: '{"columns":["n"],"rows":[[1]]}',
        });

        const panel = host().querySelector('mat-expansion-panel') as HTMLElement | null;
        expect(panel).not.toBeNull();

        const header = host().querySelector('mat-expansion-panel-header');
        expect(header).not.toBeNull();
        expect(header!.getAttribute('aria-expanded')).toBe('false');
    });

    // ── execute_sql ──────────────────────────────────────────────────────────

    describe('execute_sql', () => {
        it('input is rendered in <pre><code class="lang-sql"> with the exact query string', () => {
            render({
                kind: 'tool',
                id: 't1',
                name: 'execute_sql',
                args: { query: 'SELECT COUNT(*) FROM production_shift WHERE shift = \'day\'' },
                state: 'running',
            });

            const code = host().querySelector('pre.code code.lang-sql') as HTMLElement | null;
            expect(code).not.toBeNull();
            expect(code!.textContent).toBe(
                "SELECT COUNT(*) FROM production_shift WHERE shift = 'day'",
            );
        });

        it('tabular output {columns:["n"],rows:[[42]],row_count:1} renders a 1-cell table + row count', () => {
            render({
                kind: 'tool',
                id: 't1',
                name: 'execute_sql',
                args: { query: 'SELECT 42' },
                state: 'complete',
                output: '{"columns":["n"],"rows":[{"n":42}],"row_count":1}',
            });

            const table = host().querySelector('table.result-table') as HTMLElement | null;
            expect(table).not.toBeNull();

            const headerCells = table!.querySelectorAll('thead th');
            expect(headerCells.length).toBe(1);
            expect((headerCells[0] as HTMLElement).textContent?.trim()).toBe('n');

            const bodyRows = table!.querySelectorAll('tbody tr');
            expect(bodyRows.length).toBe(1);
            const cells = bodyRows[0].querySelectorAll('td');
            expect(cells.length).toBe(1);
            expect((cells[0] as HTMLElement).textContent?.trim()).toBe('42');

            // Row-count caption.
            const caption = host().querySelector('.caption') as HTMLElement | null;
            expect(caption?.textContent).toContain('1 ردیف');
        });

        it('empty rows renders the Persian empty-result message «نتیجه‌ای یافت نشد»', () => {
            render({
                kind: 'tool',
                id: 't1',
                name: 'execute_sql',
                args: { query: 'SELECT 1 WHERE FALSE' },
                state: 'complete',
                output: '{"columns":["n"],"rows":[],"row_count":0}',
            });

            // No table.
            expect(host().querySelector('table.result-table')).toBeNull();

            const empty = host().querySelector('.empty-result') as HTMLElement | null;
            expect(empty).not.toBeNull();
            expect(empty!.textContent?.trim()).toBe('نتیجه‌ای یافت نشد');
        });

        it('null cell renders as an empty <td> (NOT the string "null")', () => {
            render({
                kind: 'tool',
                id: 't1',
                name: 'execute_sql',
                args: { query: 'SELECT NULL' },
                state: 'complete',
                output: '{"columns":["x"],"rows":[{"x":null}]}',
            });

            const cells = host().querySelectorAll('tbody td');
            expect(cells.length).toBe(1);
            const text = (cells[0] as HTMLElement).textContent ?? '';
            expect(text.trim()).toBe('');
            expect(text.trim()).not.toBe('null');
        });

        it('falls back to args JSON when query arg is missing (defensive rendering)', () => {
            render({
                kind: 'tool',
                id: 't1',
                name: 'execute_sql',
                args: { something: 'else' },
                state: 'running',
            });

            const code = host().querySelector('pre.code code') as HTMLElement | null;
            expect(code).not.toBeNull();
            expect(code!.textContent).toContain('"something"');
            expect(code!.textContent).toContain('"else"');
        });

        it('renders a warning caption when output includes a warning string', () => {
            render({
                kind: 'tool',
                id: 't1',
                name: 'execute_sql',
                args: { query: 'SELECT 1' },
                state: 'complete',
                output: '{"columns":["n"],"rows":[{"n":1}],"row_count":1,"warning":"truncated"}',
            });

            const warning = host().querySelector('.caption .warning') as HTMLElement | null;
            expect(warning).not.toBeNull();
            expect(warning!.textContent?.trim()).toBe('truncated');
        });

        it('renders 2 rows with duplicate content (duplicate-rows edge-case)', () => {
            render({
                kind: 'tool',
                id: 't1',
                name: 'execute_sql',
                args: { query: 'SELECT 1, 1 UNION ALL SELECT 1, 1' },
                state: 'complete',
                output: '{"columns":["a","b"],"rows":[{"a":1,"b":1},{"a":1,"b":1}],"row_count":2}',
            });

            const bodyRows = host().querySelectorAll('tbody tr');
            expect(bodyRows.length).toBe(2);
            const allCells = Array.from(host().querySelectorAll('tbody td')).map(
                (c) => (c as HTMLElement).textContent?.trim(),
            );
            expect(allCells).toEqual(['1', '1', '1', '1']);
        });
    });

    // ── python_exec ──────────────────────────────────────────────────────────

    describe('python_exec', () => {
        it('input is rendered in <pre><code class="lang-python"> with the exact code', () => {
            render({
                kind: 'tool',
                id: 't1',
                name: 'python_exec',
                args: { code: 'print("hello")' },
                state: 'running',
            });

            const code = host().querySelector('pre.code code.lang-python') as HTMLElement | null;
            expect(code).not.toBeNull();
            expect(code!.textContent).toBe('print("hello")');
        });

        it('output {stdout:"ok\\n"} renders the stdout inside a <pre>', () => {
            render({
                kind: 'tool',
                id: 't1',
                name: 'python_exec',
                args: { code: 'print("ok")' },
                state: 'complete',
                output: '{"stdout":"ok\\n"}',
            });

            const pres = Array.from(host().querySelectorAll('pre.code')) as HTMLElement[];
            // The first <pre> holds the input; the second holds stdout.
            expect(pres.length).toBeGreaterThanOrEqual(2);
            const stdoutPre = pres[pres.length - 1];
            expect(stdoutPre.textContent).toContain('ok');
        });

        it('output {error:"boom"} renders a red error <pre> with class code-error', () => {
            render({
                kind: 'tool',
                id: 't1',
                name: 'python_exec',
                args: { code: 'raise Exception()' },
                state: 'complete',
                output: '{"error":"boom"}',
            });

            const errorPre = host().querySelector('pre.code-error') as HTMLElement | null;
            expect(errorPre).not.toBeNull();
            expect(errorPre!.textContent?.trim()).toBe('boom');
        });

        it('output with only a note renders the note caption', () => {
            render({
                kind: 'tool',
                id: 't1',
                name: 'python_exec',
                args: { code: 'pass' },
                state: 'complete',
                output: '{"note":"sandbox idle"}',
            });

            const captions = Array.from(host().querySelectorAll('.caption')).map(
                (c) => (c as HTMLElement).textContent?.trim(),
            );
            expect(captions).toContain('sandbox idle');
        });
    });

    // ── save_memory ──────────────────────────────────────────────────────────

    describe('save_memory', () => {
        it('input shows kind chip + content code block', () => {
            render({
                kind: 'tool',
                id: 't1',
                name: 'save_memory',
                args: { kind: 'insight', content: 'مهم: شیفت شب اشتباه ثبت شده.' },
                state: 'running',
            });

            const chip = host().querySelector('.chip') as HTMLElement | null;
            expect(chip).not.toBeNull();
            expect(chip!.textContent?.trim()).toBe('insight');

            const code = host().querySelector('pre.code code') as HTMLElement | null;
            expect(code).not.toBeNull();
            expect(code!.textContent).toBe('مهم: شیفت شب اشتباه ثبت شده.');
        });

        it('input renders a "?" chip when kind is missing (empty/missing input edge-case)', () => {
            render({
                kind: 'tool',
                id: 't1',
                name: 'save_memory',
                args: { content: 'بدون نوع' },
                state: 'running',
            });

            const chip = host().querySelector('.chip') as HTMLElement | null;
            expect(chip).not.toBeNull();
            expect(chip!.textContent?.trim()).toBe('?');
        });

        it('output {saved_id:7, kind:"insight"} renders the «ذخیره شد» confirmation line', () => {
            render({
                kind: 'tool',
                id: 't1',
                name: 'save_memory',
                args: { kind: 'insight', content: 'note' },
                state: 'complete',
                output: '{"saved_id":7,"kind":"insight"}',
            });

            const confirm = host().querySelector('.memory-confirm') as HTMLElement | null;
            expect(confirm).not.toBeNull();
            const text = confirm!.textContent ?? '';
            expect(text).toContain('ذخیره شد');
            expect(text).toContain('7');
            expect(text).toContain('insight');
        });

        it('renders optional source_question caption when present', () => {
            render({
                kind: 'tool',
                id: 't1',
                name: 'save_memory',
                args: { kind: 'insight', content: 'پاسخ مهم', source_question: 'سؤال اصلی' },
                state: 'running',
            });

            const captions = Array.from(host().querySelectorAll('.caption')).map(
                (c) => (c as HTMLElement).textContent?.trim() ?? '',
            );
            expect(captions.some((c) => c.includes('source_question: سؤال اصلی'))).toBeTrue();
        });
    });

    // ── semantic_search ──────────────────────────────────────────────────────

    describe('semantic_search', () => {
        it('renders the query as a paragraph and a "limit" caption when present', () => {
            render({
                kind: 'tool',
                id: 't1',
                name: 'semantic_search',
                args: { query: 'علت توقف فید', limit: 5 },
                state: 'running',
            });

            const queryEl = host().querySelector('.semantic-query') as HTMLElement | null;
            expect(queryEl).not.toBeNull();
            expect(queryEl!.textContent?.trim()).toBe('علت توقف فید');

            const captions = Array.from(host().querySelectorAll('.caption')).map(
                (c) => (c as HTMLElement).textContent?.trim() ?? '',
            );
            expect(captions.some((c) => c.includes('limit: 5'))).toBeTrue();
        });

        it('omits the limit caption when limit is missing', () => {
            render({
                kind: 'tool',
                id: 't1',
                name: 'semantic_search',
                args: { query: 'q' },
                state: 'running',
            });

            const captions = Array.from(host().querySelectorAll('.caption')).map(
                (c) => (c as HTMLElement).textContent?.trim() ?? '',
            );
            expect(captions.some((c) => c.startsWith('limit:'))).toBeFalse();
        });
    });

    // ── Unknown tool fallback ────────────────────────────────────────────────

    describe('unknown tool fallback', () => {
        it("name 'foo_bar' renders args via JSON.stringify and raw output verbatim", () => {
            render({
                kind: 'tool',
                id: 't1',
                name: 'foo_bar',
                args: { a: 1, b: 'two' },
                state: 'complete',
                output: 'plain text output, not JSON',
            });

            const inputCode = host().querySelector('pre.code code') as HTMLElement | null;
            expect(inputCode).not.toBeNull();
            // JSON.stringify with indent=2 produces newlines.
            expect(inputCode!.textContent).toContain('"a"');
            expect(inputCode!.textContent).toContain('"b"');
            expect(inputCode!.textContent).toContain('"two"');

            // Raw output is rendered as-is when JSON parsing fails.
            const allCodes = Array.from(host().querySelectorAll('pre.code code')) as HTMLElement[];
            const rawOutCode = allCodes[allCodes.length - 1];
            expect(rawOutCode.textContent).toContain('plain text output, not JSON');
        });
    });

    // ── Cell rendering ───────────────────────────────────────────────────────

    describe('renderCell()', () => {
        it('null and undefined render as empty string (null DB column edge-case)', () => {
            render({
                kind: 'tool',
                id: 't1',
                name: 'execute_sql',
                args: { query: 'SELECT 1' },
                state: 'complete',
                output: '{"columns":["n"],"rows":[{"n":1}]}',
            });
            expect(component.renderCell(null)).toBe('');
            expect(component.renderCell(undefined)).toBe('');
        });

        it('string values render as themselves (no JSON-stringify wrapping with quotes)', () => {
            render({
                kind: 'tool',
                id: 't1',
                name: 'execute_sql',
                args: { query: 'SELECT 1' },
                state: 'complete',
                output: '{"columns":["n"],"rows":[{"n":1}]}',
            });
            expect(component.renderCell('hello')).toBe('hello');
            expect(component.renderCell('علت توقف فید')).toBe('علت توقف فید');
        });

        it('number and boolean values render via String()', () => {
            render({
                kind: 'tool',
                id: 't1',
                name: 'execute_sql',
                args: { query: 'SELECT 1' },
                state: 'complete',
                output: '{"columns":["n"],"rows":[{"n":1}]}',
            });
            expect(component.renderCell(0)).toBe('0');
            expect(component.renderCell(42)).toBe('42');
            expect(component.renderCell(true)).toBe('true');
            expect(component.renderCell(false)).toBe('false');
        });

        it('object values render via JSON.stringify', () => {
            render({
                kind: 'tool',
                id: 't1',
                name: 'execute_sql',
                args: { query: 'SELECT 1' },
                state: 'complete',
                output: '{"columns":["n"],"rows":[{"n":1}]}',
            });
            expect(component.renderCell({ a: 1 })).toBe('{"a":1}');
        });
    });
});
