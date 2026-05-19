import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { ApiService, IWarehouseCategoryCreateRq, IWarehouseCategoryCreateRs } from '@lib/apis';
import { WarehouseQuestion } from '@lib/shared';

import { WarehouseToolsService } from '../../../providers';
import { IWarehouseCategory } from '../../../app.interface';

@Component({
    host: { selector: 'category-create' },
    templateUrl: './category-create.component.html',
    styleUrls: ['./category-create.component.scss'],
    standalone: false
})
export class CategoryCreateComponent implements OnInit {
    public parents: IWarehouseCategory[] = [];

    public ngxForm: INgxForm = {
        submit: 'ثبت گروه جدید',
        inputs: [],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { parent?: IWarehouseCategory },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
        private readonly warehouseToolsService: WarehouseToolsService,
    ) {}

    ngOnInit(): void {
        const categories: IWarehouseCategory[] = this.warehouseToolsService.categories;

        if (this.data.parent) {
            this.data.parent.parents.forEach((p) => {
                const category: IWarehouseCategory | undefined = categories.find((c) => c.id === p.id);
                if (category) this.parents.push(category);
            });
            this.parents.push(this.data.parent);
        }

        const info = WarehouseQuestion[this.data.parent ? this.data.parent.indent + 1 : 0];
        const question: string = info.title;

        const check: string[] = this.warehouseToolsService.categories
            .filter((c) => c.dto.parent === (this.data.parent?.id || null))
            .map((c) => c.dto.key);
        const keys: string[] = this.getKeys(info.keyLength).filter((k) => !check.includes(k));

        this.ngxForm.inputs = [
            [
                { type: 'COMMENT', title: 'سوال', value: question },
                {
                    name: 'key',
                    type: 'SELECT',
                    title: 'کد گروه',
                    options: keys.map((k) => ({ id: k, title: k })),
                    english: true,
                },
            ],
            { name: 'title', type: 'TEXT', title: 'عنوان' },
        ];
    }

    getKeys(length: number): string[] {
        const base: string[] = [...Array(36).keys()].map((i) => i.toString(36).toUpperCase());

        const keys: string[] = [...base];
        for (let l = 1; l < length; l++) {
            const list: string[] = [];
            keys.forEach((k: string) => base.forEach((b: string) => list.push(`${k}${b}`)));
            keys.splice(0, keys.length, ...list);
        }

        return keys.sort((k1, k2) => k1.localeCompare(k2));
    }

    ngxSubmit(values: INgxFormValues): void {
        const body: IWarehouseCategoryCreateRq = {
            parent: this.data.parent ? this.data.parent.id : null,
            key: values['key'],
            title: values['title'],
        };
        this.apiService.request<IWarehouseCategoryCreateRs>('WarehouseCategoryCreate', { body }, () =>
            this.ngxHelperBottomSheetService.close(true),
        );
    }
}
