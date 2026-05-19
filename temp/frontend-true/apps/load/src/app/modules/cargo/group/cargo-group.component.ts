import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { JalaliDateTime } from '@webilix/jalali-date-time';
import {
    NgxHelperBottomSheetService,
    NgxHelperConfirmService,
    NgxHelperHttpService,
    NgxHelperToastService,
} from '@webilix/ngx-helper';

import {
    ApiService,
    ILoadCargoDraftRs,
    ILoadCargoDTO,
    ILoadCargoGroupDeleteRs,
    ILoadCargoGroupDTO,
    ILoadCargoGroupListRs,
    ILoadExportGroupRq,
    ILoadExportGroupRs,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageBlock, IPageTitle } from '@lib/page';
import { ConfigService } from '@lib/providers';
import { ExportType, ExportTypeInfo, ExportTypeList, LoadCargoInfo } from '@lib/shared';

import { CargoGroupCreateComponent } from './create/cargo-group-create.component';
import { CargoGroupUpdateComponent } from './update/cargo-group-update.component';

@Component({
    host: { selector: 'cargo-group' },
    templateUrl: './cargo-group.component.html',
    styleUrl: './cargo-group.component.scss',
    standalone: false
})
export class CargoGroupComponent implements OnInit {
    public loadCargoInfo = LoadCargoInfo;

    public cargo: ILoadCargoDTO = this.activatedRoute.snapshot.data['cargo'];
    public blocks: IPageBlock[][] = [
        [
            { title: 'طرف حساب', value: this.cargo.party?.title || '' },
            { title: 'محموله', value: this.cargo.shipment?.title || '' },
        ],
        [],
        [],
    ];

    public title: IPageTitle = {
        title: 'مدیریت بارها',
        description: 'گروه‌های حواله‌های بار',
        actions: [
            { type: 'CREATE', title: 'ثبت گروه حواله', action: this.create.bind(this) },
            { type: 'RETURN', action: ['/cargo'] },
        ],
    };

    public loading: boolean = true;
    public groups: ILoadCargoGroupDTO[] = [];

    public list: IList<ILoadCargoGroupDTO> = {
        type: 'گروه حواله',
        description: (data) => data.description,
        columns: [
            { title: 'عنوان', value: 'title' },
            {
                title: 'اولین حواله',
                value: (data) => data.first.code,
                english: true,
                description: (data) => this.jalali.toFullText(data.first.date, { format: 'W، d N Y H:I' }),
            },
            {
                title: 'آخرین حواله',
                value: (data) => data.last.code,
                english: true,
                description: (data) => this.jalali.toFullText(data.last.date, { format: 'W، d N Y H:I' }),
            },
            { title: 'تعداد', value: (data) => data.draft.count, type: 'NUMBER' },
            { title: 'وزن', value: (data) => data.draft.weight, type: 'NUMBER' },
        ],
        actions: [
            ...ExportTypeList.map((type: ExportType) => ({
                title: ExportTypeInfo[type].title,
                icon: ExportTypeInfo[type].icon,
                action: (data: ILoadCargoGroupDTO) => this.export(data, type),
            })),
            'DIVIDER',
            { type: 'UPDATE', action: this.update.bind(this) },
            { type: 'DELETE', action: this.delete.bind(this) },
        ],
    };

    private jalali = JalaliDateTime();

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperHttpService: NgxHelperHttpService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
    ) {}

    ngOnInit(): void {
        if (this.cargo.type !== 'SITE') {
            this.router.navigate(['/cargo']);
            return;
        }

        const ID: string = this.cargo.id;
        this.apiService.request<ILoadCargoDraftRs>('LoadCargoDraft', { ids: { ID } }, (response) => {
            this.blocks[1] = [
                { title: 'حواله‌های بار', value: response.draft.count },
                { title: 'وزن', value: response.draft.weight },
            ];
        });

        this.loadList();
    }

    loadList(): void {
        const ID: string = this.cargo.id;
        this.apiService.request<ILoadCargoGroupListRs>('LoadCargoGroupList', { ids: { ID } }, (response) => {
            this.loading = false;
            this.groups = response;

            this.blocks[2] =
                response.length === 0
                    ? []
                    : [
                          { title: 'حواله‌های گروه‌ها', value: response.reduce((sum: number, r) => sum + r.draft.count, 0) },
                          { title: 'وزن', value: response.reduce((sum: number, r) => sum + r.draft.weight, 0) },
                      ];
        });
    }

    create(): void {
        this.ngxHelperBottomSheetService.open(
            CargoGroupCreateComponent,
            'ثبت گروه حواله',
            { data: { cargo: this.cargo } },
            () => {
                this.loadList();
                this.ngxHelperToastService.success('گروه حواله‌ها با موفقیت ثبت شد.');
            },
        );
    }

    update(group: ILoadCargoGroupDTO): void {
        this.ngxHelperBottomSheetService.open(
            CargoGroupUpdateComponent,
            'ویرایش گروه حواله',
            { data: { cargo: this.cargo, group } },
            () => {
                this.loadList();
                this.ngxHelperToastService.success('گروه حواله‌ها با موفقیت ویرایش شد.');
            },
        );
    }

    delete(group: ILoadCargoGroupDTO): void {
        const item: string = 'گروه حواله‌ها';

        this.ngxHelperConfirmService.delete(item, () => {
            const ID: string = this.cargo.id;
            const GROUPID: string = group.id;
            this.apiService.request<ILoadCargoGroupDeleteRs>('LoadCargoGroupDelete', { ids: { ID, GROUPID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('گروه حواله‌ها با موفقیت حذف شد.');
            });
        });
    }

    export(group: ILoadCargoGroupDTO, type: ExportType): void {
        const body: ILoadExportGroupRq = {
            cargo: this.cargo.id,
            group: group.id,
            type,
        };
        this.apiService.request<ILoadExportGroupRs>('LoadExportGroup', { body }, (response) => {
            const file: string = response.path.split('/').slice(-1)[0];
            this.ngxHelperHttpService.download(file, this.configService.getApiUrl(response.path));
        });
    }
}
