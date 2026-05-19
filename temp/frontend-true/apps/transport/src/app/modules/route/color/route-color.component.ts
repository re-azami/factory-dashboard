import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { Helper } from '@webilix/helper-library';
import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, ITransportRouteColorRq, ITransportRouteColorRs, ITransportRouteDTO } from '@lib/apis';

@Component({
    host: { selector: 'route-color' },
    templateUrl: './route-color.component.html',
    styleUrl: './route-color.component.scss',
    standalone: false
})
export class RouteColorComponent implements OnInit {
    public ngxForm: INgxForm = {
        submit: 'انتخاب رنگ مسیرها',
        inputs: [{ type: 'COMMENT', title: 'مسیر', value: this.data.route.title }],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { route: ITransportRouteDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        this.data.route.paths.forEach((path, index: number) => {
            this.ngxForm.inputs.push({
                name: `color${index}`,
                type: 'COLOR',
                title: `مسیر ${index + 1}`,
                value: Helper.COLOR.toHEX(path.color) || undefined,
            });
        });
    }

    ngxSubmit(values: INgxFormValues): void {
        const colors: string[] = this.data.route.paths.map((_, index: number) => values[`color${index}`]);
        if (!Helper.IS.ARRAY.unique(colors)) {
            this.ngxHelperToastService.error('لیست کد رنگ مسیرها نمی‌تواند شامل رنگ‌های تکراری باشد.');
            return;
        }

        const ID: string = this.data.route.id;
        const body: ITransportRouteColorRq = { colors };
        this.apiService.request<ITransportRouteColorRs>('TransportRouteColor', { body, ids: { ID } }, (response) => {
            this.ngxHelperToastService.success('رنگ مسیرها با موفقیت ثبت شد.');
            this.ngxHelperBottomSheetService.close(response);
        });
    }
}
