import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, ILoadCargoDTO, ILoadCargoUpdateRq, ILoadCargoUpdateRs, IOptionDTO } from '@lib/apis';
import { LoadCargoInfo } from '@lib/shared';

@Component({
    selector: 'cargo-update',
    templateUrl: './cargo-update.component.html',
    styleUrl: './cargo-update.component.scss',
    standalone: false
})
export class CargoUpdateComponent implements OnInit {
    @Input({ required: true }) cargo!: ILoadCargoDTO;
    @Input({ required: true }) parties!: IOptionDTO[];
    @Input({ required: true }) shipments!: IOptionDTO[];
    @Input({ required: true }) transporters!: IOptionDTO[];

    @Output() updated: EventEmitter<ILoadCargoDTO> = new EventEmitter<ILoadCargoDTO>();
    @Output() canceled: EventEmitter<void> = new EventEmitter<void>();

    public ngxForm: INgxResponsiveForm = {
        submit: 'ویرایش مشخصات بار',
        sections: [],
        buttons: [{ title: 'انصراف', action: () => this.canceled.emit() }],
    };

    constructor(private readonly ngxHelperToastService: NgxHelperToastService, private readonly apiService: ApiService) {}

    ngOnInit(): void {
        this.ngxForm.sections = [
            {
                columns: [
                    {
                        inputs: [
                            { type: 'COMMENT', title: 'نوع بار', value: LoadCargoInfo[this.cargo.type].title },
                            { name: 'title', type: 'TEXT', title: 'عنوان', value: this.cargo.title },
                            {
                                name: 'grade',
                                type: 'NUMBER',
                                title: 'عیار',
                                value: this.cargo.grade,
                                suffix: 'درصد',
                                decimal: true,
                                minimum: 1,
                                maximum: 100,
                                optional: true,
                            },
                            {
                                name: 'tonnage',
                                type: 'NUMBER',
                                title: 'تناژ',
                                value: this.cargo.tonnage,
                                suffix: 'تن',
                                optional: true,
                            },
                        ],
                    },
                    {
                        inputs: [
                            {
                                name: 'contract',
                                type: 'TEXT',
                                title: 'شماره قرارداد',
                                value: this.cargo.contract,
                                english: true,
                                optional: true,
                            },
                            {
                                name: 'party',
                                type: 'SELECT',
                                title: 'طرف حساب',
                                value: this.cargo.party?.id || undefined,
                                options: this.parties,
                                optional: true,
                            },
                            {
                                name: 'shipment',
                                type: 'SELECT',
                                title: 'محموله',
                                value: this.cargo.shipment?.id || undefined,
                                options: this.shipments,
                                optional: true,
                            },
                        ],
                    },
                ],
            },
            {
                columns: [
                    {
                        name: 'description',
                        type: 'TEXTAREA',
                        title: 'توضیحات',
                        value: this.cargo.description,
                        optional: true,
                    },
                ],
            },
            this.cargo.type === 'SITE'
                ? { columns: [] }
                : {
                      title: 'باربری‌های مرتبط',
                      columns: [
                          {
                              inputs: [
                                  {
                                      name: 'transporter-active',
                                      type: 'CHECKBOX',
                                      value: !!this.cargo.transporter,
                                      message: 'فعال بودن سیستم مدیریت باربری‌های مرتبط با حواله‌های بار',
                                  },
                                  {
                                      name: 'transporter-required',
                                      type: 'CHECKBOX',
                                      value: this.cargo.transporter?.required || false,
                                      message: 'انتخاب باربری برای حواله‌های بار الزامی باشد',
                                      disableOn: (value: INgxFormValues) => !value['transporter-active'],
                                  },
                              ],
                          },
                          {
                              inputs: [
                                  {
                                      name: 'transporter',
                                      type: 'MULTI-SELECT',
                                      title: 'باربری‌های مرتبط',
                                      value: this.cargo.transporter?.transporters.map((t) => t.id) || [],
                                      options: this.transporters,
                                      view: 'CHECKBOX',
                                      minCount: 1,
                                      disableOn: (value: INgxFormValues) => !value['transporter-active'],
                                  },
                              ],
                          },
                      ],
                  },
        ];
    }

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.cargo.id;
        const body: ILoadCargoUpdateRq = {
            type: this.cargo.type,
            title: values['title'],
            grade: values['grade'],
            tonnage: values['tonnage'],
            party: values['party'],
            shipment: values['shipment'],
            contract: values['contract'],
            description: values['description'],
            transporter: {
                active: this.cargo.type !== 'SITE' && values['transporter-active'],
                required:
                    this.cargo.type !== 'SITE' && values['transporter-active'] ? values['transporter-required'] : false,
            },
            transporters: this.cargo.type !== 'SITE' && values['transporter-active'] ? values['transporter'] : [],
        };
        this.apiService.request<ILoadCargoUpdateRs>('LoadCargoUpdate', { body, ids: { ID } }, (response) => {
            this.ngxHelperToastService.success('مشخصات بار با موفقیت ویرایش شد.');
            this.updated.emit(response);
        });
    }
}
