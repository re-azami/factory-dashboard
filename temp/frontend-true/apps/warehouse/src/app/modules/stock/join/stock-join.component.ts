import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IWarehouseCategoryJoinRq, IWarehouseCategoryJoinRs, IWarehouseCategoryListRs } from '@lib/apis';
import { WarehouseQuestion } from '@lib/shared';

import { WarehouseToolsService } from '../../../providers';
import { IWarehouseCategory } from '../../../app.interface';

@Component({
    host: { selector: 'stock-join' },
    templateUrl: './stock-join.component.html',
    styleUrls: ['./stock-join.component.scss'],
    standalone: false
})
export class StockJoinComponent implements OnInit {
    public warehouseQuestion = WarehouseQuestion;

    public parents: IWarehouseCategory[] = [];

    public ngxForm: INgxForm = {
        submit: 'ثبت زیر گروه',
        inputs: [
            {
                name: 'category',
                type: 'SELECT',
                title: 'زیر گروه',
                options: this.data.categories.map((category: IWarehouseCategory) => ({
                    id: category.dto.id,
                    title: category.dto.title,
                })),
            },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA)
        private readonly data: { indent: number; parent: IWarehouseCategory; categories: IWarehouseCategory[] },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
        private readonly warehouseToolsService: WarehouseToolsService,
    ) {}

    ngOnInit(): void {
        this.parents = [];

        const categories: IWarehouseCategory[] = this.warehouseToolsService.categories;
        let category = parent ? categories.find((c) => c.id === this.data.parent.id) : null;
        while (category) {
            this.parents.unshift(category);
            category = categories.find((c) => c.id === category?.dto.parent);
        }
    }

    ngxSubmit(values: INgxFormValues): void {
        const category = this.data.categories.find((c: IWarehouseCategory) => c.id === values['category']);
        if (!category) return;

        const body: IWarehouseCategoryJoinRq = {
            indent: this.data.indent,
            parent: this.data.parent.id,
            child: category.id,
            title: category.dto.title,
            key: category.dto.key,
        };
        this.apiService.request<IWarehouseCategoryJoinRs>('WarehouseCategoryJoin', { body }, (category) =>
            this.apiService.request<IWarehouseCategoryListRs>('WarehouseCategoryList', (response) => {
                this.warehouseToolsService.initCategories(response);
                this.ngxHelperBottomSheetService.close(category);
            }),
        );
    }
}
