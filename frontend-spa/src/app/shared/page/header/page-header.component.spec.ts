import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

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
import { AppService, ColorMode } from '../../services/app.service';

/**
 * Unit tests for PageHeaderComponent.
 *
 * Edge-case checklist coverage:
 *  1. Empty / missing input      — covered: pageMenus=[] renders no menu items; loading=false
 *                                  hides progress bar; AppService.colorMode defaults to LIGHT.
 *  2. Boundary values            — covered: single menu item vs no menu items; size.isMobile
 *                                  true vs false changes header layout; colorMode toggled once
 *                                  flips icon + aria-label; subscription updates local state.
 *  3. Persian / Unicode text     — covered: title "داشبورد کارخانه", menu entry "داشبورد",
 *                                  about aria-label "درباره نرم‌افزار", color-mode aria-labels
 *                                  "تغییر به حالت تاریک" / "تغییر به حالت روشن".
 *  4. Duplicate rows             — N/A: presentational component, no DB rows.
 *  5. Null DB columns            — N/A: no DB access.
 *  6. Calendar conversion        — N/A: no date logic.
 *  7. Permission denials         — N/A: no auth in this component.
 *  8. LLM provider switches      — N/A: client-side only.
 */
const COLOR_MODE_STORAGE_KEY = 'factory-dashboard:color-mode';
const DARK_MODE_CLASS = 'dark-mode';

describe('PageHeaderComponent', () => {
    let fixture: ComponentFixture<PageHeaderComponent>;
    let component: PageHeaderComponent;
    let dialogService: jasmine.SpyObj<NgxHelperDialogService>;
    let router: jasmine.SpyObj<Router>;

    const desktopSize: IDeviceSize = { width: 1280, height: 800, isMobile: false };
    const mobileSize: IDeviceSize = { width: 400, height: 800, isMobile: true };

    beforeEach(async () => {
        // Reset color-mode state so the real AppService constructor starts from a clean slate.
        try {
            window.localStorage.removeItem(COLOR_MODE_STORAGE_KEY);
        } catch {
            /* ignore — storage may be disabled in some environments */
        }
        document.documentElement.classList.remove(DARK_MODE_CLASS);

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

    afterEach(() => {
        try {
            window.localStorage.removeItem(COLOR_MODE_STORAGE_KEY);
        } catch {
            /* ignore */
        }
        document.documentElement.classList.remove(DARK_MODE_CLASS);
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

    /**
     * Color-mode toggle button tests. The component reads its initial `colorMode` from
     * AppService.colorMode in ngOnInit and subscribes to AppService.onColorModeChanged.
     * Click delegates to AppService.toggleColorMode().
     *
     * We isolate these tests via TestBed.overrideProvider so each one can control the
     * AppService spy independently — the suite-level `beforeEach` already configured a
     * real AppService, but TestBed.overrideProvider is honored as long as it is called
     * before TestBed.createComponent in our local helper.
     */
    describe('color-mode toggle', () => {
        function buildHeaderWithAppService(spy: jasmine.SpyObj<AppService>): {
            fixture: ComponentFixture<PageHeaderComponent>;
            component: PageHeaderComponent;
        } {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
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
                    { provide: AppService, useValue: spy },
                ],
            });

            const localFixture = TestBed.createComponent(PageHeaderComponent);
            const localComponent = localFixture.componentInstance;
            localComponent.id = undefined;
            localComponent.menu = [];
            localComponent.size = desktopSize;
            localComponent.loading = false;
            localFixture.detectChanges();
            return { fixture: localFixture, component: localComponent };
        }

        function makeAppServiceSpy(
            initialMode: ColorMode,
            subject: Subject<ColorMode>,
        ): jasmine.SpyObj<AppService> {
            return jasmine.createSpyObj<AppService>(
                'AppService',
                ['toggleColorMode'],
                {
                    colorMode: initialMode,
                    onColorModeChanged: subject.asObservable(),
                },
            );
        }

        it('renders the toggle button with Persian aria-label "تغییر به حالت تاریک" when in LIGHT mode', () => {
            const subject = new Subject<ColorMode>();
            const spy = makeAppServiceSpy('LIGHT', subject);
            const built = buildHeaderWithAppService(spy);

            const btn: HTMLButtonElement | null = built.fixture.nativeElement.querySelector(
                'button[aria-label="تغییر به حالت تاریک"]',
            );
            expect(btn).not.toBeNull();
        });

        it('toggle button icon is "dark_mode" when in LIGHT mode', () => {
            const subject = new Subject<ColorMode>();
            const spy = makeAppServiceSpy('LIGHT', subject);
            const built = buildHeaderWithAppService(spy);

            const btn: HTMLButtonElement | null = built.fixture.nativeElement.querySelector(
                'button[aria-label="تغییر به حالت تاریک"]',
            );
            expect(btn).not.toBeNull();
            const icon = btn!.querySelector('mat-icon');
            expect(icon?.textContent?.trim()).toBe('dark_mode');
        });

        it('renders the toggle button with Persian aria-label "تغییر به حالت روشن" when in DARK mode', () => {
            const subject = new Subject<ColorMode>();
            const spy = makeAppServiceSpy('DARK', subject);
            const built = buildHeaderWithAppService(spy);

            const btn: HTMLButtonElement | null = built.fixture.nativeElement.querySelector(
                'button[aria-label="تغییر به حالت روشن"]',
            );
            expect(btn).not.toBeNull();
        });

        it('toggle button icon is "light_mode" when in DARK mode', () => {
            const subject = new Subject<ColorMode>();
            const spy = makeAppServiceSpy('DARK', subject);
            const built = buildHeaderWithAppService(spy);

            const btn: HTMLButtonElement | null = built.fixture.nativeElement.querySelector(
                'button[aria-label="تغییر به حالت روشن"]',
            );
            expect(btn).not.toBeNull();
            const icon = btn!.querySelector('mat-icon');
            expect(icon?.textContent?.trim()).toBe('light_mode');
        });

        it('toggle button appears BEFORE the about button inside the .icons region', () => {
            const subject = new Subject<ColorMode>();
            const spy = makeAppServiceSpy('LIGHT', subject);
            const built = buildHeaderWithAppService(spy);

            const iconsRegion: HTMLElement | null = built.fixture.nativeElement.querySelector('.icons');
            expect(iconsRegion).not.toBeNull();

            const buttons = iconsRegion!.querySelectorAll('button');
            expect(buttons.length).toBeGreaterThanOrEqual(2);

            const ariaLabels = Array.from(buttons).map((b) => b.getAttribute('aria-label'));
            const toggleIdx = ariaLabels.indexOf('تغییر به حالت تاریک');
            const aboutIdx = ariaLabels.indexOf('درباره نرم‌افزار');
            expect(toggleIdx).toBeGreaterThanOrEqual(0);
            expect(aboutIdx).toBeGreaterThanOrEqual(0);
            expect(toggleIdx).toBeLessThan(aboutIdx);
        });

        it('clicking the toggle button delegates to AppService.toggleColorMode()', () => {
            const subject = new Subject<ColorMode>();
            const spy = makeAppServiceSpy('LIGHT', subject);
            const built = buildHeaderWithAppService(spy);

            const btn: HTMLButtonElement | null = built.fixture.nativeElement.querySelector(
                'button[aria-label="تغییر به حالت تاریک"]',
            );
            expect(btn).not.toBeNull();
            btn!.click();

            expect(spy.toggleColorMode).toHaveBeenCalledTimes(1);
        });

        it('component.toggleColorMode() (programmatic) also delegates to AppService.toggleColorMode()', () => {
            const subject = new Subject<ColorMode>();
            const spy = makeAppServiceSpy('LIGHT', subject);
            const built = buildHeaderWithAppService(spy);

            built.component.toggleColorMode();

            expect(spy.toggleColorMode).toHaveBeenCalledTimes(1);
        });

        it('hydrates local colorMode from AppService.colorMode on init (DARK case)', () => {
            const subject = new Subject<ColorMode>();
            const spy = makeAppServiceSpy('DARK', subject);
            const built = buildHeaderWithAppService(spy);

            expect(built.component.colorMode).toBe('DARK');
        });

        it('hydrates local colorMode from AppService.colorMode on init (LIGHT case)', () => {
            const subject = new Subject<ColorMode>();
            const spy = makeAppServiceSpy('LIGHT', subject);
            const built = buildHeaderWithAppService(spy);

            expect(built.component.colorMode).toBe('LIGHT');
        });

        it('subscription updates the local colorMode field and re-renders aria-label/icon', () => {
            const subject = new Subject<ColorMode>();
            const spy = makeAppServiceSpy('LIGHT', subject);
            const built = buildHeaderWithAppService(spy);

            // Initially LIGHT.
            let btn: HTMLButtonElement | null = built.fixture.nativeElement.querySelector(
                'button[aria-label="تغییر به حالت تاریک"]',
            );
            expect(btn).not.toBeNull();
            expect(btn!.querySelector('mat-icon')?.textContent?.trim()).toBe('dark_mode');

            // Service emits DARK.
            subject.next('DARK');
            built.fixture.detectChanges();

            expect(built.component.colorMode).toBe('DARK');
            btn = built.fixture.nativeElement.querySelector('button[aria-label="تغییر به حالت روشن"]');
            expect(btn).not.toBeNull();
            expect(btn!.querySelector('mat-icon')?.textContent?.trim()).toBe('light_mode');

            // Service emits LIGHT again (boundary: toggle back to original).
            subject.next('LIGHT');
            built.fixture.detectChanges();

            expect(built.component.colorMode).toBe('LIGHT');
            btn = built.fixture.nativeElement.querySelector('button[aria-label="تغییر به حالت تاریک"]');
            expect(btn).not.toBeNull();
            expect(btn!.querySelector('mat-icon')?.textContent?.trim()).toBe('dark_mode');
        });

        it('ngOnDestroy unsubscribes from onColorModeChanged (no late updates after destroy)', () => {
            const subject = new Subject<ColorMode>();
            const spy = makeAppServiceSpy('LIGHT', subject);
            const built = buildHeaderWithAppService(spy);

            expect(built.component.colorMode).toBe('LIGHT');

            built.fixture.destroy();

            // After destroy, late emissions must not mutate the (now-detached) component.
            subject.next('DARK');

            expect(built.component.colorMode).toBe('LIGHT');
        });
    });
});
