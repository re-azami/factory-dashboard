import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { Helper } from '@webilix/helper-library';
import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import {
    ApiService,
    ILaboratoryCargoDTO,
    ILaboratoryCargoMoveInfoRs,
    ILaboratoryCargoMoveSaveRq,
    ILaboratoryCargoMoveSaveRs,
} from '@lib/apis';

@Component({
    host: { selector: 'cargo-move' },
    templateUrl: './cargo-move.component.html',
    styleUrl: './cargo-move.component.scss',
    standalone: false
})
export class CargoMoveComponent implements OnInit {
    public loading: boolean = true;
    public ngxForm: INgxForm = {
        submit: 'انتقال آزمایش‌ها',
        inputs: [],
        buttons: [{ title: 'انصراف', action: () => this.ngxHelperBottomSheetService.close() }],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { cargo: ILaboratoryCargoDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        const ID: string = this.data.cargo.id;
        this.apiService.request<ILaboratoryCargoMoveInfoRs>('LaboratoryCargoMoveInfo', { ids: { ID } }, (response) => {
            this.loading = false;

            this.ngxForm.inputs = [
                { type: 'COMMENT', title: 'بار', value: this.data.cargo.title },
                [
                    { type: 'COMMENT', title: 'آزمایش‌های سنگ شکن', value: Helper.NUMBER.format(response.count.crusher) },
                    { type: 'COMMENT', title: 'آزمایش‌های ختکا', value: Helper.NUMBER.format(response.count.khatka) },
                ],
                [
                    { type: 'COMMENT', title: 'آزمایش‌های بلین', value: Helper.NUMBER.format(response.count.blaine) },
                    { type: 'COMMENT', title: 'آزمایش‌های دیویس تیوب', value: Helper.NUMBER.format(response.count.davis) },
                    { type: 'COMMENT', title: 'آزمایش‌های درصد جامد', value: Helper.NUMBER.format(response.count.solid) },
                ],
                { name: 'cargo', type: 'SELECT', title: 'انتقال به', options: response.cargos },
            ];

            const count: number =
                response.count.crusher +
                response.count.khatka +
                response.count.blaine +
                response.count.davis +
                response.count.solid;
            if (count === 0)
                this.ngxForm.buttons?.push({
                    title: 'حذف',
                    action: () => this.ngxHelperBottomSheetService.close({ delete: true }),
                });
        });
    }

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.cargo.id;
        const body: ILaboratoryCargoMoveSaveRq = { cargo: values['cargo'] };
        this.apiService.request<ILaboratoryCargoMoveSaveRs>('LaboratoryCargoMoveSave', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close({ delete: false }),
        );
    }
}
