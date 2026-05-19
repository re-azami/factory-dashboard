import { Component, OnDestroy, OnInit } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, IUserDTO, IUserSignoutRs } from '@lib/apis';
import { NotificationService } from '@lib/modules';
import { IPageMenu } from '@lib/page';
import { UserService } from '@lib/providers';
import { AppInfo, LoadFlow, LoadFlowInfo, LoadFlowList } from '@lib/shared';

import {
    FlowSiteComponent,
    FlowWeightComponent,
    PrintDraftComponent,
    PrintProceedingsLoadComponent,
    PrintProceedingsTransporterComponent,
    PrintSettingComponent,
} from './components';
import { LoadToolsService } from './providers';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
    public menu: IPageMenu[] = [
        {
            id: 'DASHBOARD',
            icon: 'home',
            title: 'داشبورد',
            children: [{ title: 'داشبورد', action: ['/dashboard'] }],
        },
        {
            id: 'FLOW',
            icon: 'account_tree',
            title: 'فرایند',
            children: [
                { title: 'صدور حواله / بارکد', action: this.flowCreate.bind(this), access: { access: 'LOAD_ROLE_TRAFFIC' } },
                { title: 'توزین بار داخلی ', action: this.flowSite.bind(this), access: { access: 'LOAD_ROLE_WEIGHT' } },
                { title: 'توزین ناوگان ', action: this.flowWeight.bind(this), access: { access: 'LOAD_ROLE_WEIGHT' } },
                'DIVIDER',
                ...LoadFlowList.map((flow: LoadFlow) => ({
                    title: LoadFlowInfo[flow].title,
                    action: ['/flow', flow],
                    access: { access: LoadFlowInfo[flow].role },
                })),
            ],
        },
        {
            id: 'DRAFT',
            icon: 'assignment',
            title: 'حواله',
            children: [
                {
                    title: 'حواله‌های روزانه',
                    action: ['/draft', 'daily'],
                    access: {
                        access: [
                            'LOAD_DRAFT_DAILY',
                            'LOAD_ROLE_TRAFFIC',
                            'LOAD_ROLE_TRAFFIC_MINE',
                            'LOAD_ROLE_WEIGHT',
                            'LOAD_ROLE_LOADING',
                            'LOAD_ROLE_LOADING_MINE',
                            'LOAD_ROLE_DISCHARGE',
                        ],
                    },
                },
                'DIVIDER',
                {
                    title: 'حواله‌های فعال',
                    action: ['/draft', 'active'],
                    access: {
                        access: [
                            'LOAD_DRAFT_ACTIVE',
                            'LOAD_ROLE_TRAFFIC',
                            'LOAD_ROLE_TRAFFIC_MINE',
                            'LOAD_ROLE_WEIGHT',
                            'LOAD_ROLE_LOADING',
                            'LOAD_ROLE_LOADING_MINE',
                            'LOAD_ROLE_DISCHARGE',
                        ],
                    },
                },
                { title: 'حواله‌های قبلی', action: ['/draft', 'finished'], access: { access: 'LOAD_DRAFT_FINISHED' } },
                { title: 'حواله‌های لغو شده', action: ['/draft', 'canceled'], access: { access: 'LOAD_DRAFT_CANCELED' } },
                { title: 'حواله‌های ویرایش شده', action: ['/draft', 'updated'], access: { access: 'LOAD_DRAFT_UPDATED' } },
                'DIVIDER',
                {
                    title: 'مشاهده حواله',
                    action: this.draftInfo.bind(this),
                    access: {
                        access: [
                            'LOAD_DRAFT_ACTIVE',
                            'LOAD_DRAFT_FINISHED',
                            'LOAD_DRAFT_CANCELED',
                            'LOAD_DRAFT_UPDATED',
                            'LOAD_ROLE_TRAFFIC',
                            'LOAD_ROLE_TRAFFIC_MINE',
                            'LOAD_ROLE_WEIGHT',
                            'LOAD_ROLE_LOADING',
                            'LOAD_ROLE_LOADING_MINE',
                            'LOAD_ROLE_DISCHARGE',
                        ],
                    },
                },
                { title: 'ویرایش حواله', action: this.draftUpdate.bind(this), access: { access: 'LOAD_DRAFT_UPDATE' } },
                'DIVIDER',
                { title: 'لغو عمومی حواله‌ها', action: ['/draft', 'bulk-cancel'], access: { access: 'LOAD_FLOW_CANCEL' } },
            ],
        },
        {
            id: 'REPORT',
            icon: 'assessment',
            title: 'گزارش',
            children: [
                {
                    title: 'گزارش بارهای فعال',
                    action: ['/report', 'active'],
                    access: {
                        access: [
                            'LOAD_REPORT_ACTIVE',
                            'LOAD_ROLE_TRAFFIC',
                            'LOAD_ROLE_TRAFFIC_MINE',
                            'LOAD_ROLE_WEIGHT',
                            'LOAD_ROLE_LOADING',
                            'LOAD_ROLE_LOADING_MINE',
                            'LOAD_ROLE_DISCHARGE',
                        ],
                    },
                },
                'DIVIDER',
                { title: 'گزارش حواله', action: ['/report', 'draft'], access: { access: 'LOAD_REPORT_DRAFT' } },
                { title: 'گزارش روزانه', action: ['/report', 'daily'], access: { access: 'LOAD_REPORT_DAILY' } },
                'DIVIDER',
                { title: 'گزارش طرف حساب', action: ['/report', 'party'], access: { access: 'LOAD_REPORT_PARTY' } },
                { title: 'گزارش محموله', action: ['/report', 'shipment'], access: { access: 'LOAD_REPORT_SHIPMENT' } },
                { title: 'گزارش باربری', action: ['/report', 'transporter'], access: { access: 'LOAD_REPORT_TRANSPORTER' } },
                { title: 'گزارش بار', action: ['/report', 'cargo'], access: { access: 'LOAD_REPORT_CARGO' } },
                { title: 'گزارش مالک', action: ['/report', 'owner'], access: { access: 'LOAD_REPORT_OWNER' } },
                { title: 'گزارش ناوگان', action: this.reportTruck.bind(this), access: { access: 'LOAD_REPORT_TRUCK' } },
                'DIVIDER',
                {
                    title: 'گزارش روزانه باربری',
                    action: ['report', 'daily-transporter'],
                    access: { access: ['LOAD_REPORT_DAILY_TRANSPORTER', 'LOAD_ROLE_TRAFFIC', 'LOAD_ROLE_WEIGHT'] },
                },
            ],
        },
        {
            id: 'TOOLS',
            icon: 'workspaces',
            title: 'امکانات',
            children: [
                { title: 'مدیریت بارها', action: ['/cargo'], access: { access: 'LOAD_CARGO' } },
                'DIVIDER',
                { title: 'مدیریت طرف حساب‌ها', action: ['/party'], access: { access: 'LOAD_PARTY' } },
                { title: 'مدیریت محموله‌ها', action: ['/shipment'], access: { access: 'LOAD_SHIPMENT' } },
                { title: 'مدیریت محموله‌های متفرقه', action: ['/misc'], access: { access: 'LOAD_MISC' } },
                { title: 'مدیریت باربری‌ها', action: ['/transporter'], access: { access: 'LOAD_TRANSPORTER' } },
                'DIVIDER',
                { title: 'مدیریت مالک‌ها', action: ['/owner'], access: { access: 'LOAD_OWNER' } },
                { title: 'مدیریت ناوگان', action: ['/truck'], access: { access: 'LOAD_TRUCK' } },
                'DIVIDER',
                { title: 'مدیریت پرداخت‌ها', action: ['/checkout'], access: { access: 'LOAD_CHECKOUT' } },
                'DIVIDER',
                { title: 'تنظیمات سیستم', action: ['/setting'], access: { access: 'LOAD_SETTING' } },
            ],
        },
        {
            icon: 'print',
            title: 'پرینت',
            children: [
                {
                    title: 'پرینت حواله',
                    action: this.printDraft.bind(this),
                    access: {
                        access: [
                            'LOAD_DRAFT_ACTIVE',
                            'LOAD_DRAFT_FINISHED',
                            'LOAD_DRAFT_CANCELED',
                            'LOAD_ROLE_TRAFFIC',
                            'LOAD_ROLE_TRAFFIC_MINE',
                            'LOAD_ROLE_WEIGHT',
                            'LOAD_ROLE_LOADING',
                            'LOAD_ROLE_LOADING_MINE',
                            'LOAD_ROLE_DISCHARGE',
                        ],
                    },
                },
                {
                    title: 'تنظیمات پرینت',
                    action: this.printSetting.bind(this),
                    access: {
                        access: [
                            'LOAD_DRAFT_ACTIVE',
                            'LOAD_DRAFT_FINISHED',
                            'LOAD_DRAFT_CANCELED',
                            'LOAD_ROLE_TRAFFIC',
                            'LOAD_ROLE_TRAFFIC_MINE',
                            'LOAD_ROLE_WEIGHT',
                            'LOAD_ROLE_LOADING',
                            'LOAD_ROLE_LOADING_MINE',
                            'LOAD_ROLE_DISCHARGE',
                        ],
                    },
                },
                'DIVIDER',
                {
                    title: 'صورت جلسه باربری',
                    action: () => this.printProceedings('TRANSPORTER'),
                    access: { access: ['LOAD_ROLE_TRAFFIC', 'LOAD_ROLE_WEIGHT'] },
                },
                {
                    title: 'صورت جلسه آمار روزانه',
                    action: () => this.printProceedings('LOAD'),
                    access: { access: ['LOAD_ROLE_TRAFFIC', 'LOAD_ROLE_WEIGHT'] },
                },
            ],
        },
    ];

    public user?: IUserDTO;
    private onUserChanged?: Subscription;

    constructor(
        private router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly loadToolsService: LoadToolsService,
        private readonly notificationService: NotificationService,
        private readonly userService: UserService,
    ) {}

    ngOnInit(): void {
        this.user = this.userService.user;
        this.onUserChanged = this.userService.onUserChanged.subscribe({
            next: (user?: IUserDTO) => {
                this.user = user;
                this.checkUserAccess();
            },
        });

        setTimeout(this.checkUserAccess.bind(this), 0);
        this.notificationService.subscribe('LOAD');
    }

    ngOnDestroy(): void {
        this.onUserChanged?.unsubscribe();
        this.notificationService.unsubscribe();
    }

    checkUserAccess(): void {
        if (!this.user) return;

        if (!this.userService.hasAccess({ app: 'LOAD' })) {
            this.apiService.request<IUserSignoutRs>('UserSignout', { silent: true, loading: false });

            const error: string = `دسترسی‌ای برای سرویس ${AppInfo['LOAD'].title} برای شما ایجاد نشده است.`;
            this.ngxHelperToastService.error(error);
            this.userService.signout();
            this.router.navigate(['/']);
        }
    }

    flowCreate(): void {
        this.loadToolsService.createDraft();
    }

    flowSite(): void {
        this.ngxHelperBottomSheetService.open(FlowSiteComponent, 'توزین بار داخلی', { disableClose: true });
    }

    flowWeight(): void {
        this.ngxHelperBottomSheetService.open(FlowWeightComponent, 'توزین ناوگان', { disableClose: true });
    }

    draftInfo(): void {
        this.loadToolsService.draftCode((draft) => {
            this.router.navigate(['/draft', 'info', draft.id]);
        });
    }

    draftUpdate(): void {
        this.loadToolsService.draftCode((draft) => {
            if (draft.status === 'CANCELED') {
                this.ngxHelperToastService.error('امکان ویرایش اطلاعات حواله‌های لغو شده وجود ندارد.');
                return;
            }

            if (draft.status === 'FINISHED' && draft.payment && draft.payment.checkout && !!draft.payment.checkout.id) {
                this.ngxHelperToastService.error(
                    'امکان ویرایش اطلاعات حواله‌های پایان یافته که اطلاعات پرداخت هزینه حمل برای آنها ثبت شده است، وجود ندارد.',
                );
                return;
            }

            this.router.navigate(['/draft', 'update', draft.id]);
        });
    }

    reportTruck(): void {
        this.loadToolsService.selectTruck((truck) => this.router.navigate(['/report', 'truck', truck.id]));
    }

    printDraft(): void {
        this.ngxHelperBottomSheetService.open(PrintDraftComponent, 'پرینت حواله', { disableClose: true });
    }

    printSetting(): void {
        this.ngxHelperBottomSheetService.open(PrintSettingComponent, 'تنظیمات پرینت', { disableClose: true });
    }

    printProceedings(type: 'TRANSPORTER' | 'LOAD'): void {
        const title: string = type === 'TRANSPORTER' ? 'پرینت صورت جلسه باربری' : 'پرینت صورت جلسه آمار روزانه';
        const component: ComponentType<any> =
            type === 'TRANSPORTER' ? PrintProceedingsTransporterComponent : PrintProceedingsLoadComponent;
        this.ngxHelperBottomSheetService.open(component, title);
    }
}
