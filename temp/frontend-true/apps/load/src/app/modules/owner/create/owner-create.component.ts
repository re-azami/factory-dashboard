import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, ILoadOwnerCreateRq, ILoadOwnerCreateRs } from '@lib/apis';
import { IPageTitle } from '@lib/page';
import { UserService } from '@lib/providers';

@Component({
    host: { selector: 'owner-create' },
    templateUrl: './owner-create.component.html',
    styleUrl: './owner-create.component.scss',
    standalone: false
})
export class OwnerCreateComponent {
    public title: IPageTitle = {
        title: 'مدیریت مالک‌ها',
        description: 'ثبت مالک جدید',
        actions: [{ type: 'RETURN', action: ['/owner'] }],
    };

    public truckAccess: boolean = this.userService.hasAccess({ access: 'LOAD_TRUCK' });
    public ngxForm: INgxResponsiveForm = {
        submit: 'ثبت مالک جدید',
        sections: [
            {
                title: 'اطلاعات مالک',
                columns: [
                    {
                        inputs: [
                            { name: 'name', type: 'NAME' },
                            { name: 'mobile', type: 'MOBILE' },
                            { name: 'nationalCode', type: 'NATIONAL-CODE', optional: true },
                            { name: 'address', type: 'TEXTAREA', title: 'آدرس', optional: true },
                        ],
                    },
                    {
                        inputs: [
                            {
                                name: 'accountName',
                                type: 'TEXT',
                                title: 'نام صاحب حساب',
                                optional: true,
                                description: 'در صورت مشخص نکردن مقدار، نام مالک در نظر گرفته می‌شود.',
                            },
                            { name: 'accountSheba', type: 'TEXT', title: 'شماره شبا', english: true },
                            { name: 'accountNumber', type: 'TEXT', title: 'شماره حساب', optional: true, english: true },
                            { name: 'accountCard', type: 'BANK-CARD', optional: true, showBank: true },
                        ],
                    },
                ],
            },
            {
                title: 'ناوگان',
                columns: [
                    {
                        inputs: [
                            { name: 'truckPlate', type: 'PLATE', letter: 'ع', hideOn: () => !this.truckAccess },
                            { name: 'truckType', type: 'TEXT', title: 'مدل', hideOn: () => !this.truckAccess },
                            {
                                name: 'truckVin',
                                type: 'TEXT',
                                title: 'شماره شاسی',
                                optional: true,
                                english: true,
                                hideOn: () => !this.truckAccess,
                            },
                        ],
                    },
                    {
                        inputs: [
                            { name: 'truckName', type: 'NAME', title: 'راننده', hideOn: () => !this.truckAccess },
                            { name: 'truckMobile', type: 'MOBILE', title: 'موبایل', hideOn: () => !this.truckAccess },
                            {
                                name: 'truckNationalCode',
                                type: 'NATIONAL-CODE',
                                title: 'کدملی',
                                optional: true,
                                hideOn: () => !this.truckAccess,
                            },
                        ],
                    },
                ],
            },
        ],
        buttons: [{ title: 'انصراف', action: () => this.router.navigate(['/owner']) }],
    };

    constructor(
        private readonly router: Router,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly userService: UserService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const body: ILoadOwnerCreateRq = {
            name: values['name'],
            mobile: values['mobile'],
            nationalCode: values['nationalCode'],
            address: values['address'],
            account: {
                name: values['accountName'],
                sheba: values['accountSheba'],
                number: values['accountNumber'],
                card: values['accountCard'],
            },
            truck: this.truckAccess
                ? {
                      plate: values['truckPlate'].join('-'),
                      type: values['truckType'],
                      vin: values['truckVin'],
                      driverFirstName: values['truckName'].first,
                      driverLastName: values['truckName'].last,
                      driverMobile: values['truckMobile'],
                      driverNationalCode: values['truckNationalCode'],
                  }
                : null,
        };
        this.apiService.request<ILoadOwnerCreateRs>('LoadOwnerCreate', { body }, () => {
            this.ngxHelperToastService.success('مالک با موفقیت ثبت شد.');
            this.router.navigate(['/owner']);
        });
    }
}
