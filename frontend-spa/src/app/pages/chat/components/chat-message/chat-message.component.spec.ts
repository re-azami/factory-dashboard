import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MARKED_OPTIONS, MarkdownModule } from 'ngx-markdown';

import { ChatMessage, ChatTextBlock } from '../../models/chat-event';
import { ChatMessageComponent } from './chat-message.component';

/**
 * Unit tests for ChatMessageComponent.
 *
 * Child components (<app-chat-tool-card>, <mat-icon>) are stubbed via NO_ERRORS_SCHEMA
 * so the spec stays focused on the parent's block dispatch.
 *
 * Edge-case checklist coverage:
 *  1. Empty / missing input      — covered: a message with an empty blocks list renders the
 *                                  bubble container only (no children).
 *  2. Boundary values            — covered: 1 text block, 2 text blocks, mixed text+tool+error.
 *  3. Persian / Unicode text     — covered: pure-Persian text content (user <p> + assistant
 *                                  <markdown> host), mixed Persian+English, exact codepoint
 *                                  preservation on user bubbles. (The markdown subtree's own
 *                                  Persian rendering is covered in the markdown-rendering block.)
 *  4. Duplicate rows             — covered: two identical assistant text blocks render as two
 *                                  distinct <markdown> hosts; two identical user blocks render
 *                                  as two distinct <p class="block-text">s.
 *  5. Null DB columns            — N/A: this component renders block text; the cell-null case
 *                                  belongs to chat-tool-card.
 *  6. Calendar conversion        — N/A: no date logic.
 *  7. Permission denials         — N/A: no auth.
 *  8. LLM provider switches      — N/A: rendering is provider-agnostic.
 */
describe('ChatMessageComponent', () => {
    let fixture: ComponentFixture<ChatMessageComponent>;
    let component: ChatMessageComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChatMessageComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(ChatMessageComponent);
        component = fixture.componentInstance;
    });

    function render(message: ChatMessage): void {
        component.message = message;
        fixture.detectChanges();
    }

    // ── User bubble ──────────────────────────────────────────────────────────

    describe('user bubble', () => {
        it('renders the user text verbatim with no role-prefix transformation', () => {
            render({
                role: 'user',
                blocks: [{ kind: 'text', text: 'سلام، حالت چطوره؟' }],
            });

            const p: HTMLElement | null = fixture.nativeElement.querySelector('p.block-text');
            expect(p).not.toBeNull();
            expect(p!.textContent?.trim()).toBe('سلام، حالت چطوره؟');
        });

        it('adds the "user" class to the bubble when role is "user"', () => {
            render({ role: 'user', blocks: [{ kind: 'text', text: 'hi' }] });

            const bubble: HTMLElement | null = fixture.nativeElement.querySelector('.bubble');
            expect(bubble).not.toBeNull();
            expect(bubble!.classList.contains('user')).toBeTrue();
            expect(bubble!.classList.contains('assistant')).toBeFalse();
        });

        it('preserves exact Persian codepoints (no transliteration or normalization)', () => {
            const text = 'گزارش روزانه ۱۴۰۵/۰۲/۱۴';
            render({ role: 'user', blocks: [{ kind: 'text', text }] });

            const p = fixture.nativeElement.querySelector('p.block-text') as HTMLElement;
            expect(p.textContent?.trim()).toBe(text);
            expect(Array.from(p.textContent!.trim()).length).toBe(Array.from(text).length);
        });

        it('renders mixed Persian + English text in full without crashing', () => {
            const text = 'lookup SELECT * for line ۱ روزانه';
            render({ role: 'user', blocks: [{ kind: 'text', text }] });

            const p = fixture.nativeElement.querySelector('p.block-text') as HTMLElement;
            expect(p.textContent?.trim()).toBe(text);
        });

        it('user bubble <p.block-text> has unicode-bidi: plaintext in its computed style', () => {
            // Component-scoped SCSS sets `.block-text { unicode-bidi: plaintext; }` so that
            // mixed Persian + English flows naturally inside a user bubble. ChromeHeadless on
            // emulated encapsulation reports 'plaintext'; allow the webkit-prefixed equivalent
            // too in case the browser falls back. (Assistant messages no longer use this class
            // since UI-001e routes assistant text through <markdown>; the rule still applies
            // to user bubbles which remain literal <p>s.)
            render({
                role: 'user',
                blocks: [{ kind: 'text', text: 'این متن کاملاً فارسی است' }],
            });

            const p = fixture.nativeElement.querySelector('p.block-text') as HTMLElement;
            expect(p).not.toBeNull();
            const computed = window.getComputedStyle(p).unicodeBidi;
            expect(['plaintext', '-webkit-plaintext']).toContain(computed);
        });
    });

    // ── Assistant bubble ─────────────────────────────────────────────────────

    describe('assistant bubble', () => {
        it('adds the "assistant" class to the bubble when role is "assistant"', () => {
            render({ role: 'assistant', blocks: [{ kind: 'text', text: 'پاسخ' }] });

            const bubble: HTMLElement | null = fixture.nativeElement.querySelector('.bubble');
            expect(bubble).not.toBeNull();
            expect(bubble!.classList.contains('assistant')).toBeTrue();
            expect(bubble!.classList.contains('user')).toBeFalse();
        });

        it('renders one <markdown> host per text block (boundary: 2 blocks => 2 markdown hosts)', () => {
            // Assistant text blocks render via ngx-markdown's <markdown> element. In this
            // describe block MarkdownModule is NOT imported (NO_ERRORS_SCHEMA stubs the
            // element), so we assert on the host element + its [data] input rather than
            // the parsed markdown subtree. Subtree parsing is covered in the dedicated
            // "markdown rendering" describe block below.
            render({
                role: 'assistant',
                blocks: [
                    { kind: 'text', text: 'first' },
                    { kind: 'text', text: 'second' },
                ],
            });

            const hosts = fixture.nativeElement.querySelectorAll('markdown.block-markdown');
            expect(hosts.length).toBe(2);
            // User-bubble <p class="block-text"> must NOT appear for assistant messages.
            expect(fixture.nativeElement.querySelectorAll('p.block-text').length).toBe(0);
        });

        it('renders duplicate text blocks as duplicate markdown hosts (duplicate-rows edge-case)', () => {
            render({
                role: 'assistant',
                blocks: [
                    { kind: 'text', text: 'دو بار' },
                    { kind: 'text', text: 'دو بار' },
                ],
            });

            const hosts = fixture.nativeElement.querySelectorAll('markdown.block-markdown');
            expect(hosts.length).toBe(2);
        });

        it('delegates tool blocks to <app-chat-tool-card> (one child element per tool block)', () => {
            render({
                role: 'assistant',
                blocks: [
                    {
                        kind: 'tool',
                        id: 't1',
                        name: 'execute_sql',
                        args: { query: 'SELECT 1' },
                        state: 'complete',
                        output: '{}',
                    },
                ],
            });

            const cards = fixture.nativeElement.querySelectorAll('app-chat-tool-card');
            expect(cards.length).toBe(1);
        });

        it('renders an error block as a div.block-error with role="alert" and the error text', () => {
            render({
                role: 'assistant',
                blocks: [{ kind: 'error', error: 'خطا در ارتباط با سرور' }],
            });

            const errEl: HTMLElement | null = fixture.nativeElement.querySelector('.block-error');
            expect(errEl).not.toBeNull();
            expect(errEl!.getAttribute('role')).toBe('alert');
            // The error text is inside a child <span> alongside an <mat-icon>; assert via textContent.
            expect(errEl!.textContent).toContain('خطا در ارتباط با سرور');
        });

        it('renders a mixed block list (text + tool + error) in the given order', () => {
            render({
                role: 'assistant',
                blocks: [
                    { kind: 'text', text: 'before' },
                    {
                        kind: 'tool',
                        id: 't1',
                        name: 'execute_sql',
                        args: {},
                        state: 'complete',
                        output: '{}',
                    },
                    { kind: 'text', text: 'after' },
                    { kind: 'error', error: 'boom' },
                ],
            });

            const bubble: HTMLElement = fixture.nativeElement.querySelector('.bubble');
            const children = Array.from(bubble.children) as HTMLElement[];
            expect(children.length).toBe(4);
            // Assistant text blocks render as <markdown> hosts (markdown subtree is
            // covered in the dedicated markdown-rendering describe below).
            expect(children[0].tagName.toLowerCase()).toBe('markdown');
            expect(children[1].tagName.toLowerCase()).toBe('app-chat-tool-card');
            expect(children[2].tagName.toLowerCase()).toBe('markdown');
            expect(children[3].classList.contains('block-error')).toBeTrue();
        });

        it('empty blocks list (empty/missing input edge-case): bubble renders but has no children', () => {
            render({ role: 'assistant', blocks: [] });

            const bubble: HTMLElement = fixture.nativeElement.querySelector('.bubble');
            expect(bubble).not.toBeNull();
            // No paragraphs, no cards, no error blocks.
            expect(fixture.nativeElement.querySelectorAll('p.block-text').length).toBe(0);
            expect(fixture.nativeElement.querySelectorAll('app-chat-tool-card').length).toBe(0);
            expect(fixture.nativeElement.querySelectorAll('.block-error').length).toBe(0);
        });

        it('pure-Persian assistant text passes through to the <markdown> host with .block-markdown class for SCSS targeting', () => {
            // Assistant text now flows through ngx-markdown's <markdown> directive with the
            // `block-markdown` class — component-scoped SCSS targets that class (via ::ng-deep)
            // for the parsed-markdown subtree's typography rules. Subtree parsing itself is
            // covered in the dedicated markdown-rendering describe below; here we just verify
            // the host element is present with the SCSS-targeted class.
            render({
                role: 'assistant',
                blocks: [{ kind: 'text', text: 'این متن کاملاً فارسی است' }],
            });

            const host = fixture.nativeElement.querySelector('markdown.block-markdown') as HTMLElement | null;
            expect(host).not.toBeNull();
            expect(host!.classList.contains('block-markdown')).toBeTrue();
            // User-bubble <p class="block-text"> must NOT appear for assistant messages.
            expect(fixture.nativeElement.querySelector('p.block-text')).toBeNull();
        });

        it('mixed Persian + English assistant text flows into a single <markdown> host', () => {
            const text = 'پاسخ: result is ۴۲ rows';
            render({
                role: 'assistant',
                blocks: [{ kind: 'text', text }],
            });

            const hosts = fixture.nativeElement.querySelectorAll('markdown.block-markdown');
            expect(hosts.length).toBe(1);
            // User-bubble <p class="block-text"> must NOT appear for assistant messages.
            expect(fixture.nativeElement.querySelector('p.block-text')).toBeNull();
        });
    });

    // ── Type-narrowing helpers ───────────────────────────────────────────────

    describe('type-narrowing helpers (asText / asTool / asError)', () => {
        it('asText returns the block reference as-is for a text block', () => {
            const block = { kind: 'text', text: 'hi' } as const;
            expect(component.asText(block)).toBe(block);
        });

        it('asTool returns the block reference as-is for a tool block', () => {
            const block = {
                kind: 'tool',
                id: 't1',
                name: 'execute_sql',
                args: {},
                state: 'running',
            } as const;
            expect(component.asTool(block)).toBe(block);
        });

        it('asError returns the block reference as-is for an error block', () => {
            const block = { kind: 'error', error: 'oops' } as const;
            expect(component.asError(block)).toBe(block);
        });

        it('trackBlock returns the index argument (identity tracker)', () => {
            expect(component.trackBlock(0, { kind: 'text', text: '' } as const)).toBe(0);
            expect(component.trackBlock(3, { kind: 'text', text: '' } as const)).toBe(3);
        });
    });
});

/**
 * Markdown rendering tests (assistant messages only).
 *
 * The implementation renders assistant text blocks through ngx-markdown's
 * <markdown [data]="..."> directive with GFM enabled (tables, fenced code,
 * pipe tables) and sanitization on (no `disableSanitizer`). User bubbles still
 * use a literal <p class="block-text">{{ ... }}</p>.
 *
 * Critical TestBed difference: this describe block imports MarkdownModule.forRoot()
 * so that the <markdown> element actually renders to a real DOM subtree. The
 * outer suite keeps NO_ERRORS_SCHEMA without the module, which is fine because
 * those tests assert on <p class="block-text"> only.
 *
 * Edge-case checklist coverage:
 *  1. Empty / missing input      — covered: empty assistant text renders the <markdown>
 *                                  host element with no markdown children (test 17).
 *  2. Boundary values            — covered: single constructs, partial-then-complete
 *                                  streaming, mixed-content tables.
 *  3. Persian / Unicode text     — covered: bold-Persian and a Persian pipe table.
 *  4. Duplicate rows             — covered: two identical assistant text blocks render
 *                                  two distinct <strong> elements (test 18).
 *  5. Null DB columns            — N/A: this is a UI rendering test, no DB column path.
 *  6. Calendar conversion        — N/A: no date logic in markdown rendering.
 *  7. Permission denials         — N/A: no auth in the renderer.
 *  8. LLM provider switches      — N/A: rendering is provider-agnostic (the markdown
 *                                  string is already on the block by the time we render).
 */
describe('ChatMessageComponent — markdown rendering (assistant)', () => {
    let fixture: ComponentFixture<ChatMessageComponent>;
    let component: ChatMessageComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MarkdownModule.forRoot({
                    markedOptions: {
                        provide: MARKED_OPTIONS,
                        useValue: { gfm: true, breaks: false },
                    },
                }),
            ],
            declarations: [ChatMessageComponent],
            // NO_ERRORS_SCHEMA keeps <app-chat-tool-card>/<mat-icon> stubbed;
            // <markdown> is declared by MarkdownModule so it resolves first.
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(ChatMessageComponent);
        component = fixture.componentInstance;
    });

    /** ngx-markdown re-renders asynchronously after [data] is set. Flush twice. */
    async function render(message: ChatMessage): Promise<void> {
        component.message = message;
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    function assistantText(text: string): ChatMessage {
        return { role: 'assistant', blocks: [{ kind: 'text', text }] };
    }

    // ── Markdown construct tests ─────────────────────────────────────────────

    it('renders **bold** as <strong>', async () => {
        await render(assistantText('**bold**'));

        const strong = fixture.nativeElement.querySelector('strong') as HTMLElement | null;
        expect(strong).not.toBeNull();
        expect(strong!.textContent?.trim()).toBe('bold');
    });

    it('renders *italic* as <em>', async () => {
        await render(assistantText('*italic*'));

        const em = fixture.nativeElement.querySelector('em') as HTMLElement | null;
        expect(em).not.toBeNull();
        expect(em!.textContent?.trim()).toBe('italic');
    });

    it('renders "# Heading 1" as <h1>', async () => {
        await render(assistantText('# Heading 1'));

        const h1 = fixture.nativeElement.querySelector('h1') as HTMLElement | null;
        expect(h1).not.toBeNull();
        expect(h1!.textContent?.trim()).toBe('Heading 1');
    });

    it('renders "## Heading 2" as <h2>', async () => {
        await render(assistantText('## Heading 2'));

        const h2 = fixture.nativeElement.querySelector('h2') as HTMLElement | null;
        expect(h2).not.toBeNull();
        expect(h2!.textContent?.trim()).toBe('Heading 2');
    });

    it('renders an unordered list as <ul> with two <li> children', async () => {
        await render(assistantText('- one\n- two'));

        const ul = fixture.nativeElement.querySelector('ul') as HTMLElement | null;
        expect(ul).not.toBeNull();
        const items = ul!.querySelectorAll('li');
        expect(items.length).toBe(2);
        expect((items[0] as HTMLElement).textContent?.trim()).toBe('one');
        expect((items[1] as HTMLElement).textContent?.trim()).toBe('two');
    });

    it('renders an ordered list as <ol> with two <li> children', async () => {
        await render(assistantText('1. one\n2. two'));

        const ol = fixture.nativeElement.querySelector('ol') as HTMLElement | null;
        expect(ol).not.toBeNull();
        const items = ol!.querySelectorAll('li');
        expect(items.length).toBe(2);
        expect((items[0] as HTMLElement).textContent?.trim()).toBe('one');
        expect((items[1] as HTMLElement).textContent?.trim()).toBe('two');
    });

    it('renders inline code as <code> NOT wrapped in <pre>', async () => {
        await render(assistantText('text `let x = 1` more'));

        const code = fixture.nativeElement.querySelector('code') as HTMLElement | null;
        expect(code).not.toBeNull();
        expect(code!.textContent).toContain('let x = 1');
        // inline code must not have a <pre> ancestor
        expect(code!.closest('pre')).toBeNull();
    });

    it('renders a fenced code block as <pre><code>', async () => {
        const fence = '```\nconst y = 2;\n```';
        await render(assistantText(fence));

        const pre = fixture.nativeElement.querySelector('pre') as HTMLElement | null;
        expect(pre).not.toBeNull();
        const code = pre!.querySelector('code') as HTMLElement | null;
        expect(code).not.toBeNull();
        expect(code!.textContent).toContain('const y = 2;');
    });

    it('renders a GFM pipe table as <table><thead><th> + <tbody><td>', async () => {
        const md = '| col1 | col2 |\n| --- | --- |\n| a | b |';
        await render(assistantText(md));

        const table = fixture.nativeElement.querySelector('table') as HTMLElement | null;
        expect(table).not.toBeNull();
        const thead = table!.querySelector('thead');
        expect(thead).not.toBeNull();
        const ths = thead!.querySelectorAll('th');
        expect(ths.length).toBe(2);
        expect((ths[0] as HTMLElement).textContent?.trim()).toBe('col1');
        expect((ths[1] as HTMLElement).textContent?.trim()).toBe('col2');

        const tbody = table!.querySelector('tbody');
        expect(tbody).not.toBeNull();
        const tds = tbody!.querySelectorAll('td');
        expect(tds.length).toBe(2);
        expect((tds[0] as HTMLElement).textContent?.trim()).toBe('a');
        expect((tds[1] as HTMLElement).textContent?.trim()).toBe('b');
    });

    // ── Sanitization tests (mandatory) ───────────────────────────────────────

    it('strips <script> tags from assistant markdown (sanitization)', async () => {
        await render(assistantText('<script>alert(1)</script>'));

        const script = fixture.nativeElement.querySelector('script');
        expect(script).toBeNull();
    });

    it('strips onerror handler from <img> tags (sanitization)', async () => {
        await render(assistantText('<img src=x onerror="alert(1)">'));

        const img = fixture.nativeElement.querySelector('img') as HTMLImageElement | null;
        // If an <img> survives, its onerror handler must be neutralized.
        if (img !== null) {
            // DomSanitizer drops event-handler attributes entirely.
            expect(img.getAttribute('onerror')).toBeNull();
            expect((img as unknown as { onerror: unknown }).onerror).toBeFalsy();
        }
    });

    it('regression guard: <markdown> element does NOT have disableSanitizer set', async () => {
        await render(assistantText('hello'));

        const markdownEl = fixture.nativeElement.querySelector('markdown') as HTMLElement | null;
        expect(markdownEl).not.toBeNull();
        expect(markdownEl!.hasAttribute('disableSanitizer')).toBeFalse();
        // HTML attributes lowercase — also check the canonical lowercased form.
        expect(markdownEl!.getAttribute('disablesanitizer')).toBeNull();
    });

    // ── Persian inside markdown ──────────────────────────────────────────────

    it('renders **سلام دنیا** as <strong>سلام دنیا</strong> preserving codepoints', async () => {
        await render(assistantText('**سلام دنیا**'));

        const strong = fixture.nativeElement.querySelector('strong') as HTMLElement | null;
        expect(strong).not.toBeNull();
        expect(strong!.textContent?.trim()).toBe('سلام دنیا');
    });

    it('renders a Persian pipe table with exact Persian codepoints in <td> cells', async () => {
        const md = '| شیفت | تعداد توقف |\n| --- | --- |\n| روز | ۱۱ |\n| شب | ۷ |';
        await render(assistantText(md));

        const table = fixture.nativeElement.querySelector('table') as HTMLElement | null;
        expect(table).not.toBeNull();
        const tdTexts = Array.from(table!.querySelectorAll('td')).map((el) =>
            (el as HTMLElement).textContent?.trim(),
        );
        expect(tdTexts).toContain('روز');
        expect(tdTexts).toContain('شب');
        expect(tdTexts).toContain('۱۱');
        expect(tdTexts).toContain('۷');
    });

    // ── User bubble stays literal (role-switch regression guard) ─────────────

    it('user bubble renders **bold** literally (no <strong>, raw text in <p>)', async () => {
        await render({
            role: 'user',
            blocks: [{ kind: 'text', text: '**bold**' }],
        });

        expect(fixture.nativeElement.querySelector('strong')).toBeNull();
        const p = fixture.nativeElement.querySelector('p.block-text') as HTMLElement | null;
        expect(p).not.toBeNull();
        expect(p!.textContent?.trim()).toBe('**bold**');
    });

    // ── Streaming / partial markdown ─────────────────────────────────────────

    it('partial "**bo" renders no <strong>, then mutating to "**bold**" renders <strong>bold</strong>', async () => {
        const block: ChatTextBlock = { kind: 'text', text: '**bo' };
        const msg: ChatMessage = { role: 'assistant', blocks: [block] };
        await render(msg);

        expect(fixture.nativeElement.querySelector('strong')).toBeNull();

        // Mutate the same block's text and re-render — simulates streaming append.
        block.text = '**bold**';
        await render(msg);

        const strong = fixture.nativeElement.querySelector('strong') as HTMLElement | null;
        expect(strong).not.toBeNull();
        expect(strong!.textContent?.trim()).toBe('bold');
    });

    // ── Edge-case coverage: empty input and duplicate rows ───────────────────

    it('empty assistant text renders the <markdown> host with no markdown children', async () => {
        await render(assistantText(''));

        const markdownEl = fixture.nativeElement.querySelector('markdown') as HTMLElement | null;
        expect(markdownEl).not.toBeNull();
        expect(markdownEl!.textContent?.trim()).toBe('');

        // No semantic markdown elements should exist.
        expect(fixture.nativeElement.querySelector('strong')).toBeNull();
        expect(fixture.nativeElement.querySelector('em')).toBeNull();
        expect(fixture.nativeElement.querySelector('h1')).toBeNull();
        expect(fixture.nativeElement.querySelector('ul')).toBeNull();
        expect(fixture.nativeElement.querySelector('ol')).toBeNull();
        expect(fixture.nativeElement.querySelector('table')).toBeNull();
    });

    it('duplicate assistant markdown blocks render two distinct <strong> elements', async () => {
        await render({
            role: 'assistant',
            blocks: [
                { kind: 'text', text: '**hello**' },
                { kind: 'text', text: '**hello**' },
            ],
        });

        const strongs = fixture.nativeElement.querySelectorAll('strong');
        expect(strongs.length).toBe(2);
        expect((strongs[0] as HTMLElement).textContent?.trim()).toBe('hello');
        expect((strongs[1] as HTMLElement).textContent?.trim()).toBe('hello');
    });
});
