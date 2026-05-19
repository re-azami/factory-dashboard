import { Component, OnInit } from '@angular/core';

import { JalaliDateTime } from '@webilix/jalali-date-time';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import { ApiService, ILoadDraftActiveRs, ILoadDraftDTO } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { UserService } from '@lib/providers';
import { LoadCargo, LoadCargoInfo, LoadCargoList } from '@lib/shared';

import { LoadSettingService, LoadToolsService } from '../../../providers';

import { DraftActiveUpdateCargoComponent } from './update/cargo/draft-active-update-cargo.component';
import { DraftActiveUpdatePlateComponent } from './update/plate/draft-active-update-plate.component';
import { DraftActiveUpdateTransporterComponent } from './update/transporter/draft-active-update-transporter.component';
import { DraftActiveUpdateWeightComponent } from './update/weight/draft-active-update-weight.component';

@Component({
    host: { selector: 'draft-active' },
    templateUrl: './draft-active.component.html',
    styleUrl: './draft-active.component.scss',
    standalone: false,
})
export class DraftActiveComponent implements OnInit {
    public title: IPageTitle = { title: 'حواله‌های فعال' };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public drafts: ILoadDraftDTO[] = [];
    public filtered: ILoadDraftDTO[] = [];

    public list: IList<ILoadDraftDTO> = {
        type: 'حواله',
        columns: [
            { title: 'شماره حواله', value: 'code', english: true, action: (data) => ['/draft', 'info', data.id] },
            {
                title: 'ثبت',
                value: (data) => data.date.create,
                type: 'DATE',
                format: 'H:I',
                description: (data) => this.getDays(data.date.create),
            },
            {
                title: 'تغییر',
                value: (data) => data.date.update,
                type: 'DATE',
                format: 'H:I',
                description: (data) => this.getDays(data.date.update),
            },
            { value: 'plate', type: 'PLATE', isDescription: true },
            { title: 'بار', value: (data) => data.cargo.title, description: (data) => LoadCargoInfo[data.cargo.type].title },
            { title: 'طرف حساب', value: (data) => data.cargo.party?.title },
            { title: 'محموله', value: (data) => data.cargo.shipment?.title },
            { title: 'باربری', value: (data) => data.transporter?.title },
            {
                title: 'فرایند',
                value: (data) => LoadCargoInfo[data.cargo.type].steps.find((s) => s.id === data.step)?.title,
            },
        ],
        actions: [
            {
                title: 'پرینت حواله',
                icon: 'print',
                action: (data: ILoadDraftDTO) => this.loadToolsService.downloadDraft(data.code),
            },
            'DIVIDER',
            {
                title: 'ویرایش بار',
                icon: 'terrain',
                action: this.updateCargo.bind(this),
                hideOn: () => !this.userService.hasAccess({ access: this.loadSettingService.update.cargo }),
            },
            {
                title: 'ویرایش پلاک',
                icon: 'pin',
                action: this.updatePlate.bind(this),
                hideOn: () => !this.userService.hasAccess({ access: this.loadSettingService.update.plate }),
            },
            {
                title: 'ویرایش باربری',
                icon: 'commute',
                action: this.updateTransporter.bind(this),
                hideOn: () => !this.userService.hasAccess({ access: this.loadSettingService.update.transporter }),
            },
            {
                title: 'ویرایش اطلاعات وزنی',
                icon: 'scale',
                action: this.updateWeight.bind(this),
                hideOn: () => !this.userService.hasAccess({ access: this.loadSettingService.update.weight }),
            },
            'DIVIDER',
            {
                title: 'لغو حواله',
                icon: 'cancel',
                color: 'warn',
                action: (data: ILoadDraftDTO) => this.loadToolsService.cancelDraft(data, this.loadList.bind(this)),
                access: { access: 'LOAD_FLOW_CANCEL' },
                hideOn: (data: ILoadDraftDTO) => !this.loadToolsService.canCancelDraft(data),
            },
        ],
    };

    private jalali = JalaliDateTime();

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly userService: UserService,
        private readonly loadToolsService: LoadToolsService,
        private readonly loadSettingService: LoadSettingService,
    ) {}

    ngOnInit(): void {
        this.loadList();
    }

    loadList(): void {
        this.apiService.request<ILoadDraftActiveRs>('LoadDraftActive', (response) => {
            this.loading = false;
            this.drafts = response;
            this.filterList();

            const cargos: Map<string, string> = new Map<string, string>();
            response.forEach((r) => {
                if (cargos.has(r.cargo.id)) return;
                cargos.set(r.cargo.id, r.cargo.title);
            });

            this.title = {
                ...this.title,
                toolbar: {
                    route: ['/draft', 'active'],
                    params: [
                        {
                            name: 'type',
                            type: 'SELECT',
                            title: 'نوع بار',
                            options: LoadCargoList.filter((c: LoadCargo) => c !== 'SITE').map((c: LoadCargo) => ({
                                id: c,
                                title: LoadCargoInfo[c].title,
                            })),
                        },
                        {
                            name: 'cargo',
                            type: 'SELECT',
                            title: 'بار',
                            options: [...cargos.keys()].map((k) => ({ id: k, title: cargos.get(k) || '' })),
                        },
                    ],
                },
            };
        });
    }

    filterList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const type: string = this.params?.params?.['type']?.param || '';
        const cargo: string = this.params?.params?.['cargo']?.param || '';
        this.filtered = this.drafts.filter((d) => {
            if (type && d.cargo.type !== type) return false;
            if (cargo && d.cargo.id !== cargo) return false;

            return true;
        });
    }

    getDays(date: Date): string | undefined {
        const now: string = this.jalali.toString(new Date(), { format: 'Y/M/D' });

        const day: string = this.jalali.toString(date, { format: 'Y/M/D' });
        if (day === now) return undefined;

        const yesterday: string = this.jalali.toString(new Date(date.getTime() - 24 * 3600 * 1000), { format: 'Y/M/D' });
        if (yesterday === now) return 'دیروز';

        return day;
    }

    updateCargo(draft: ILoadDraftDTO): void {
        this.ngxHelperBottomSheetService.open(
            DraftActiveUpdateCargoComponent,
            'ویرایش بار حواله',
            { data: { draft } },
            () => {
                this.loadList();
                this.ngxHelperToastService.success('بار حواله با موفقیت ویرایش شد.');
            },
        );
    }

    updatePlate(draft: ILoadDraftDTO): void {
        this.ngxHelperBottomSheetService.open(
            DraftActiveUpdatePlateComponent,
            'ویرایش پلاک حواله',
            { data: { draft } },
            () => {
                this.loadList();
                this.ngxHelperToastService.success('پلاک حواله با موفقیت ویرایش شد.');
            },
        );
    }

    updateTransporter(draft: ILoadDraftDTO): void {
        this.ngxHelperBottomSheetService.open(
            DraftActiveUpdateTransporterComponent,
            'ویرایش باربری حواله',
            { data: { draft } },
            () => {
                this.loadList();
                this.ngxHelperToastService.success('باربری حواله با موفقیت ویرایش شد.');
            },
        );
    }

    updateWeight(draft: ILoadDraftDTO): void {
        this.ngxHelperBottomSheetService.open(
            DraftActiveUpdateWeightComponent,
            'ویرایش اطلاعات وزنی حواله',
            { data: { draft } },
            () => {
                this.loadList();
                this.ngxHelperToastService.success('اطلاعات وزنی حواله با موفقیت ویرایش شد.');
            },
        );
    }
}
