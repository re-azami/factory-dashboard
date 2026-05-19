import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    ILaboratoryCargoDTO,
    ILaboratoryCargoMixedUpdateRq,
    ILaboratoryCargoMixedUpdateRs,
    ILaboratoryCargoPortionDTO,
} from '@lib/apis';
import { IPageTitle } from '@lib/page';

@Component({
    host: { selector: 'cargo-mixed-update' },
    templateUrl: './cargo-mixed-update.component.html',
    styleUrl: './cargo-mixed-update.component.scss',
    standalone: false
})
export class CargoMixedUpdateComponent {
    public cargo: ILaboratoryCargoDTO = this.activatedRoute.snapshot.data['cargo'];

    public title: IPageTitle = {
        title: 'ویرایش بار مخلوط',
        actions: [{ type: 'RETURN', action: ['/cargo'] }],
    };

    public portions: ILaboratoryCargoPortionDTO[] = this.cargo.portions;
    public ngxForm: INgxResponsiveForm = {
        submit: 'ویرایش بار',
        sections: [
            {
                columns: [
                    { type: 'COMMENT', title: 'عنوان', value: '', english: true },
                    {
                        name: 'description',
                        type: 'TEXTAREA',
                        title: 'توضیحات',
                        value: this.cargo.description,
                        optional: true,
                    },
                ],
            },
        ],
        buttons: [{ title: 'انصراف', action: () => this.router.navigate(['/cargo']) }],
    };

    constructor(
        private readonly activatedRoute: ActivatedRoute,
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

        const ID: string = this.cargo.id;
        const body: ILaboratoryCargoMixedUpdateRq = {
            portions: this.portions.map((p) => ({ id: p.id, proportion: p.proportion })),
            description: values['description'],
        };
        this.apiService.request<ILaboratoryCargoMixedUpdateRs>('LaboratoryCargoMixedUpdate', { body, ids: { ID } }, () => {
            this.ngxHelperToastService.success('بار با موفقیت ویرایش شد.');
            this.router.navigate(['/cargo']);
        });
    }
}
