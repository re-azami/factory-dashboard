import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { INgxHelperValue } from '@webilix/ngx-helper/value';

import { ApiService, ILoadCargoDraftRs, ILoadCargoDTO, ILoadSettingDTO, ILoadSettingInfoRs, IOptionDTO } from '@lib/apis';
import { IPageBlock, IPageTitle } from '@lib/page';
import { LoadCargoInfo } from '@lib/shared';

import { LoadSettingService, LoadToolsService } from '../../../providers';

@Component({
    host: { selector: 'cargo-info' },
    templateUrl: './cargo-info.component.html',
    styleUrl: './cargo-info.component.scss',
    standalone: false
})
export class CargoInfoComponent implements OnInit {
    public loadCargoInfo = LoadCargoInfo;

    public cargo: ILoadCargoDTO = this.activatedRoute.snapshot.data['cargo'];
    public parties: IOptionDTO[] = this.activatedRoute.snapshot.data['parties'];
    public shipments: IOptionDTO[] = this.activatedRoute.snapshot.data['shipments'];
    public transporters: IOptionDTO[] = this.activatedRoute.snapshot.data['transporters'];
    public action: string = this.activatedRoute.snapshot.data['action'];

    public title: IPageTitle = {
        title: 'مدیریت بارها',
        description: this.cargo.title,
        actions: [
            {
                icon: 'published_with_changes',
                title: 'گزارش تغییرات',
                action: () => this.loadToolsService.logData('CARGO', this.cargo.id),
                access: { access: 'LOAD_DATA_LOG' },
            },
            { type: 'RETURN', action: ['/cargo'] },
        ],
    };

    public cargoData: IPageBlock[] = [];
    public otherValues: INgxHelperValue[] = [];
    public paymentValues: INgxHelperValue[] = [];

    public draftLoading: boolean = true;
    public draftReport!: ILoadCargoDraftRs;
    public draftData: IPageBlock[] = [
        { title: 'تعداد حواله‌ها', value: '...' },
        { title: 'وزن حواله‌ها', value: '...' },
    ];

    public activeTab: number = this.action === 'update' ? 1 : 0;

    public setting!: ILoadSettingDTO;
    public getStep = this.loadSettingService.getStep.bind(this);

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly apiService: ApiService,
        private readonly loadSettingService: LoadSettingService,
        private readonly loadToolsService: LoadToolsService,
    ) {}

    ngOnInit(): void {
        this.setCargo(this.cargo, true);

        const ID: string = this.cargo.id;
        this.apiService.request<ILoadCargoDraftRs>('LoadCargoDraft', { ids: { ID } }, (response) => {
            this.draftLoading = false;
            this.draftReport = response;

            this.draftData = [
                { title: 'تعداد حواله‌ها', value: response.draft.count },
                { title: 'وزن حواله‌ها', value: response.draft.weight },
            ];
        });

        this.apiService.request<ILoadSettingInfoRs>(
            'LoadSettingInfo',
            { params: { cargo: this.cargo.type }, silent: true, loading: false },
            (response) => (this.setting = response),
        );
    }

    letter(): void {
        if (!this.cargo.letter) return;

        this.loadToolsService.downloadFile(this.cargo.letter.path, this.cargo.title);
    }

    setCargo(cargo: ILoadCargoDTO, ignoreTab?: boolean): void {
        this.cargo = cargo;
        this.title = { ...this.title, description: this.cargo.title };

        this.setBlocks();
        this.setValues();

        if (!ignoreTab) this.activeTab = 0;
    }

    setBlocks(): void {
        this.cargoData = [
            { title: 'عیار', value: this.cargo.grade },
            { title: 'تناژ بار', value: this.cargo.tonnage },
        ];
    }

    setValues(): void {
        this.otherValues = [
            { title: 'تاریخ ثبت', value: { type: 'DATE', value: this.cargo.create } },
            { title: 'طرف حساب', value: this.cargo.party?.title || '' },
            { title: 'محموله', value: this.cargo.shipment?.title || '' },
            { title: 'شماره قرارداد', value: { type: 'ENGLISH', value: this.cargo.contract || '' }, copy: true },
        ];

        this.paymentValues = [
            {
                title: 'مدیریت ناوگان',
                value:
                    this.cargo.truck === 'ON'
                        ? 'ناوگان ثبت شده'
                        : this.cargo.truck === 'OFF'
                        ? 'ناوگان ثبت نشده'
                        : 'بدون محدودیت',
            },
            { title: 'محاسبه هزینه', value: this.cargo.payment ? 'بلی' : 'خیر' },
            { title: 'هزینه حمل', value: this.cargo.price ? { type: 'NUMBER', value: this.cargo.price || 0 } : '' },
        ];
    }
}
