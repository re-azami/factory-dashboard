import { TestBed } from '@angular/core/testing';

import { PageService } from './page.service';
import { IPageTitle } from '../interfaces/page-title';

/**
 * Unit tests for PageService.
 *
 * Edge-case checklist coverage:
 *  1. Empty / missing input      — covered: setPageTitle() with undefined clears the title;
 *                                  pageTitle starts as undefined.
 *  2. Boundary values            — covered: zero subscribers, single subscriber, repeated emits.
 *  3. Persian / Unicode text     — covered: setting an IPageTitle whose title/description contain
 *                                  Persian characters preserves codepoints exactly.
 *  4. Duplicate rows             — N/A: service is stateless w.r.t. DB rows.
 *  5. Null DB columns            — N/A: service does not touch the database.
 *  6. Calendar conversion        — N/A: no date logic.
 *  7. Permission denials         — N/A: no auth/role logic.
 *  8. LLM provider switches      — N/A: client-side only.
 */
describe('PageService', () => {
    let service: PageService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PageService);
    });

    it('pageTitle starts as undefined', () => {
        expect(service.pageTitle).toBeUndefined();
    });

    it('setPageTitle(title) updates pageTitle getter', () => {
        const title: IPageTitle = { title: 'داشبورد', description: 'صفحه اصلی' };
        service.setPageTitle(title);

        expect(service.pageTitle).toEqual(title);
    });

    it('setPageTitle(title) emits the new title on onPageTitleChanged', () => {
        const received: (IPageTitle | undefined)[] = [];
        const sub = service.onPageTitleChanged.subscribe((t) => received.push(t));

        const title: IPageTitle = { title: 'داشبورد کارخانه' };
        service.setPageTitle(title);

        expect(received.length).toBe(1);
        expect(received[0]).toEqual(title);

        sub.unsubscribe();
    });

    it('setPageTitle() with undefined clears the title and emits undefined', () => {
        service.setPageTitle({ title: 'داشبورد' });
        expect(service.pageTitle).toBeDefined();

        const received: (IPageTitle | undefined)[] = [];
        const sub = service.onPageTitleChanged.subscribe((t) => received.push(t));

        service.setPageTitle(undefined);

        expect(service.pageTitle).toBeUndefined();
        expect(received.length).toBe(1);
        expect(received[0]).toBeUndefined();

        sub.unsubscribe();
    });

    it('preserves Persian / Unicode codepoints exactly through setPageTitle', () => {
        // Persian + RTL marks + mixed English digits — must round-trip without mutation.
        const persianTitle: IPageTitle = {
            title: 'گزارش روزانه ۱۴۰۵/۰۲/۱۴',
            description: 'علت توقف کارخانه — line 1',
        };
        service.setPageTitle(persianTitle);

        expect(service.pageTitle?.title).toBe('گزارش روزانه ۱۴۰۵/۰۲/۱۴');
        expect(service.pageTitle?.description).toBe('علت توقف کارخانه — line 1');
        // Verify exact codepoint preservation (no normalization).
        expect(Array.from(service.pageTitle?.title ?? '').length).toBe(
            Array.from('گزارش روزانه ۱۴۰۵/۰۲/۱۴').length,
        );
    });

    it('onPageTitleChanged is multicast (Subject) — does not replay past values to late subscribers', () => {
        service.setPageTitle({ title: 'داشبورد' });

        const received: (IPageTitle | undefined)[] = [];
        const sub = service.onPageTitleChanged.subscribe((t) => received.push(t));

        // No emission should arrive yet because Subject does not replay.
        expect(received.length).toBe(0);

        service.setPageTitle({ title: 'پروفایل' });
        expect(received.length).toBe(1);
        expect(received[0]).toEqual({ title: 'پروفایل' });

        sub.unsubscribe();
    });

    it('emits on every setPageTitle call, including identical values', () => {
        const received: (IPageTitle | undefined)[] = [];
        const sub = service.onPageTitleChanged.subscribe((t) => received.push(t));

        const title: IPageTitle = { title: 'داشبورد' };
        service.setPageTitle(title);
        service.setPageTitle(title);
        service.setPageTitle(title);

        // No de-duping logic in the implementation — three calls, three emissions.
        expect(received.length).toBe(3);

        sub.unsubscribe();
    });
});
