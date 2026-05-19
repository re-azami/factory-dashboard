import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, ILoadOwnerDTO, ILoadOwnerUpdateRq, ILoadOwnerUpdateRs } from '@lib/apis';
import { IPageTitle } from '@lib/page';

@Component({
    host: { selector: 'owner-update' },
    templateUrl: './owner-update.component.html',
    styleUrl: './owner-update.component.scss',
    standalone: false
})
export class OwnerUpdateComponent {
    public owner: ILoadOwnerDTO = this.activatedRoute.snapshot.data['owner'];
    public title: IPageTitle = {
        title: 'مدیریت مالک‌ها',
        description: 'ویرایش مشخصات',
        actions: [{ type: 'RETURN', action: ['/owner'] }],
    };

    public ngxForm: INgxResponsiveForm = {
        submit: 'ویرایش مشخصات مالک',
        sections: [
            {
                columns: [
                    {
                        inputs: [
                            { name: 'name', type: 'NAME', value: this.owner.name },
                            { name: 'mobile', type: 'MOBILE', value: this.owner.mobile },
                            { name: 'nationalCode', type: 'NATIONAL-CODE', value: this.owner.nationalCode, optional: true },
                            { name: 'address', type: 'TEXTAREA', title: 'آدرس', value: this.owner.address, optional: true },
                        ],
                    },
                    {
                        inputs: [
                            {
                                name: 'accountName',
                                type: 'TEXT',
                                title: 'نام صاحب حساب',
                                value: this.owner.account.name,
                                optional: true,
                                description: 'در صورت مشخص نکردن مقدار، نام مالک در نظر گرفته می‌شود.',
                            },
                            {
                                name: 'accountSheba',
                                type: 'TEXT',
                                title: 'شماره شبا',
                                value: this.owner.account.sheba,
                                english: true,
                            },
                            {
                                name: 'accountNumber',
                                type: 'TEXT',
                                title: 'شماره حساب',
                                value: this.owner.account.number,
                                optional: true,
                                english: true,
                            },
                            {
                                name: 'accountCard',
                                type: 'BANK-CARD',
                                value: this.owner.account.card,
                                optional: true,
                                showBank: true,
                            },
                        ],
                    },
                ],
            },
        ],
        buttons: [{ title: 'انصراف', action: () => this.router.navigate(['/owner']) }],
    };

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.owner.id;
        const body: ILoadOwnerUpdateRq = {
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
        };
        this.apiService.request<ILoadOwnerUpdateRs>('LoadOwnerUpdate', { body, ids: { ID } }, () => {
            this.ngxHelperToastService.success('مالک با موفقیت ویرایش شد.');
            this.router.navigate(['/owner']);
        });
    }
}
