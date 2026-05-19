import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';

import {
    ApiService,
    ILoadCargoDTO,
    ILoadDraftDTO,
    ILoadFlowOutCreateRq,
    ILoadFlowOutCreateRs,
    ILoadTruckDTO,
} from '@lib/apis';

@Component({
    selector: 'flow-create-out',
    imports: [NgxFormModule],
    templateUrl: './flow-create-out.component.html',
    styleUrl: './flow-create-out.component.scss'
})
export class FlowCreateOutComponent implements OnInit {
    @Input({ required: true }) plate!: string;
    @Input({ required: true }) truck?: ILoadTruckDTO;
    @Input({ required: true }) cargo!: ILoadCargoDTO;
    @Input({ required: true }) ngxForm!: INgxForm;

    @Output() created: EventEmitter<ILoadDraftDTO> = new EventEmitter<ILoadDraftDTO>();

    constructor(private readonly apiService: ApiService) {}

    ngOnInit(): void {
        this.ngxForm.inputs.push(
            { name: 'bitaDraft', type: 'TEXT', title: 'شماره حواله بیتا', english: true, optional: true },
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
        const body: ILoadFlowOutCreateRq = {
            cargo: this.cargo.id,
            plate: this.plate,
            truck: this.truck?.id || null,
            transporter: values['transporter'] || null,
            description: values['description'],
            bitaDraft: values['bitaDraft'],
        };
        this.apiService.request<ILoadFlowOutCreateRs>('LoadFlowOutCreate', { body }, (response) =>
            this.created.emit(response),
        );
    }
}
