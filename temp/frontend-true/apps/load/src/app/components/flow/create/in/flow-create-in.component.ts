import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';

import {
    ApiService,
    ILoadCargoDTO,
    ILoadDraftDTO,
    ILoadFlowInCreateRq,
    ILoadFlowInCreateRs,
    ILoadTruckDTO,
} from '@lib/apis';

@Component({
    selector: 'flow-create-in',
    imports: [NgxFormModule],
    templateUrl: './flow-create-in.component.html',
    styleUrl: './flow-create-in.component.scss'
})
export class FlowCreateInComponent implements OnInit {
    @Input({ required: true }) plate!: string;
    @Input({ required: true }) truck?: ILoadTruckDTO;
    @Input({ required: true }) cargo!: ILoadCargoDTO;
    @Input({ required: true }) ngxForm!: INgxForm;

    @Output() created: EventEmitter<ILoadDraftDTO> = new EventEmitter<ILoadDraftDTO>();

    constructor(private readonly apiService: ApiService) {}

    ngOnInit(): void {
        this.ngxForm.inputs.push(
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
        const body: ILoadFlowInCreateRq = {
            cargo: this.cargo.id,
            plate: this.plate,
            truck: this.truck?.id || null,
            transporter: values['transporter'] || null,
            description: values['description'],
        };
        this.apiService.request<ILoadFlowInCreateRs>('LoadFlowInCreate', { body }, (response) =>
            this.created.emit(response),
        );
    }
}
