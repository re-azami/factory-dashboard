import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { WarehouseQuestion } from '@lib/shared';

import { IWarehouseCategory } from '../../app.interface';

@Component({
    selector: 'parents',
    imports: [RouterModule],
    templateUrl: './parents.component.html',
    styleUrl: './parents.component.scss'
})
export class ParentsComponent {
    @Input({ required: true }) parents!: IWarehouseCategory[];
    @Input({ required: false }) route?: (parent: IWarehouseCategory) => string[];

    public warehouseQuestion = WarehouseQuestion;
}
