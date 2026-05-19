import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ChatMessage } from '../../models/chat-event';
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
 *  3. Persian / Unicode text     — covered: pure-Persian text content, mixed Persian+English,
 *                                  exact codepoint preservation, optional unicode-bidi:plaintext.
 *  4. Duplicate rows             — covered: two identical text blocks render as two <p>s.
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

        it('renders one <p> per text block (boundary: 2 blocks => 2 paragraphs)', () => {
            render({
                role: 'assistant',
                blocks: [
                    { kind: 'text', text: 'first' },
                    { kind: 'text', text: 'second' },
                ],
            });

            const paragraphs = fixture.nativeElement.querySelectorAll('p.block-text');
            expect(paragraphs.length).toBe(2);
            expect((paragraphs[0] as HTMLElement).textContent?.trim()).toBe('first');
            expect((paragraphs[1] as HTMLElement).textContent?.trim()).toBe('second');
        });

        it('renders duplicate text blocks as duplicate paragraphs (duplicate-rows edge-case)', () => {
            render({
                role: 'assistant',
                blocks: [
                    { kind: 'text', text: 'دو بار' },
                    { kind: 'text', text: 'دو بار' },
                ],
            });

            const paragraphs = fixture.nativeElement.querySelectorAll('p.block-text');
            expect(paragraphs.length).toBe(2);
            expect((paragraphs[0] as HTMLElement).textContent?.trim()).toBe('دو بار');
            expect((paragraphs[1] as HTMLElement).textContent?.trim()).toBe('دو بار');
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
            expect(children[0].tagName.toLowerCase()).toBe('p');
            expect(children[0].textContent?.trim()).toBe('before');
            expect(children[1].tagName.toLowerCase()).toBe('app-chat-tool-card');
            expect(children[2].tagName.toLowerCase()).toBe('p');
            expect(children[2].textContent?.trim()).toBe('after');
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

        it('pure-Persian text paragraph renders with the expected `.block-text` class for SCSS targeting', () => {
            // The component-scoped SCSS sets `.block-text { unicode-bidi: plaintext; }`. We
            // verify the class is present on the <p>; the actual computed `unicode-bidi`
            // value is asserted statically by the SCSS source (Karma's ChromeHeadless can
            // report either 'plaintext' or fall back to the default depending on view
            // encapsulation timing, so the class-presence check is the deterministic signal).
            render({
                role: 'assistant',
                blocks: [{ kind: 'text', text: 'این متن کاملاً فارسی است' }],
            });

            const p = fixture.nativeElement.querySelector('p.block-text') as HTMLElement;
            expect(p).not.toBeNull();
            expect(p.classList.contains('block-text')).toBeTrue();
            expect(p.textContent?.trim()).toBe('این متن کاملاً فارسی است');
        });

        it('pure-Persian text paragraph has unicode-bidi: plaintext in its computed style', () => {
            // Separate test so a CSS-resolution flake here does NOT mask the broader rendering
            // checks above. ChromeHeadless on Material's emulated encapsulation reports
            // 'plaintext' for this rule; allow the equivalent webkit-prefixed value too.
            render({
                role: 'assistant',
                blocks: [{ kind: 'text', text: 'این متن کاملاً فارسی است' }],
            });

            const p = fixture.nativeElement.querySelector('p.block-text') as HTMLElement;
            const computed = window.getComputedStyle(p).unicodeBidi;
            expect(['plaintext', '-webkit-plaintext']).toContain(computed);
        });

        it('mixed Persian + English text renders the full string in a single paragraph', () => {
            const text = 'پاسخ: result is ۴۲ rows';
            render({
                role: 'assistant',
                blocks: [{ kind: 'text', text }],
            });

            const p = fixture.nativeElement.querySelector('p.block-text') as HTMLElement;
            expect(p.textContent?.trim()).toBe(text);
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
