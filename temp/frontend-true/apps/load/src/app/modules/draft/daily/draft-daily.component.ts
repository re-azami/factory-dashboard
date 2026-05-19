import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';

import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';
import { NgxHelperMenu } from '@webilix/ngx-helper/menu';

import { ApiService, ILoadDraftDailyRs, ILoadDraftFlowDTO, IOptionDTO } from '@lib/apis';
import { UserService } from '@lib/providers';
import { LoadCargo, LoadCargoInfo, LoadCargoList, LoadFlow, LoadFlowInfo, LoadFlowList } from '@lib/shared';

import { IDraftDailySetting, LoadSettingService, LoadToolsService } from '../../../providers';

import { DraftDailySettingComponent } from './setting/draft-daily-setting.component';

type Steps = 'FINISH' | 'DELAY' | 'CURRENT' | 'NEXT';

@Component({
    host: { selector: 'draft-daily' },
    templateUrl: './draft-daily.component.html',
    styleUrl: './draft-daily.component.scss',
    standalone: false
})
export class DraftDailyComponent implements OnInit, OnDestroy {
    @HostBinding('className') className = 'page-fullwidth';

    public loadCargoList = LoadCargoList;
    public loadCargoInfo = LoadCargoInfo;

    public loadFlowList = LoadFlowList;
    public loadFlowInfo = LoadFlowInfo;

    public loading: boolean = true;
    public drafts: ILoadDraftFlowDTO[] = [];
    public filtered: ILoadDraftFlowDTO[] = [];
    public cargos: IOptionDTO[] = [];
    public shipments: IOptionDTO[] = [];
    public showSiteCargo: boolean = this.loadSettingService.site;

    public setting: IDraftDailySetting = this.loadToolsService.dailySetting;
    public types: Set<LoadCargo> = new Set<LoadCargo>();
    public steps: { [key: string]: Steps[] } = {};
    public active: string[] = [];
    public delayed: string[] = [];
    public canceled: string[] = [];
    public finished: { list: string[]; weight: number } = { list: [], weight: 0 };

    public colors: { [key in Steps]: string } = {
        FINISH: 'rgba(var(--primaryColorRGB), 0.5)',
        DELAY: 'rgba(var(--warnColorRGB), 0.5)',
        CURRENT: 'var(--borderColor)',
        NEXT: 'transparent',
    };

    public view?: 'ACTIVE' | 'DELAY' | 'CANCEL' | 'FINISH';
    public filter: { types: LoadCargo[]; flows: LoadFlow[]; cargos: string[]; shipments: string[] } = {
        types: [],
        flows: [],
        cargos: [],
        shipments: [],
    };

    public viewAccess: boolean = this.userService.hasAccess({
        access: [
            'LOAD_ROLE_TRAFFIC',
            'LOAD_ROLE_TRAFFIC_MINE',
            'LOAD_ROLE_WEIGHT',
            'LOAD_ROLE_LOADING',
            'LOAD_ROLE_LOADING_MINE',
            'LOAD_ROLE_DISCHARGE',
        ],
    });
    public cancelAccess: boolean = this.userService.hasAccess({ access: 'LOAD_FLOW_CANCEL' });

    private loadIndex: number = 0;
    private loadInterval: any;

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
        private readonly userService: UserService,
        private readonly loadToolsService: LoadToolsService,
        private readonly loadSettingService: LoadSettingService,
    ) {}

    ngOnInit(): void {
        this.loadList(true);
        this.loadInterval = setInterval(this.loadList.bind(this), 15_000);
    }

    ngOnDestroy(): void {
        if (this.loadInterval) clearInterval(this.loadInterval);
    }

    setType(types: LoadCargo[]): void {
        this.view = undefined;
        this.filter.types = types;

        this.filterList();
    }

    setFlow(flows: LoadFlow[]): void {
        this.view = undefined;
        this.filter.flows = flows;

        this.filterList();
    }

    setCargo(cargos: string[]): void {
        this.view = undefined;
        this.filter.cargos = cargos;

        this.filterList();
    }

    setShipment(shipments: string[]): void {
        this.view = undefined;
        this.filter.shipments = shipments;

        this.filterList();
    }

    loadList(firstLoad?: boolean): void {
        this.apiService.request<ILoadDraftDailyRs>(
            'LoadDraftDaily',
            { silent: !firstLoad, loading: !!firstLoad },
            (response, index) => {
                if (this.loadIndex > index) return;
                this.loadIndex = index;

                this.loading = false;
                this.drafts = response;
                this.filterList();

                // Cargo nad Shipment List
                const cargos: Map<string, string> = new Map<string, string>();
                const shipments: Map<string, string> = new Map<string, string>();
                this.drafts.forEach((draft: ILoadDraftFlowDTO) => {
                    cargos.set(draft.cargo.id, draft.cargo.title);
                    if (draft.cargo.shipment) shipments.set(draft.cargo.shipment.id, draft.cargo.shipment.title);
                });

                this.cargos = [...cargos.keys()]
                    .map((id: string) => ({ id, title: cargos.get(id) || '' }))
                    .sort((c1, c2) => c1.title.localeCompare(c2.title));
                this.shipments = [...shipments.keys()]
                    .map((id: string) => ({ id, title: shipments.get(id) || '' }))
                    .sort((s1, s2) => s1.title.localeCompare(s2.title));
            },
        );
    }

    filterList(): void {
        this.filtered = this.drafts.filter((draft: ILoadDraftFlowDTO) => {
            if (this.filter.types.length > 0 && !this.filter.types.includes(draft.cargo.type)) return false;
            if (this.filter.cargos.length > 0 && !this.filter.cargos.includes(draft.cargo.id)) return false;
            if (this.filter.shipments.length > 0 && !this.filter.shipments.includes(draft.cargo.shipment?.id)) return false;

            if (this.filter.flows.length > 0) {
                const flow = LoadCargoInfo[draft.cargo.type].steps.find((s) => s.id === draft.step)?.flow;
                if (!flow || !this.filter.flows.includes(flow)) return false;
            }

            return true;
        });

        this.setData();
    }

    setData(): void {
        this.types.clear();
        this.steps = {};
        this.active = [];
        this.delayed = [];
        this.canceled = [];
        this.finished = { list: [], weight: 0 };

        this.filtered.forEach((draft: ILoadDraftFlowDTO) => {
            // Type List
            this.types.add(draft.cargo.type);

            // Steps
            if (draft.status === 'ACTIVE') {
                const steps = LoadCargoInfo[draft.cargo.type].steps;
                const index: number = steps.findIndex((s) => s.id === draft.step);
                this.steps[draft.id] = [];
                steps.forEach((_, i: number) => {
                    if (i != index) {
                        this.steps[draft.id].push(i < index ? 'FINISH' : 'NEXT');
                        return;
                    }

                    this.steps[draft.id].push('CURRENT');
                    if (!draft.previousStep) return;

                    const seconds: number = Math.floor((new Date().getTime() - draft.previousStep.date.getTime()) / 1000);
                    const delay = (draft.delay || 0) * 60;
                    if (delay <= 0 || delay > seconds) return;

                    this.steps[draft.id][this.steps[draft.id].length - 1] = 'DELAY';
                    this.delayed.push(draft.id);
                });
            }

            // ACTIVE
            if (draft.status === 'ACTIVE') this.active.push(draft.id);

            // CANCELED
            if (draft.status === 'CANCELED') this.canceled.push(draft.id);

            // FINISHED
            if (draft.status === 'FINISHED') {
                this.finished.list.push(draft.id);
                this.finished.weight += draft.weight.net;
            }
        });
    }

    checkView(draft: ILoadDraftFlowDTO): boolean {
        switch (this.view) {
            case 'ACTIVE':
                return this.active.includes(draft.id);
            case 'DELAY':
                return this.delayed.includes(draft.id);
            case 'CANCEL':
                return this.canceled.includes(draft.id);
            case 'FINISH':
                return this.finished.list.includes(draft.id);
        }

        return true;
    }

    getDraftStep(type: LoadCargo, step: string): string {
        return LoadCargoInfo[type].steps.find((s) => s.id === step)?.title || '';
    }

    getDraftFlow(draft: ILoadDraftFlowDTO): string {
        switch (draft.status) {
            case 'ACTIVE':
                return this.getDraftStep(draft.cargo.type, draft.step);
            case 'FINISHED':
                return 'پایان';
            case 'CANCELED':
                return 'لغو شده';
        }
    }

    getDuraton(date: Date, config?: { from?: Date; prefix?: string; suffix?: string }): string {
        const seconds: number = Math.floor(((config?.from || new Date()).getTime() - date.getTime()) / 1000);
        if (seconds <= 0) return '';

        const hour: number = Math.floor(seconds / 3600);
        const minute: number = Math.floor((seconds - hour * 3600) / 60);
        if (hour === 0 && minute === 0) return '';

        const duration: string[] = [];
        duration.push(hour > 0 ? hour.toString().padStart(2, '0') : '00');
        duration.push(minute > 0 ? minute.toString().padStart(2, '0') : '00');

        return `${config?.prefix || ''} ${duration.join(':')} ${config?.suffix || ''}`.trim();
    }

    getMenu(draft: ILoadDraftFlowDTO): NgxHelperMenu[] {
        return [
            { title: 'پرینت', icon: 'print', click: () => this.loadToolsService.downloadDraft(draft.code) },
            {
                title: 'لغو',
                icon: 'cancel',
                click: () => this.loadToolsService.cancelDraft(draft, this.loadList.bind(this)),
                color: 'warn',
                hideOn: () => draft.status !== 'ACTIVE' || !this.loadToolsService.canCancelDraft(draft),
            },
        ];
    }

    changeSetting(): void {
        this.ngxHelperBottomSheetService.open(
            DraftDailySettingComponent,
            'تنظیمات',
            () => (this.setting = this.loadToolsService.dailySetting),
        );
    }
}
