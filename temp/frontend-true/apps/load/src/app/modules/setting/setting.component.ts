import { Component, OnInit } from '@angular/core';

import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, ISettingLoadRq, ISettingLoadRs } from '@lib/apis';
import { IPageTitle } from '@lib/page';
import { SettingService } from '@lib/providers';
import { Access, LoadCargoInfo, LoadCargoList, LoadFlow, LoadFlowInfo, LoadFlowList } from '@lib/shared';

import { LoadSettingService } from '../../providers';

@Component({
    host: { selector: 'setting' },
    templateUrl: './setting.component.html',
    styleUrl: './setting.component.scss',
    standalone: false
})
export class SettingComponent implements OnInit {
    public loadCargoList = LoadCargoList;
    public loadCargoInfo = LoadCargoInfo;

    public title: IPageTitle = { title: 'تنظیمات سیستم' };

    public activeTab: number = 0;

    public ngxForm: INgxResponsiveForm = {
        submit: 'ثبت تنظیمات عمومی',
        sections: [],
    };

    constructor(
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly loadSettingService: LoadSettingService,
        private readonly settingService: SettingService,
    ) {}

    ngOnInit(): void {
        this.setForm();
    }

    setForm(): void {
        if (this.activeTab !== 0) return;

        const accessOptions: { id: Access; title: string }[] = [
            { id: 'LOAD_ROLE_TRAFFIC', title: 'حراست' },
            { id: 'LOAD_ROLE_WEIGHT', title: 'باسکول' },
        ];

        this.ngxForm.sections = [
            {
                columns: [
                    {
                        inputs: [
                            {
                                name: 'report',
                                type: 'SELECT',
                                title: 'زمان گزارش',
                                value: this.loadSettingService.report,
                                options: [
                                    { id: 'CREATE', title: 'شروع فرایند' },
                                    { id: 'FINISH', title: 'پایان فرایند' },
                                ],
                                description:
                                    'زمان مربوط به فرآیند هر حواله ثبت شده در سیستم در گزارش اطلاعات، با استفاده از این گزینه مشخص می‌شود.',
                            },
                            {
                                name: 'remaining',
                                type: 'SELECT',
                                title: 'واحد نمایش باقیمانده بار در داشبورد',
                                value: this.loadSettingService.remaining,
                                options: [
                                    { id: 'KILO', title: 'کیلو' },
                                    { id: 'TON', title: 'تن' },
                                ],
                            },
                            {
                                name: 'order',
                                type: 'SELECT',
                                title: 'ترتیب نمایش لیست اطلاعات بارها',
                                value: this.loadSettingService.order,
                                options: [
                                    { id: 'TITLE', title: 'عنوان' },
                                    { id: 'DATE', title: 'تاریخ ثبت' },
                                ],
                                description:
                                    'این گزینه در هنگام نمایش لیست بارها در صفحات مدیریت و گزارش اطلاعات بارها در نظر گرفته می‌شود. ',
                            },
                            {
                                name: 'site',
                                type: 'CHECKBOX',
                                message: 'نمایش حواله‌های بارهای داخلی در صفحه حواله‌های روزانه',
                                value: this.loadSettingService.site,
                            },
                        ],
                    },
                    {
                        inputs: LoadFlowList.map((flow: LoadFlow) => ({
                            name: `flow_tools_${flow}`,
                            type: 'SELECT',
                            title: `امکانات صفحه ${LoadFlowInfo[flow].title}`,
                            value: this.loadSettingService.getTools(flow),
                            options: [
                                { id: 'PLATE', title: 'جستجوی پلاک' },
                                { id: 'SCAN', title: 'اسکن حواله' },
                                { id: 'BOTH', title: 'هر دو مورد' },
                            ],
                        })),
                    },
                ],
            },
            {
                title: 'تنظیمات باسکول',
                columns: [
                    {
                        inputs: [
                            {
                                name: 'weight-multiply',
                                type: 'NUMBER',
                                title: 'دقت باسکول',
                                value: this.loadSettingService.weight.multiply,
                                suffix: 'کیلو',
                                minimum: 1,
                                description:
                                    'وزن‌های ثبت شده در باسکول (برای ناوگان خالی و پر) باید مضربی از مقدار مشخص شده باشند. ' +
                                    'برای ایجاد امکان مشخص کردن هر مقداری در هنگام توزین، می‌توانید مقدار این گزینه را برابر با یک انتخاب کنید.',
                            },
                        ],
                    },
                    {
                        inputs: [
                            {
                                name: 'weight-empty',
                                type: 'NUMBER',
                                title: 'حداکثر وزن خالی ناوگان',
                                value: this.loadSettingService.weight.empty,
                                suffix: 'کیلو',
                                minimum: 10_000,
                                maximum: 99_999,
                            },
                            {
                                name: 'weight-full',
                                type: 'NUMBER',
                                title: 'حداقل وزن پر ناوگان',
                                value: this.loadSettingService.weight.full,
                                suffix: 'کیلو',
                                minimum: 10_000,
                                maximum: 99_999,
                            },
                        ],
                    },
                ],
            },
            {
                title: 'دسترسی‌های ویرایش حواله‌های فعال',
                description:
                    'این دسترسی‌ها فقط برای حواله‌های فعال در نظر گرفته شده است و گزارش آنها در بخش گزارش تغییرات حواله نمایش داده می‌شود.',
                columns: [
                    {
                        inputs: [
                            {
                                name: 'update-cargo',
                                type: 'SELECT',
                                title: 'ویرایش بار',
                                value: this.loadSettingService.update.cargo,
                                options: accessOptions,
                                optional: true,
                            },
                            {
                                name: 'update-plate',
                                type: 'SELECT',
                                title: 'ویرایش پلاک',
                                value: this.loadSettingService.update.plate,
                                options: accessOptions,
                                optional: true,
                            },
                        ],
                    },
                    {
                        inputs: [
                            {
                                name: 'update-transporter',
                                type: 'SELECT',
                                title: 'ویرایش باربری',
                                value: this.loadSettingService.update.transporter,
                                options: accessOptions,
                                optional: true,
                            },
                            {
                                name: 'update-weight',
                                type: 'SELECT',
                                title: 'ویرایش اطلاعات وزنی',
                                value: this.loadSettingService.update.weight,
                                options: accessOptions,
                                optional: true,
                            },
                        ],
                    },
                ],
            },
        ];
    }

    ngxSubmit(values: INgxFormValues): void {
        const body: ISettingLoadRq = {
            report: values['report'],
            remaining: values['remaining'],
            order: values['order'],
            site: values['site'],
            toolsPlate: [],
            toolsScan: [],
            weight: {
                multiply: values['weight-multiply'],
                empty: values['weight-empty'],
                full: values['weight-full'],
            },
            update: {
                cargo: values['update-cargo'],
                plate: values['update-plate'],
                transporter: values['update-transporter'],
                weight: values['update-weight'],
            },
        };
        LoadFlowList.forEach((flow: LoadFlow) => {
            if (values[`flow_tools_${flow}`] === 'PLATE') body.toolsPlate.push(flow);
            if (values[`flow_tools_${flow}`] === 'SCAN') body.toolsScan.push(flow);
        });
        this.apiService.request<ISettingLoadRs>('SettingLoad', { body }, (response) => {
            this.settingService.init(response);
            this.ngxHelperToastService.success('تنظیمات عمومی سیستم با موفقیت ثبت شد.');
        });
    }
}
