import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IWarehouseCategoryUpdateRq, IWarehouseCategoryUpdateRs } from '@lib/apis';
import { WarehouseQuestion } from '@lib/shared';

import { WarehouseToolsService } from '../../../providers';
import { IWarehouseCategory } from '../../../app.interface';

@Component({
    host: { selector: 'category-update' },
    templateUrl: './category-update.component.html',
    styleUrls: ['./category-update.component.scss'],
    standalone: false
})
export class CategoryUpdateComponent implements OnInit {
    public warehouseQuestion = WarehouseQuestion;
    public parents: IWarehouseCategory[] = [];

    public ngxForm: INgxForm = {
        submit: 'ویرایش گروه',
        inputs: [],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA)
        private readonly data: { category: IWarehouseCategory },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
        private readonly warehouseToolsService: WarehouseToolsService,
    ) {}

    ngOnInit(): void {
        const categories: IWarehouseCategory[] = this.warehouseToolsService.categories;

        if (this.data.category.dto.parent) {
            this.data.category.parents.forEach((p) => {
                const category: IWarehouseCategory | undefined = categories.find((c) => c.id === p.id);
                if (category) this.parents.push(category);
            });
        }

        const question: string = WarehouseQuestion[this.data.category.dto.parent ? this.data.category.indent : 0].title;
        this.ngxForm.inputs = [
            [
                { type: 'COMMENT', title: 'سوال', value: question },
                { type: 'COMMENT', title: 'کد گروه', value: this.data.category.dto.key, english: true },
            ],
            { name: 'title', type: 'TEXT', title: 'عنوان', value: this.data.category.dto.title },
        ];
    }

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.category.id;
        const body: IWarehouseCategoryUpdateRq = {
            parent: this.data.category.dto.parent,
            key: this.data.category.dto.key,
            title: values['title'],
        };
        this.apiService.request<IWarehouseCategoryUpdateRs>('WarehouseCategoryUpdate', { body, ids: { ID } }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
