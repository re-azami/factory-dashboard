import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';

import { WarehouseQuestion } from '@lib/shared';

import { WarehouseToolsService } from '../../providers';
import { IWarehouseCategory } from '../../app.interface';

@Component({
    selector: 'filter',
    imports: [NgxFormModule],
    templateUrl: './filter.component.html',
    styleUrl: './filter.component.scss'
})
export class FilterComponent implements OnInit {
    @Output() filterChanged: EventEmitter<string[]> = new EventEmitter<string[]>();

    public categories: IWarehouseCategory[] = this.warehouseToolsService.categories;

    public ngxForm: INgxForm = { submit: 'اعمال فیلتر', inputs: [], buttons: [{ title: 'لفو فیلتر', action: () => {} }] };

    constructor(private readonly warehouseToolsService: WarehouseToolsService) {}

    ngOnInit(): void {
        const getCategories = (indent: number): string[] => {
            const categories: Set<string> = new Set<string>();
            this.categories.filter((c) => c.indent === indent).forEach((c) => categories.add(c.dto.title));
            return [...categories.values()].sort((c1, c2) => c1.localeCompare(c2));
        };

        WarehouseQuestion.forEach((question, index) => {
            this.ngxForm.inputs.push({
                name: `question_${index}`,
                type: 'SELECT',
                title: question.title,
                options: getCategories(index).map((c) => ({ id: c, title: c })),
                optional: true,
            });
        });
    }

    ngxChange(values: INgxFormValues): void {
        const filter: string[] = [];
        WarehouseQuestion.forEach((_, index) => filter.push(values[`question_${index}`] || ''));

        this.filterChanged.emit(filter);
    }
}
