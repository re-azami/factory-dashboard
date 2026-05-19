import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';

import {
    ApiService,
    ILoadCargoDTO,
    ILoadDraftDTO,
    ILoadFlowBuyCreateRq,
    ILoadFlowBuyCreateRs,
    ILoadTruckDTO,
} from '@lib/apis';

@Component({
    selector: 'flow-create-buy',
    imports: [NgxFormModule],
    templateUrl: './flow-create-buy.component.html',
    styleUrl: './flow-create-buy.component.scss'
})
export class FlowCreateBuyComponent implements OnInit {
    @Input({ required: true }) plate!: string;
    @Input({ required: true }) truck?: ILoadTruckDTO;
    @Input({ required: true }) cargo!: ILoadCargoDTO;
    @Input({ required: true }) ngxForm!: INgxForm;

    @Output() created: EventEmitter<ILoadDraftDTO> = new EventEmitter<ILoadDraftDTO>();

    constructor(private readonly apiService: ApiService) {}

    ngOnInit(): void {
        this.ngxForm.inputs.push(
            [
                {
                    name: 'billNumber',
                    type: 'TEXT',
                    title: 'شماره بارنامه فرستنده',
                    english: true,
                    optional: true,
                },
                {
                    name: 'billWeight',
                    type: 'NUMBER',
                    title: 'وزن بارنامه فرستنده',
                    suffix: 'کیلو',
                    minimum: 10_000,
                    maximum: 99_999,
                    optional: true,
                },
            ],
            {
                name: 'transporter',
                type: 'SELECT',
                title: 'باربری',
                options: this.cargo.transporter?.transporters || [],
                optional: !this.cargo.transporter?.required,
                hideOn: () => !this.cargo.transporter,
            },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        );
    }

    ngxSubmit(values: INgxFormValues): void {
        const body: ILoadFlowBuyCreateRq = {
            cargo: this.cargo.id,
            plate: this.plate,
            truck: this.truck?.id || null,
            transporter: values['transporter'] || null,
            description: values['description'],
            billNumber: values['billNumber'],
            billWeight: values['billWeight'],
        };
        this.apiService.request<ILoadFlowBuyCreateRs>('LoadFlowBuyCreate', { body }, (response) =>
            this.created.emit(response),
        );
    }
}
