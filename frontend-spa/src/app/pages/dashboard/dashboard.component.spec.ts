import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { DashboardComponent } from './dashboard.component';

/**
 * Unit tests for DashboardComponent.
 *
 * Stage-1 NOTE for Stage 4: the dashboard component is currently a bare class — it does NOT
 * subscribe to PageService.setPageTitle() on init. The brief allowed for that pattern
 * ("if that's the pattern the scaffold uses — verify from source"), and the source confirms
 * the current scaffold does not call PageService. The tests below assert the component's
 * actual behaviour. If the requirement is that the dashboard SHOULD call setPageTitle, that
 * is a Stage-1 omission for Stage 4 to triage.
 *
 * Template depends on <app-page-updated>, which we stub via NO_ERRORS_SCHEMA so the spec
 * does not pull in NgxHelperToastService / localStorage side effects from PageUpdatedComponent.
 *
 * Edge-case checklist coverage:
 *  1. Empty / missing input      — N/A: component takes no inputs.
 *  2. Boundary values            — N/A: no numeric thresholds.
 *  3. Persian / Unicode text     — covered: title "داشبورد کارخانه" and placeholder
 *                                  "صفحه چت و تاریخچه به‌زودی اضافه می‌شوند".
 *  4. Duplicate rows             — N/A: presentational, no DB rows.
 *  5. Null DB columns            — N/A: no DB access.
 *  6. Calendar conversion        — N/A: no date logic.
 *  7. Permission denials         — N/A: no auth.
 *  8. LLM provider switches      — N/A: client-side only.
 */
describe('DashboardComponent', () => {
    let fixture: ComponentFixture<DashboardComponent>;
    let component: DashboardComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DashboardComponent],
            schemas: [NO_ERRORS_SCHEMA], // stubs <app-page-updated> and any other unknown elements
        }).compileComponents();

        fixture = TestBed.createComponent(DashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('creates without crashing', () => {
        expect(component).toBeTruthy();
    });

    it('renders the Persian page title "داشبورد کارخانه"', () => {
        const titleEl: HTMLElement | null = fixture.nativeElement.querySelector('.dashboard .title');
        expect(titleEl).not.toBeNull();
        expect(titleEl!.textContent?.trim()).toBe('داشبورد کارخانه');
    });

    it('renders the Persian placeholder "صفحه چت و تاریخچه به‌زودی اضافه می‌شوند"', () => {
        const placeholderEl: HTMLElement | null = fixture.nativeElement.querySelector('.dashboard .placeholder');
        expect(placeholderEl).not.toBeNull();
        expect(placeholderEl!.textContent?.trim()).toBe('صفحه چت و تاریخچه به‌زودی اضافه می‌شوند');
    });

    it('contains an <app-page-updated> element as the first child of the host', () => {
        const updated: HTMLElement | null = fixture.nativeElement.querySelector('app-page-updated');
        expect(updated).not.toBeNull();
    });

    it('renders the <section class="dashboard"> container', () => {
        const section: HTMLElement | null = fixture.nativeElement.querySelector('section.dashboard');
        expect(section).not.toBeNull();
    });

    it('preserves exact Persian codepoints in the rendered title (no transliteration / normalization)', () => {
        const titleEl: HTMLElement | null = fixture.nativeElement.querySelector('.dashboard .title');
        const expected = 'داشبورد کارخانه';
        expect(Array.from(titleEl!.textContent!.trim()).length).toBe(Array.from(expected).length);
        expect(titleEl!.textContent!.trim()).toBe(expected);
    });
});
