import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { INgxFormValues, INgxResponsiveForm, NgxFormComponent } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, IWarehouseCategoryDTO, IWarehouseStockCreateRq, IWarehouseStockCreateRs } from '@lib/apis';
import { IPageTitle } from '@lib/page';
import { WarehouseQuestion } from '@lib/shared';

import { WarehouseToolsService } from '../../../providers';
import { IWarehouseCategory } from '../../../app.interface';

import { StockJoinComponent } from '../join/stock-join.component';

@Component({
    host: { selector: 'stock-create' },
    templateUrl: './stock-create.component.html',
    styleUrls: ['./stock-create.component.scss'],
    standalone: false
})
export class StockCreateComponent implements OnInit {
    @ViewChild('ngxFormComponent') private ngxFormComponent?: NgxFormComponent;

    public title: IPageTitle = { title: 'ثبت کالای جدید', actions: [{ type: 'RETURN', action: ['/stock'] }] };

    public categories: IWarehouseCategory[] = this.warehouseToolsService.categories;
    public parents: (IWarehouseCategory | null)[] = Array(WarehouseQuestion.length).fill(null);
    public options: { id: string; title: string }[][] = [...Array(WarehouseQuestion.length).keys()].map((_) => []);
    public ngxForm: INgxResponsiveForm = {
        submit: 'ثبت کالای جدید',
        sections: [],
        buttons: [{ title: 'لیست کالاها', action: () => this.router.navigate(['/stock']) }],
    };

    private values: INgxFormValues = {};

    constructor(
        private readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly warehouseToolsService: WarehouseToolsService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        this.ngxForm.sections = [{ columns: [{ inputs: [] }, { inputs: [] }] }];
        WarehouseQuestion.forEach((question, index: number) => {
            if ('inputs' in this.ngxForm.sections[0].columns[0])
                this.ngxForm.sections[0].columns[0].inputs.push({
                    name: `parent-${index}`,
                    type: 'SELECT',
                    title: question.title,
                    options: this.options[index],
                    button:
                        index === 0 || !question.createJoin
                            ? undefined
                            : {
                                  icon: 'add',
                                  click: () => this.createJoin(index),
                                  disableOn: (values: INgxFormValues) => !values[`parent-${index - 1}`],
                              },
                });
        });

        if ('inputs' in this.ngxForm.sections[0].columns[1])
            this.ngxForm.sections[0].columns[1].inputs.push({ name: 'title', type: 'TEXT', title: 'عنوان کالا' });

        this.ngxChange({});
    }

    createJoin(indent: number): void {
        if (indent === 0 || !WarehouseQuestion[indent] || !WarehouseQuestion[indent].createJoin) return;

        const parent = this.categories.find(
            (category: IWarehouseCategory) => category.id === this.values[`parent-${indent - 1}`],
        );
        if (!parent) return;

        const check: string[] = this.categories
            .filter((c) => c.indent === indent && c.dto.parent === (indent === 0 ? null : this.parents[indent - 1]?.id))
            .map((c) => c.dto.title);

        const categories: IWarehouseCategory[] = this.categories
            .filter((category: IWarehouseCategory) => category.indent === indent)
            .filter((category, i, a) => a.findIndex((c) => category.dto.title === c.dto.title) === i)
            .filter((category: IWarehouseCategory) => !check.includes(category.dto.title));

        this.ngxHelperBottomSheetService.open<IWarehouseCategoryDTO>(
            StockJoinComponent,
            'ثبت زیر گروه',
            { data: { indent, parent, categories } },
            (response) => {
                this.categories = this.warehouseToolsService.categories;
                this.values[`parent-${indent}`] = response.id;
                this.ngxChange(this.values);
                this.ngxHelperToastService.success('زیر گروه با موفقیت ثبت شد.');
            },
        );
    }

    ngxChange(values: INgxFormValues): void {
        this.values = values;

        const ids: (string | null)[] = [];
        WarehouseQuestion.forEach((_, index: number) => {
            this.options[index].splice(0, this.options[index].length);

            const categories: IWarehouseCategory[] = this.categories.filter(
                (c) => c.indent === index && c.dto.parent === (index === 0 ? null : this.parents[index - 1]?.id),
            );
            categories.forEach((c) => this.options[index].push({ id: c.id, title: c.dto.title }));

            const id: string = values[`parent-${index}`];
            const parent: IWarehouseCategory | undefined = categories.find((c) => id === c.id);
            this.parents[index] = parent || null;
            ids[index] = parent?.id || null;
        });

        ids.forEach((id, index: number) => (values[`parent-${index}`] = id));
        this.ngxFormComponent?.ngForm?.resetForm(values);
    }

    ngxSubmit(values: INgxFormValues): void {
        const parent: IWarehouseCategory | null = this.parents[this.parents.length - 1];
        if (parent === null) return;

        const body: IWarehouseStockCreateRq = {
            category: parent.id,
            title: values['title'],
        };
        this.apiService.request<IWarehouseStockCreateRs>('WarehouseStockCreate', { body }, () => {
            this.ngxHelperToastService.success(' با موفقیت ثبت شد.');
            this.ngxFormComponent?.ngForm?.resetForm();
        });
    }
}
