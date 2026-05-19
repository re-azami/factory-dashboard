import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject, throwError } from 'rxjs';

import { HistoryService } from '../../shared/services/history.service';
import { PageService } from '../../shared/services/page.service';
import { HistoryComponent } from './history.component';
import { HistoryModule } from './history.module';
import { HistoryEntry } from './models/history-entry';

/**
 * Unit tests for HistoryComponent.
 *
 * Strategy:
 *   - Replace HistoryService with a stub whose `list(limit)` returns a Subject<HistoryEntry[]>
 *     so each test can `next(payload)` or `error(...)` synchronously.
 *   - Replace PageService with a spy so we can assert `setPageTitle()` is called with the
 *     Persian page title.
 *   - Real HistoryModule is imported so the @if / @for control-flow template compiles
 *     against the actual SharedModule (mat-slider, mat-expansion-panel, mat-icon, …).
 *   - NoopAnimationsModule keeps Material's expansion-panel from booting BrowserAnimations.
 *
 * Edge-case checklist coverage:
 *  1. Empty / missing input      — covered: entries=[] + loading=false + error=null renders
 *                                  Persian empty-state hint; entry with tool_calls=null /
 *                                  tool_calls=[] suppresses the expander; entry with
 *                                  answer=null omits the <p.entry-answer>; entry with all
 *                                  null meta fields produces an empty meta paragraph.
 *  2. Boundary values            — covered: 1-entry response renders correctly;
 *                                  slider change 20→100 triggers a second GET that replaces
 *                                  entries; slider min (5) and max (100) are honored.
 *  3. Persian / Unicode text     — covered: Persian question text round-trips codepoint-
 *                                  for-codepoint into the <h3>; Persian page title is set
 *                                  via PageService; Persian error banner is exact.
 *  4. Duplicate rows             — covered: two entries with the same question text but
 *                                  different ids both render (assert exactly 2 article
 *                                  elements); trackEntry(_, {id:5}) === 5.
 *  5. Null DB columns            — covered: asked_at=null hides 🕒 bit; llm_provider=null
 *                                  hides provider bit; agent_mode=null hides 'حالت' bit;
 *                                  answer=null hides answer <p>; tool_calls=null OR [] hides
 *                                  the expander.
 *  6. Calendar conversion        — N/A: the component renders the raw ISO string via
 *                                  Angular's DatePipe with format 'medium'. There is no
 *                                  Jalali conversion in this component.
 *  7. Permission denials         — covered: when HistoryService errors (e.g. 401) the
 *                                  component lights up the Persian error banner and clears
 *                                  the entries array.
 *  8. LLM provider switches      — covered: a fixture with llm_provider='anthropic' and
 *                                  another with llm_provider='openai' both render their
 *                                  literal provider name. (Backend message-shape switches
 *                                  are tested in the backend LLM-client specs, not here.)
 */
describe('HistoryComponent', () => {
    let fixture: ComponentFixture<HistoryComponent>;
    let component: HistoryComponent;
    let listSubject: Subject<HistoryEntry[]>;
    let historyServiceStub: { list: jasmine.Spy };
    let pageServiceSpy: jasmine.SpyObj<PageService>;

    /** Build a minimal HistoryEntry with overridable fields. */
    function makeEntry(overrides: Partial<HistoryEntry> = {}): HistoryEntry {
        return {
            id: 1,
            asked_at: '2026-05-19T08:30:00Z',
            question: 'سوال نمونه',
            answer: 'پاسخ نمونه',
            llm_provider: 'anthropic',
            tool_calls: null,
            agent_mode: 'simple',
            ...overrides,
        };
    }

    beforeEach(async () => {
        listSubject = new Subject<HistoryEntry[]>();

        historyServiceStub = {
            list: jasmine.createSpy('list').and.callFake(() => listSubject.asObservable()),
        };
        pageServiceSpy = jasmine.createSpyObj<PageService>('PageService', ['setPageTitle']);

        await TestBed.configureTestingModule({
            imports: [HistoryModule, NoopAnimationsModule],
            providers: [
                { provide: HistoryService, useValue: historyServiceStub },
                { provide: PageService, useValue: pageServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(HistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges(); // triggers ngOnInit → load()
    });

    afterEach(() => {
        if (!listSubject.closed) listSubject.complete();
    });

    // ── Lifecycle ────────────────────────────────────────────────────────────

    it('creates without crashing', () => {
        expect(component).toBeTruthy();
    });

    it('sets the Persian page title «تاریخچه پرسش‌ها» on init', () => {
        expect(pageServiceSpy.setPageTitle).toHaveBeenCalledTimes(1);
        expect(pageServiceSpy.setPageTitle).toHaveBeenCalledWith({ title: 'تاریخچه پرسش‌ها' });
    });

    it('triggers an initial load on init with the default limit of 20', () => {
        expect(historyServiceStub.list).toHaveBeenCalledTimes(1);
        expect(historyServiceStub.list).toHaveBeenCalledWith(20);
    });

    it('default limit value is 20', () => {
        expect(component.limit).toBe(20);
    });

    // ── Empty state ──────────────────────────────────────────────────────────

    it('renders the Persian empty-state hint «پرسشی ثبت نشده است» when entries=[] and not loading and no error', () => {
        listSubject.next([]); // resolve the initial load with an empty payload
        fixture.detectChanges();

        const hintEl: HTMLElement | null = fixture.nativeElement.querySelector('.empty-hint');
        expect(hintEl).not.toBeNull();
        expect(hintEl!.textContent?.trim()).toBe('پرسشی ثبت نشده است');

        // No entries section should be rendered.
        const entriesEl = fixture.nativeElement.querySelector('.entries');
        expect(entriesEl).toBeNull();
    });

    // ── Single-entry rendering ───────────────────────────────────────────────

    it('renders a single entry with question, answer and Persian meta bits', () => {
        listSubject.next([makeEntry({ id: 7, question: 'پرسش یک', answer: 'پاسخ یک' })]);
        fixture.detectChanges();

        const articles: NodeListOf<HTMLElement> =
            fixture.nativeElement.querySelectorAll('article.entry');
        expect(articles.length).toBe(1);

        const h3 = articles[0].querySelector('h3.entry-question') as HTMLElement;
        expect(h3.textContent?.trim()).toBe('پرسش یک');

        const answerEl = articles[0].querySelector('p.entry-answer') as HTMLElement | null;
        expect(answerEl).not.toBeNull();
        expect(answerEl!.textContent?.trim()).toBe('پاسخ یک');
    });

    it('preserves Persian question codepoints exactly in the <h3>', () => {
        const persianQuestion = 'چند رکورد توقف در فروردین ۱۴۰۵ ثبت شده است؟';
        listSubject.next([makeEntry({ question: persianQuestion })]);
        fixture.detectChanges();

        const h3 = fixture.nativeElement.querySelector('h3.entry-question') as HTMLElement;
        expect(h3.textContent?.trim()).toBe(persianQuestion);
        expect(Array.from(h3.textContent?.trim() ?? '').length).toBe(
            Array.from(persianQuestion).length,
        );
    });

    // ── Null fields cleanly drop UI pieces ───────────────────────────────────

    it('omits the answer <p> when answer is null', () => {
        listSubject.next([makeEntry({ answer: null })]);
        fixture.detectChanges();

        const answerEl = fixture.nativeElement.querySelector('p.entry-answer');
        expect(answerEl).toBeNull();
    });

    it('omits the 🕒 meta bit when asked_at is null', () => {
        listSubject.next([makeEntry({ asked_at: null })]);
        fixture.detectChanges();

        const meta = fixture.nativeElement.querySelector('p.entry-meta') as HTMLElement;
        expect(meta.textContent).not.toContain('🕒');
    });

    it('omits the provider meta bit when llm_provider is null', () => {
        listSubject.next([
            makeEntry({ llm_provider: null, asked_at: null, agent_mode: null }),
        ]);
        fixture.detectChanges();

        const meta = fixture.nativeElement.querySelector('p.entry-meta') as HTMLElement;
        // No <span.meta-bit> rendered for the provider, and the literal 'anthropic' / 'openai'
        // should not appear anywhere in the meta paragraph.
        expect(meta.textContent).not.toContain('anthropic');
        expect(meta.textContent).not.toContain('openai');
    });

    it('omits the «حالت:» meta bit when agent_mode is null', () => {
        listSubject.next([makeEntry({ agent_mode: null })]);
        fixture.detectChanges();

        const meta = fixture.nativeElement.querySelector('p.entry-meta') as HTMLElement;
        expect(meta.textContent).not.toContain('حالت:');
    });

    it('renders an empty meta paragraph (no orphaned separators) when all meta fields are null', () => {
        listSubject.next([
            makeEntry({ asked_at: null, llm_provider: null, agent_mode: null }),
        ]);
        fixture.detectChanges();

        const meta = fixture.nativeElement.querySelector('p.entry-meta') as HTMLElement;
        expect(meta).not.toBeNull();
        // Zero <span.meta-bit> children — the @if branches all skipped.
        expect(meta.querySelectorAll('span.meta-bit').length).toBe(0);
        expect(meta.textContent?.trim() ?? '').toBe('');
    });

    // ── tool_calls expander visibility ───────────────────────────────────────

    it('hides the tool-calls expander when tool_calls is null', () => {
        listSubject.next([makeEntry({ tool_calls: null })]);
        fixture.detectChanges();

        const expander = fixture.nativeElement.querySelector('mat-expansion-panel');
        expect(expander).toBeNull();
    });

    it('hides the tool-calls expander when tool_calls is an empty array', () => {
        listSubject.next([makeEntry({ tool_calls: [] })]);
        fixture.detectChanges();

        const expander = fixture.nativeElement.querySelector('mat-expansion-panel');
        expect(expander).toBeNull();
    });

    it('shows the tool-calls expander when tool_calls has at least one entry', () => {
        listSubject.next([
            makeEntry({
                tool_calls: [
                    { tool: 'execute_sql', input: { q: 'SELECT 1' }, output: { rows: [[1]] } },
                ],
            }),
        ]);
        fixture.detectChanges();

        const expander = fixture.nativeElement.querySelector('mat-expansion-panel');
        expect(expander).not.toBeNull();
    });

    // ── Duplicate rows ───────────────────────────────────────────────────────

    it('renders two articles when given two entries with the SAME question but different ids', () => {
        listSubject.next([
            makeEntry({ id: 1, question: 'تکراری' }),
            makeEntry({ id: 2, question: 'تکراری' }),
        ]);
        fixture.detectChanges();

        const articles: NodeListOf<HTMLElement> =
            fixture.nativeElement.querySelectorAll('article.entry');
        expect(articles.length).toBe(2);

        const questions = Array.from(articles).map(
            (a) => (a.querySelector('h3.entry-question') as HTMLElement).textContent?.trim(),
        );
        expect(questions).toEqual(['تکراری', 'تکراری']);
    });

    it('trackEntry returns the entry id (stable identity for *ngFor / @for)', () => {
        const entry = makeEntry({ id: 5 });
        expect(component.trackEntry(0, entry)).toBe(5);
        expect(component.trackEntry(99, makeEntry({ id: 123 }))).toBe(123);
    });

    // ── LLM provider rendering ──────────────────────────────────────────────

    it('renders both anthropic and openai provider names literally', () => {
        // Backend message-shape switches between Anthropic and OpenAI-compatible providers
        // are exercised in backend/tests; here we just verify the UI renders each verbatim.
        listSubject.next([
            makeEntry({ id: 1, llm_provider: 'anthropic' }),
            makeEntry({ id: 2, llm_provider: 'openai' }),
        ]);
        fixture.detectChanges();

        const metas: NodeListOf<HTMLElement> =
            fixture.nativeElement.querySelectorAll('p.entry-meta');
        expect(metas.length).toBe(2);
        expect(metas[0].textContent).toContain('anthropic');
        expect(metas[1].textContent).toContain('openai');
    });

    // ── Slider / refresh / load ──────────────────────────────────────────────

    it('onLimitChange(50) updates this.limit and triggers a re-fetch with the new limit', () => {
        // Resolve the initial load first so we are not racing.
        listSubject.next([]);
        fixture.detectChanges();
        historyServiceStub.list.calls.reset();

        // Replace the subject for the new call so .next here resolves the new request.
        const next = new Subject<HistoryEntry[]>();
        historyServiceStub.list.and.callFake(() => next.asObservable());

        component.onLimitChange(50);
        expect(component.limit).toBe(50);
        expect(historyServiceStub.list).toHaveBeenCalledOnceWith(50);
    });

    it('slider change from 20→100 triggers a second GET and replaces entries', () => {
        listSubject.next([makeEntry({ id: 1, question: 'old' })]);
        fixture.detectChanges();

        let articles: NodeListOf<HTMLElement> =
            fixture.nativeElement.querySelectorAll('article.entry');
        expect(articles.length).toBe(1);

        const second = new Subject<HistoryEntry[]>();
        historyServiceStub.list.and.callFake(() => second.asObservable());
        historyServiceStub.list.calls.reset();

        component.onLimitChange(100);
        fixture.detectChanges();

        expect(historyServiceStub.list).toHaveBeenCalledOnceWith(100);
        expect(component.limit).toBe(100);

        second.next([
            makeEntry({ id: 10, question: 'new-1' }),
            makeEntry({ id: 11, question: 'new-2' }),
        ]);
        fixture.detectChanges();

        articles = fixture.nativeElement.querySelectorAll('article.entry');
        expect(articles.length).toBe(2);
        const questions = Array.from(articles).map(
            (a) => (a.querySelector('h3.entry-question') as HTMLElement).textContent?.trim(),
        );
        expect(questions).toEqual(['new-1', 'new-2']);
    });

    it('slider boundary: onLimitChange(5) (minimum) fetches with limit=5', () => {
        listSubject.next([]);
        fixture.detectChanges();
        historyServiceStub.list.calls.reset();
        historyServiceStub.list.and.callFake(() => new Subject<HistoryEntry[]>().asObservable());

        component.onLimitChange(5);
        expect(historyServiceStub.list).toHaveBeenCalledOnceWith(5);
    });

    it('slider boundary: onLimitChange(100) (maximum) fetches with limit=100', () => {
        listSubject.next([]);
        fixture.detectChanges();
        historyServiceStub.list.calls.reset();
        historyServiceStub.list.and.callFake(() => new Subject<HistoryEntry[]>().asObservable());

        component.onLimitChange(100);
        expect(historyServiceStub.list).toHaveBeenCalledOnceWith(100);
    });

    it('onRefresh() calls load() (delegates to HistoryService.list with the current limit)', () => {
        listSubject.next([]);
        fixture.detectChanges();
        historyServiceStub.list.calls.reset();
        historyServiceStub.list.and.callFake(() => new Subject<HistoryEntry[]>().asObservable());

        component.onRefresh();
        expect(historyServiceStub.list).toHaveBeenCalledOnceWith(20);
    });

    it('clicking the «بارگذاری مجدد» button invokes load() again', () => {
        listSubject.next([]);
        fixture.detectChanges();
        historyServiceStub.list.calls.reset();
        historyServiceStub.list.and.callFake(() => new Subject<HistoryEntry[]>().asObservable());

        // Look up the refresh button by its visible Persian label inside the button.
        const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
        const refreshBtn = Array.from(buttons).find((b) =>
            (b.textContent ?? '').includes('بارگذاری مجدد'),
        );
        expect(refreshBtn).toBeDefined();

        refreshBtn!.click();
        fixture.detectChanges();

        expect(historyServiceStub.list).toHaveBeenCalledOnceWith(20);
    });

    // ── load() flag transitions ──────────────────────────────────────────────

    it('load(): loading=true synchronously and entries unchanged before response arrives', () => {
        // Initial detectChanges already ran ngOnInit → load(). loading should still be true
        // because we have not pushed any value into the subject yet.
        expect(component.loading).toBeTrue();
        expect(component.error).toBeNull();
    });

    it('load(): loading=false after success and entries populated', () => {
        listSubject.next([makeEntry()]);
        fixture.detectChanges();

        expect(component.loading).toBeFalse();
        expect(component.error).toBeNull();
        expect(component.entries.length).toBe(1);
    });

    // ── Error path ───────────────────────────────────────────────────────────

    it('on service error: sets the Persian error banner and clears the entries', () => {
        // Pre-populate entries so we can confirm they get cleared.
        listSubject.next([makeEntry({ id: 1 }), makeEntry({ id: 2 })]);
        fixture.detectChanges();
        expect(component.entries.length).toBe(2);

        // Now trigger a fresh load whose observable errors immediately.
        historyServiceStub.list.and.returnValue(throwError(() => new Error('401 Unauthorized')));

        component.onRefresh();
        fixture.detectChanges();

        expect(component.error).toBe('بارگذاری تاریخچه با خطا مواجه شد');
        expect(component.entries).toEqual([]);
        expect(component.loading).toBeFalse();

        // Error banner is rendered in the template.
        const banner = fixture.nativeElement.querySelector('div.error-banner') as HTMLElement;
        expect(banner).not.toBeNull();
        expect(banner.textContent?.trim()).toBe('بارگذاری تاریخچه با خطا مواجه شد');

        // Empty-state hint must NOT show while error is set.
        const emptyHint = fixture.nativeElement.querySelector('.empty-hint');
        expect(emptyHint).toBeNull();
    });

    it('on service error: entries array reference is reset to [] (not just emptied)', () => {
        historyServiceStub.list.and.returnValue(throwError(() => new Error('boom')));
        component.onRefresh();
        fixture.detectChanges();

        expect(Array.isArray(component.entries)).toBeTrue();
        expect(component.entries).toEqual([]);
    });

    // ── formatJson ───────────────────────────────────────────────────────────

    describe('formatJson', () => {
        it('returns a 2-space-indented multi-line JSON string for a non-null object', () => {
            const out = component.formatJson({ a: 1 });
            expect(out).toBe('{\n  "a": 1\n}');
        });

        it('returns "" for null input', () => {
            expect(component.formatJson(null)).toBe('');
        });

        it('returns "" for undefined input', () => {
            expect(component.formatJson(undefined)).toBe('');
        });

        it('falls back to String(value) when JSON.stringify throws (circular reference)', () => {
            type Circular = { self?: Circular };
            const circular: Circular = {};
            circular.self = circular;
            const out = component.formatJson(circular);
            // String(value) on an object returns '[object Object]'.
            expect(out).toBe('[object Object]');
        });

        it('serializes nested structures with proper indentation', () => {
            const out = component.formatJson({ rows: [[1, 2]], n: 2 });
            // Each nested level adds 2 spaces; ensure newlines + 2-space indent show up.
            expect(out).toContain('\n  "rows"');
            expect(out).toContain('\n  "n": 2');
        });
    });

    // ── Subscription teardown ────────────────────────────────────────────────

    it('ngOnDestroy unsubscribes the in-flight fetch subscription', () => {
        // initial load is still in flight: subject has 1 observer.
        const before = listSubject.observers.length;
        expect(before).toBeGreaterThanOrEqual(1);

        fixture.destroy();

        expect(listSubject.observers.length).toBeLessThan(before);
    });
});
