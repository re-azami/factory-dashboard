import { Component, OnInit } from '@angular/core';

import { INgxFormValues, INgxResponsiveForm, NgxFormInputs } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, IOptionDTO, ISettingLaboratoryRq, ISettingLaboratoryRs } from '@lib/apis';
import { IPageTitle } from '@lib/page';
import { SettingService } from '@lib/providers';
import {
    LaboratoryCrusher,
    LaboratoryCrusherInfo,
    LaboratoryCrusherList,
    LaboratoryKhatka,
    LaboratoryKhatkaInfo,
    LaboratoryKhatkaList,
    LaboratoryResult,
    LaboratoryResultInfo,
    LaboratoryResultList,
} from '@lib/shared';

@Component({
    host: { selector: 'setting' },
    templateUrl: './setting.component.html',
    styleUrl: './setting.component.scss',
    standalone: false
})
export class SettingComponent implements OnInit {
    public ngxForm: INgxResponsiveForm = {
        submit: 'ثبت تنظیمات',
        sections: [
            {
                columns: [
                    {
                        inputs: [
                            {
                                name: 'jumpActive',
                                type: 'CHECKBOX',
                                message: 'فعال بودن سیستم حرکت بین خانه‌های فرم اطلاعات آزمایش دانه‌بندی',
                                value: this.settingService.laboratory.jump.active,
                                description:
                                    'در صورت انتخاب این گزینه، در هنگام ثبت اطلاعات مربوط به آزمایش دانه‌بندی، کاربر می‌تواند با استفاده از کلیدهای ' +
                                    'راست و چپ، بین خانه‌های فرم حرکت کند.',
                            },
                            {
                                name: 'jumpKey',
                                type: 'SELECT',
                                title: 'کلید اضافه برای حرکت بین خانه‌ها',
                                value: this.settingService.laboratory.jump.key,
                                disableOn: (values: INgxFormValues) => values['jumpActive'] !== true,
                                options: [
                                    { id: 'SHIFT', title: 'SHIFT' },
                                    { id: 'CTRL', title: 'CTRL' },
                                ],
                                english: true,
                                optional: true,
                                description:
                                    'در صورت انتخاب این گزینه، برای حرکت بین خانه‌های فرم آزمابش دانه‌بندی، علاوه بر کلیدهای راست و چپ،  ' +
                                    'کاربر باید کلید مشخص شده را نیز گرفته باشد.',
                            },
                        ],
                    },
                    {
                        inputs: [
                            {
                                name: 'dailyDate',
                                type: 'SELECT',
                                title: 'نمایش تاریخ گزارش بارهای روزانه',
                                value: this.settingService.laboratory.dailyDate,
                                options: [
                                    { id: 'TITLE', title: 'نمایش به حروف' },
                                    { id: 'NUMBER', title: 'نمایش عددی' },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    };

    public title: IPageTitle = { title: 'تنظیمات سیستم' };

    constructor(
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly settingService: SettingService,
    ) {}

    ngOnInit(): void {
        const options: IOptionDTO[] = LaboratoryResultList.map((result: LaboratoryResult) => ({
            id: result,
            title: LaboratoryResultInfo[result].title,
        }));

        const crusher: NgxFormInputs[] = [];
        LaboratoryCrusherList.forEach((test: LaboratoryCrusher) => {
            crusher.push({
                name: `crusher-${test}`,
                type: 'MULTI-SELECT',
                title: LaboratoryCrusherInfo[test].title,
                options,
                view: 'SELECT',
                value: LaboratoryResultList.filter((t) => this.settingService.laboratory.crusher.includes(`${test}::${t}`)),
            });
        });

        const khatka: NgxFormInputs[] = [];
        LaboratoryKhatkaList.forEach((test: LaboratoryKhatka) => {
            khatka.push({
                name: `khatka-${test}`,
                type: 'MULTI-SELECT',
                title: LaboratoryKhatkaInfo[test].title,
                options,
                view: 'SELECT',
                value: LaboratoryResultList.filter((t) => this.settingService.laboratory.khatka.includes(`${test}::${t}`)),
            });
        });

        const description: string =
            'آزمایش‌های مشخص شده در بخش‌های زیر، به صورت غیرفعال در سیستم نمایش داده شده و امکان ثبت نتیجه برای آنها وجود نخواهد داشت.';
        this.ngxForm.sections.push({
            columns: [
                { title: 'آزمایش‌های غیرفعال سنگ شکن', description, inputs: crusher },
                { title: 'آزمایش‌های غیرفعال ختکا', description, inputs: khatka },
            ],
        });
    }

    ngxSubmit(values: INgxFormValues): void {
        const crusher: string[] = [];
        LaboratoryCrusherList.forEach((test: LaboratoryCrusher) => {
            (values[`crusher-${test}`] || []).forEach((t: string) => crusher.push(`${test}::${t}`));
        });
        const khatka: string[] = [];
        LaboratoryKhatkaList.forEach((test: LaboratoryKhatka) => {
            (values[`khatka-${test}`] || []).forEach((t: string) => khatka.push(`${test}::${t}`));
        });

        const body: ISettingLaboratoryRq = {
            jump: {
                active: values['jumpActive'],
                key: values['jumpActive'] === true ? values['jumpKey'] : null,
            },
            dailyDate: values['dailyDate'],
            crusher,
            khatka,
        };
        this.apiService.request<ISettingLaboratoryRs>('SettingLaboratory', { body }, (response) => {
            this.settingService.init(response);
            this.ngxHelperToastService.success('تنظیمات سیستم با موفقیت ثبت شد.');
        });
    }
}
