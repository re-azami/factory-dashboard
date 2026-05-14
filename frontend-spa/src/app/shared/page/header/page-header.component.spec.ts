import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { NgxHelperDialogService } from '@webilix/ngx-helper';

import { PageHeaderComponent } from './page-header.component';
import { PageAboutComponent } from '../about/page-about.component';
import { IDeviceSize } from '../../interfaces/device-size';
import { IPageMenu } from '../../interfaces/page-menu';

/**
 * Unit tests for PageHeaderComponent.
 *
 * Edge-case checklist coverage:
 *  1. Empty / missing input      — covered: pageMenus=[] renders no menu items; loading=false
 *                                  hides progress bar.
 *  2. Boundary values            — covered: single menu item vs no menu items; size.isMobile
 *                                  true vs false changes header layout.
 *  3. Persian / Unicode text     — covered: title "داشبورد کارخانه", menu entry "داشبورد",
 *                                  about aria-label "درباره نرم‌افزار".
 *  4. Duplicate rows             — N/A: presentational component, no DB rows.
 *  5. Null DB columns            — N/A: no DB access.
 *  6. Calendar conversion        — N/A: no date logic.
 *  7. Permission denials         — N/A: no auth in this component.
 *  8. LLM provider switches      — N/A: client-side only.
 */
describe('PageHeaderComponent', () => {
    let fixture: ComponentFixture<PageHeaderComponent>;
    let component: PageHeaderComponent;
    let dialogService: jasmine.SpyObj<NgxHelperDialogService>;
    let router: jasmine.SpyObj<Router>;

    const desktopSize: IDeviceSize = { width: 1280, height: 800, isMobile: false };
    const mobileSize: IDeviceSize = { width: 400, height: 800, isMobile: true };

    beforeEach(async () => {
        dialogService = jasmine.createSpyObj<NgxHelperDialogService>('NgxHelperDialogService', ['open', 'close']);
        router = jasmine.createSpyObj<Router>('Router', ['navigate']);

        await TestBed.configureTestingModule({
            declarations: [PageHeaderComponent],
            imports: [
                NoopAnimationsModule,
                MatButtonModule,
                MatDividerModule,
                MatIconModule,
                MatMenuModule,
                MatProgressBarModule,
            ],
            providers: [
                { provide: NgxHelperDialogService, useValue: dialogService },
                { provide: Router, useValue: router },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(PageHeaderComponent);
        component = fixture.componentInstance;
    });

    function setInputs(menu: IPageMenu[], size: IDeviceSize, loading: boolean, id?: string): void {
        component.id = id;
        component.menu = menu;
        component.size = size;
        component.loading = loading;
        fixture.detectChanges();
    }

    it('creates without crashing when supplied with valid inputs', () => {
        setInputs([], desktopSize, false);
        expect(component).toBeTruthy();
    });

    it('renders the Persian app title "داشبورد کارخانه"', () => {
        setInputs([], desktopSize, false);

        const titleEl: HTMLElement | null = fixture.nativeElement.querySelector('.company');
        expect(titleEl).not.toBeNull();
        expect(titleEl!.textContent?.trim()).toBe('داشبورد کارخانه');
    });

    it('exposes applicationTitle as the Persian string', () => {
        expect(component.applicationTitle).toBe('داشبورد کارخانه');
    });

    it('renders a single menu entry "داشبورد" with icon "home" when provided', () => {
        const menu: IPageMenu[] = [
            {
                id: 'dashboard',
                title: 'داشبورد',
                icon: 'home',
                children: [{ title: 'داشبورد', action: ['/dashboard'] }],
            },
        ];
        setInputs(menu, desktopSize, false, 'dashboard');

        const buttonTitleEls = fixture.nativeElement.querySelectorAll('.menu-button-title');
        expect(buttonTitleEls.length).toBe(1);
        expect((buttonTitleEls[0] as HTMLElement).textContent?.trim()).toBe('داشبورد');

        const iconEls = fixture.nativeElement.querySelectorAll('.menu mat-icon');
        // First icon inside the menu region should be "home".
        expect(iconEls.length).toBeGreaterThanOrEqual(1);
        expect((iconEls[0] as HTMLElement).textContent?.trim()).toBe('home');
    });

    it('renders no menu items when menu array is empty', () => {
        setInputs([], desktopSize, false);

        const menuRegion = fixture.nativeElement.querySelector('.menu');
        expect(menuRegion).toBeNull();

        const buttonTitleEls = fixture.nativeElement.querySelectorAll('.menu-button-title');
        expect(buttonTitleEls.length).toBe(0);
    });

    it('about button exposes aria-label "درباره نرم‌افزار"', () => {
        setInputs([], desktopSize, false);

        const aboutBtn: HTMLButtonElement | null = fixture.nativeElement.querySelector(
            'button[aria-label="درباره نرم‌افزار"]',
        );
        expect(aboutBtn).not.toBeNull();
    });

    it('about button icon is "info"', () => {
        setInputs([], desktopSize, false);

        const aboutBtn: HTMLButtonElement | null = fixture.nativeElement.querySelector(
            'button[aria-label="درباره نرم‌افزار"]',
        );
        expect(aboutBtn).not.toBeNull();
        const icon = aboutBtn!.querySelector('mat-icon');
        expect(icon?.textContent?.trim()).toBe('info');
    });

    it('clicking the about button calls NgxHelperDialogService.open with PageAboutComponent + Persian title', () => {
        setInputs([], desktopSize, false);

        const aboutBtn: HTMLButtonElement | null = fixture.nativeElement.querySelector(
            'button[aria-label="درباره نرم‌افزار"]',
        );
        expect(aboutBtn).not.toBeNull();
        aboutBtn!.click();

        expect(dialogService.open).toHaveBeenCalledTimes(1);
        const args = dialogService.open.calls.mostRecent().args;
        expect(args[0]).toBe(PageAboutComponent);
        expect(args[1]).toBe('درباره نرم‌افزار');
        expect(args[2]).toEqual({ padding: '0px' });
    });

    it('click() on a single menu item with array action delegates to Router.navigate', () => {
        const menu: IPageMenu[] = [
            {
                id: 'dashboard',
                title: 'داشبورد',
                icon: 'home',
                children: [{ title: 'داشبورد', action: ['/dashboard'] }],
            },
        ];
        setInputs(menu, desktopSize, false, 'dashboard');

        component.click(menu[0].children[0]);

        expect(router.navigate).toHaveBeenCalledOnceWith(['/dashboard']);
    });

    it('click() on a menu item with a function action invokes the function (no router call)', () => {
        const action = jasmine.createSpy('action');
        const menu: IPageMenu[] = [
            {
                id: 'logout',
                title: 'خروج',
                icon: 'logout',
                children: [{ title: 'خروج', action }],
            },
        ];
        setInputs(menu, desktopSize, false);

        component.click(menu[0].children[0]);

        expect(action).toHaveBeenCalledTimes(1);
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it('click() on a DIVIDER is a no-op', () => {
        setInputs([], desktopSize, false);

        component.click('DIVIDER');

        expect(router.navigate).not.toHaveBeenCalled();
        expect(dialogService.open).not.toHaveBeenCalled();
    });

    it('renders the progress bar when loading=true and hides it when loading=false', () => {
        setInputs([], desktopSize, true);
        let bar = fixture.nativeElement.querySelector('mat-progress-bar');
        expect(bar).not.toBeNull();

        component.loading = false;
        fixture.detectChanges();
        bar = fixture.nativeElement.querySelector('mat-progress-bar');
        expect(bar).toBeNull();
    });

    it('mobile vs desktop layout: header-background suppressed when size.isMobile=true', () => {
        // Desktop: header-background div present.
        setInputs([], desktopSize, false);
        let bg = fixture.nativeElement.querySelector('.title .header-background');
        expect(bg).not.toBeNull();

        // Mobile: header-background div omitted.
        component.size = mobileSize;
        fixture.detectChanges();
        bg = fixture.nativeElement.querySelector('.title .header-background');
        expect(bg).toBeNull();
    });

    it('single-item menu button is disabled when size.isMobile=true', () => {
        const menu: IPageMenu[] = [
            {
                id: 'dashboard',
                title: 'داشبورد',
                icon: 'home',
                children: [{ title: 'داشبورد', action: ['/dashboard'] }],
            },
        ];
        setInputs(menu, mobileSize, false, 'dashboard');

        const btn: HTMLButtonElement | null = fixture.nativeElement.querySelector('.menu button[mat-button]');
        expect(btn).not.toBeNull();
        expect(btn!.disabled).toBeTrue();
    });
});
