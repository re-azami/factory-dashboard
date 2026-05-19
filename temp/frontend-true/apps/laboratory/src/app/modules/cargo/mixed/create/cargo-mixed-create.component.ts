import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    ILaboratoryCargoMixedCreateRq,
    ILaboratoryCargoMixedCreateRs,
    ILaboratoryCargoPortionDTO,
} from '@lib/apis';
import { IPageTitle } from '@lib/page';

@Component({
    host: { selector: 'cargo-mixed-create' },
    templateUrl: './cargo-mixed-create.component.html',
    styleUrl: './cargo-mixed-create.component.scss',
    standalone: false
})
export class CargoMixedCreateComponent {
    public title: IPageTitle = {
        title: 'ثبت بار مخلوط جدید',
        actions: [{ type: 'RETURN', action: ['/cargo'] }],
    };

    public portions: ILaboratoryCargoPortionDTO[] = [];
    public ngxForm: INgxResponsiveForm = {
        submit: 'ثبت بار',
        sections: [
            {
                columns: [
                    { type: 'COMMENT', title: 'عنوان', value: '', english: true },
                    { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
                ],
            },
        ],
        buttons: [{ title: 'انصراف', action: () => this.router.navigate(['/cargo']) }],
    };

    constructor(
        private readonly router: Router,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    setTitle(title: string): void {
        const input = this.ngxForm.sections[0].columns[0];
        if ('type' in input && input.type === 'COMMENT') input.value = title;
    }

    ngxSubmit(values: INgxFormValues): void {
        if (this.portions.length < 2) {
            this.ngxHelperToastService.error('انتخاب حداقل دو بار الزامی است');
            return;
        }

        const body: ILaboratoryCargoMixedCreateRq = {
            portions: this.portions.map((p) => ({ id: p.id, proportion: p.proportion })),
            description: values['description'],
        };
        this.apiService.request<ILaboratoryCargoMixedCreateRs>('LaboratoryCargoMixedCreate', { body }, () => {
            this.ngxHelperToastService.success('بار با موفقیت ثبت شد.');
            this.router.navigate(['/cargo']);
        });
    }
}
