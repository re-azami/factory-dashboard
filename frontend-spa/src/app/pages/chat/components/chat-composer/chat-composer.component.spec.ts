import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { ChatComposerComponent } from './chat-composer.component';

/**
 * Unit tests for ChatComposerComponent.
 *
 * Uses the real Material form-field / button-toggle / input modules so the textarea
 * placeholder + button states resolve to a stable DOM. Animations are disabled.
 *
 * Edge-case checklist coverage:
 *  1. Empty / missing input      — covered: blank textarea disables send; whitespace-only
 *                                  text still disables send (sendDisabled getter).
 *  2. Boundary values            — covered: single-character text enables send; Enter vs
 *                                  Shift+Enter; disabled vs enabled.
 *  3. Persian / Unicode text     — covered: placeholder asserted by codepoint; Persian
 *                                  question text round-trips through submitted emit; mode
 *                                  toggle button labels «ساده» / «پژوهش عمیق».
 *  4. Duplicate rows             — N/A: composer is stateless w.r.t. messages.
 *  5. Null DB columns            — N/A: no DB access.
 *  6. Calendar conversion        — N/A: no date logic.
 *  7. Permission denials         — N/A: no auth.
 *  8. LLM provider switches      — N/A: composer is provider-agnostic.
 */
describe('ChatComposerComponent', () => {
    let fixture: ComponentFixture<ChatComposerComponent>;
    let component: ChatComposerComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChatComposerComponent],
            imports: [
                NoopAnimationsModule,
                ReactiveFormsModule,
                MatButtonModule,
                MatButtonToggleModule,
                MatFormFieldModule,
                MatIconModule,
                MatInputModule,
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ChatComposerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    function host(): HTMLElement {
        return fixture.nativeElement as HTMLElement;
    }

    function textarea(): HTMLTextAreaElement {
        const el = host().querySelector('textarea') as HTMLTextAreaElement | null;
        if (!el) throw new Error('textarea not found');
        return el;
    }

    function sendButton(): HTMLButtonElement {
        const el = host().querySelector('button[aria-label="ارسال پیام"]') as HTMLButtonElement | null;
        if (!el) throw new Error('send button not found');
        return el;
    }

    function clearButton(): HTMLButtonElement {
        const el = host().querySelector('button.clear-button') as HTMLButtonElement | null;
        if (!el) throw new Error('clear button not found');
        return el;
    }

    // ── Static rendering ─────────────────────────────────────────────────────

    it('creates without crashing', () => {
        expect(component).toBeTruthy();
    });

    it('renders the textarea with placeholder «سؤال خود را به فارسی یا انگلیسی بنویسید…»', () => {
        expect(textarea().getAttribute('placeholder')).toBe(
            'سؤال خود را به فارسی یا انگلیسی بنویسید…',
        );
    });

    it('renders the send button with text «ارسال» and accessible name «ارسال پیام»', () => {
        const btn = sendButton();
        expect(btn).toBeTruthy();
        expect(btn.textContent).toContain('ارسال');
        expect(btn.getAttribute('aria-label')).toBe('ارسال پیام');
    });

    it('renders the clear button with Persian text «پاک کردن گفتگو»', () => {
        const btn = clearButton();
        expect(btn.textContent).toContain('پاک کردن گفتگو');
    });

    it('renders the mode toggle group with «ساده» and «پژوهش عمیق» options', () => {
        const toggles = Array.from(host().querySelectorAll('mat-button-toggle')) as HTMLElement[];
        expect(toggles.length).toBe(2);
        const texts = toggles.map((t) => t.textContent?.trim());
        expect(texts).toContain('ساده');
        expect(texts).toContain('پژوهش عمیق');
    });

    it('mode toggle group has the Persian aria-label «حالت عامل»', () => {
        const group = host().querySelector('mat-button-toggle-group') as HTMLElement | null;
        expect(group).not.toBeNull();
        expect(group!.getAttribute('aria-label')).toBe('حالت عامل');
    });

    // ── Send-button enable/disable ──────────────────────────────────────────

    describe('send button enable/disable', () => {
        it('disabled when textarea is blank (empty input edge-case)', () => {
            expect(component.sendDisabled).toBeTrue();
            expect(sendButton().disabled).toBeTrue();
        });

        it('disabled when textarea is whitespace-only', () => {
            component.text.setValue('   \n   ');
            fixture.detectChanges();
            expect(component.sendDisabled).toBeTrue();
            expect(sendButton().disabled).toBeTrue();
        });

        it('enabled when textarea has at least one non-whitespace character (boundary)', () => {
            component.text.setValue('a');
            fixture.detectChanges();
            expect(component.sendDisabled).toBeFalse();
            expect(sendButton().disabled).toBeFalse();
        });

        it('disabled when the `disabled` input is true (e.g. mid-stream) even if textarea has text', () => {
            component.text.setValue('hello');
            component.disabled = true;
            fixture.detectChanges();
            expect(component.sendDisabled).toBeTrue();
            expect(sendButton().disabled).toBeTrue();
        });
    });

    // ── Submission ──────────────────────────────────────────────────────────

    describe('submission', () => {
        it('clicking send emits the trimmed text on `submitted` and clears the textarea', () => {
            const emitted: string[] = [];
            component.submitted.subscribe((v: string) => emitted.push(v));

            component.text.setValue('  hello  ');
            fixture.detectChanges();
            sendButton().click();

            expect(emitted).toEqual(['hello']);
            expect(component.text.value).toBe('');
        });

        it('pressing Enter (no Shift) in the textarea submits and clears the field', () => {
            const emitted: string[] = [];
            component.submitted.subscribe((v: string) => emitted.push(v));

            component.text.setValue('سؤال فارسی');
            fixture.detectChanges();

            const event = new KeyboardEvent('keydown', {
                key: 'Enter',
                shiftKey: false,
                bubbles: true,
                cancelable: true,
            });
            const preventSpy = spyOn(event, 'preventDefault').and.callThrough();
            textarea().dispatchEvent(event);
            fixture.detectChanges();

            expect(emitted).toEqual(['سؤال فارسی']);
            expect(component.text.value).toBe('');
            expect(preventSpy).toHaveBeenCalled();
        });

        it('Shift+Enter does NOT submit and does NOT prevent default (newline insertion left to browser)', () => {
            const emitted: string[] = [];
            component.submitted.subscribe((v: string) => emitted.push(v));

            component.text.setValue('line 1');
            fixture.detectChanges();

            const event = new KeyboardEvent('keydown', {
                key: 'Enter',
                shiftKey: true,
                bubbles: true,
                cancelable: true,
            });
            const preventSpy = spyOn(event, 'preventDefault').and.callThrough();
            textarea().dispatchEvent(event);
            fixture.detectChanges();

            expect(emitted).toEqual([]);
            // Text field is NOT cleared because no submit occurred.
            expect(component.text.value).toBe('line 1');
            expect(preventSpy).not.toHaveBeenCalled();
        });

        it('non-Enter keypress is a no-op (no submit, no preventDefault)', () => {
            const emitted: string[] = [];
            component.submitted.subscribe((v: string) => emitted.push(v));

            component.text.setValue('abc');
            fixture.detectChanges();

            const event = new KeyboardEvent('keydown', {
                key: 'a',
                shiftKey: false,
                bubbles: true,
                cancelable: true,
            });
            const preventSpy = spyOn(event, 'preventDefault').and.callThrough();
            textarea().dispatchEvent(event);

            expect(emitted).toEqual([]);
            expect(component.text.value).toBe('abc');
            expect(preventSpy).not.toHaveBeenCalled();
        });

        it('Enter on a blank textarea does not emit (send is disabled)', () => {
            const emitted: string[] = [];
            component.submitted.subscribe((v: string) => emitted.push(v));

            const event = new KeyboardEvent('keydown', {
                key: 'Enter',
                bubbles: true,
                cancelable: true,
            });
            textarea().dispatchEvent(event);

            expect(emitted).toEqual([]);
        });

        it('Enter while `disabled` input is true does not emit', () => {
            const emitted: string[] = [];
            component.submitted.subscribe((v: string) => emitted.push(v));

            component.text.setValue('ready');
            component.disabled = true;
            fixture.detectChanges();

            const event = new KeyboardEvent('keydown', {
                key: 'Enter',
                bubbles: true,
                cancelable: true,
            });
            textarea().dispatchEvent(event);

            expect(emitted).toEqual([]);
            // Text remains because submission was rejected.
            expect(component.text.value).toBe('ready');
        });
    });

    // ── Mode change ─────────────────────────────────────────────────────────

    describe('mode change', () => {
        it("emits 'deep' on `modeChange` when programmatic onModeChange('deep') is called from 'simple'", () => {
            const emitted: string[] = [];
            component.modeChange.subscribe((v: string) => emitted.push(v));

            expect(component.mode).toBe('simple');
            component.onModeChange('deep');

            expect(emitted).toEqual(['deep']);
        });

        it("emits 'simple' on `modeChange` when toggling from 'deep'", () => {
            component.mode = 'deep';
            fixture.detectChanges();

            const emitted: string[] = [];
            component.modeChange.subscribe((v: string) => emitted.push(v));

            component.onModeChange('simple');
            expect(emitted).toEqual(['simple']);
        });

        it('does NOT emit when the selected mode equals the current mode (idempotency)', () => {
            const emitted: string[] = [];
            component.modeChange.subscribe((v: string) => emitted.push(v));

            component.onModeChange('simple'); // already 'simple'
            expect(emitted).toEqual([]);
        });

        it('ignores invalid mode values (rejects garbage input)', () => {
            const emitted: string[] = [];
            component.modeChange.subscribe((v: string) => emitted.push(v));

            component.onModeChange('ultra-deep' as 'deep');
            expect(emitted).toEqual([]);
        });

        it('mode toggle group is disabled when `disabled` input is true', () => {
            component.disabled = true;
            fixture.detectChanges();

            const group = host().querySelector('mat-button-toggle-group') as HTMLElement;
            // Material reflects [disabled]="true" onto an aria-disabled attribute on the group
            // and disables the inner toggles. Check the underlying buttons.
            const innerButtons = Array.from(host().querySelectorAll('mat-button-toggle button')) as HTMLButtonElement[];
            expect(innerButtons.length).toBeGreaterThan(0);
            for (const btn of innerButtons) {
                expect(btn.disabled).toBeTrue();
            }
            // The group element itself should still exist.
            expect(group).not.toBeNull();
        });
    });

    // ── Clear ───────────────────────────────────────────────────────────────

    describe('clear', () => {
        it('emits `cleared` when the clear button is clicked', () => {
            let count = 0;
            component.cleared.subscribe(() => (count += 1));

            clearButton().click();
            expect(count).toBe(1);
        });

        it('clear button stays enabled even when `disabled` input is true (so the user can abort a streaming reply)', () => {
            component.disabled = true;
            fixture.detectChanges();
            expect(clearButton().disabled).toBeFalse();
        });

        it('clear button is enabled by default (textarea state has no effect on it)', () => {
            // The clear button is independent of both `disabled` and the textarea content:
            // the user must always be able to abort a streaming reply or wipe history,
            // even before any text was typed.
            expect(clearButton().disabled).toBeFalse();
        });
    });
});
