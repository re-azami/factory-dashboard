import { Component, OnDestroy, OnInit } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { INgxForm, NgxFormInputs } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperParamValue, NgxHelperParam } from '@webilix/ngx-helper/param';

import { ApiService, ILoadDraftFlowDTO, ILoadFlowListRs } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle, PageTitleAction } from '@lib/page';
import { LoadCargo, LoadCargoInfo, LoadCargoList, LoadFlow, LoadFlowInfo } from '@lib/shared';

import { LoadFlowService, LoadSettingService, LoadToolsService } from '../../providers';

import { FlowPlateComponent } from './plate/flow-plate.component';
import { FlowScanComponent } from './scan/flow-scan.component';

import { FlowBuyDischargeComponent } from './buy/discharge/flow-buy-discharge.component';
import { FlowBuyExitComponent } from './buy/exit/flow-buy-exit.component';
import { FlowBuyWeightEmptyComponent } from './buy/weight-empty/flow-buy-weight-empty.component';
import { FlowBuyWeightFullComponent } from './buy/weight-full/flow-buy-weight-full.component';

import { FlowInDischargeComponent } from './in/discharge/flow-in-discharge.component';
import { FlowInEnterMineComponent } from './in/enter-mine/flow-in-enter-mine.component';
import { FlowInEnterComponent } from './in/enter/flow-in-enter.component';
import { FlowInExitMineComponent } from './in/exit-mine/flow-in-exit-mine.component';
import { FlowInExitComponent } from './in/exit/flow-in-exit.component';
import { FlowInLoadingMineComponent } from './in/loading-mine/flow-in-loading-mine.component';
import { FlowInWeightFullComponent } from './in/weight-full/flow-in-weight-full.component';

import { FlowOutExitComponent } from './out/exit/flow-out-exit.component';
import { FlowOutLoadingComponent } from './out/loading/flow-out-loading.component';
import { FlowOutWeightEmptyComponent } from './out/weight-empty/flow-out-weight-empty.component';
import { FlowOutWeightFullComponent } from './out/weight-full/flow-out-weight-full.component';
import { FlowInWeightEmptyComponent } from 'apps/load/src/app/modules/flow/in/weight-empty/flow-in-weight-empty.component';

@Component({
    host: { selector: 'flow' },
    templateUrl: './flow.component.html',
    styleUrl: './flow.component.scss',
    standalone: false
})
export class FlowComponent implements OnInit, OnDestroy {
    public flow: LoadFlow = this.activatedRoute.snapshot.data['flow'];
    public title: IPageTitle = { title: 'فرایند :: ' + LoadFlowInfo[this.flow].title };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public drafts: ILoadDraftFlowDTO[] = [];
    public filtered: ILoadDraftFlowDTO[] = [];

    public list: IList<ILoadDraftFlowDTO> = {
        type: 'حواله',
        columns: [
            { title: 'ثبت', value: (data) => data.date.create, type: 'DATE', format: 'H:I' },
            { title: 'شماره حواله', value: 'code', english: true, isTitle: true },
            { value: 'plate', type: 'PLATE', isDescription: true },
            { title: 'بار', value: (data) => data.cargo.title, description: (data) => LoadCargoInfo[data.cargo.type].title },
            { title: 'طرف حساب', value: (data) => data.cargo.party?.title || '' },
            { title: 'محموله', value: (data) => data.cargo.shipment?.title || '' },
            {
                title: 'فرایند',
                value: (data) => LoadCargoInfo[data.cargo.type].steps.find((s) => s.id === data.step)?.title || '',
            },
            {
                title: 'مرحله قبل',
                value: (data) =>
                    data.previousStep
                        ? LoadCargoInfo[data.cargo.type].steps.find((s) => s.id === data.previousStep?.step)?.title || ''
                        : '',
                description: (data) => {
                    if (!data.previousStep) return undefined;

                    const date: Date = data.previousStep.date;
                    const seconds: number = Math.floor((new Date().getTime() - date.getTime()) / 1000);
                    if (seconds <= 60) return '';

                    const hour: number = Math.floor(seconds / 3600);
                    const minute: number = Math.floor((seconds - hour * 3600) / 60);

                    const duration: string[] = [];
                    duration.push(hour > 0 ? hour.toString().padStart(2, '0') : '00');
                    duration.push(minute > 0 ? minute.toString().padStart(2, '0') : '00');
                    return `${duration.join(':')} قبل`;
                },
                color: 'rgba(0, 0, 0, 0.5)',
            },
            {
                title: 'تاخیر',
                value: (data) => {
                    if (!data.delay || !data.previousStep) return;

                    const date: Date = data.previousStep.date;
                    const seconds: number = Math.floor((new Date().getTime() - date.getTime()) / 1000);

                    const delay: number = seconds - data.delay * 60;
                    if (delay <= 0) return;
                    if (delay < 60) return 'دارد';

                    const hour: number = Math.floor(delay / 3600);
                    const minute: number = Math.floor((delay - hour * 3600) / 60);

                    const duration: string[] = [];
                    duration.push(hour > 0 ? hour.toString().padStart(2, '0') : '00');
                    duration.push(minute > 0 ? minute.toString().padStart(2, '0') : '00');
                    return duration.join(':');
                },
                color: 'var(--warnColor)',
            },
        ],
        action: { icon: 'done_all', action: this.action.bind(this) },
        actions: [
            {
                title: 'پرینت حواله',
                icon: 'print',
                action: (data: ILoadDraftFlowDTO) => this.loadToolsService.downloadDraft(data.code),
            },
            {
                title: 'لغو حواله',
                icon: 'cancel',
                color: 'warn',
                action: (data: ILoadDraftFlowDTO) => this.loadToolsService.cancelDraft(data, this.loadList.bind(this)),
                access: { access: 'LOAD_FLOW_CANCEL' },
                hideOn: (data: ILoadDraftFlowDTO) => !this.loadToolsService.canCancelDraft(data),
            },
        ],
    };

    private loadIndex: number = 0;
    private loadInterval: any;
    private onTruckWeighted?: Subscription;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly loadFlowService: LoadFlowService,
        private readonly loadSettingService: LoadSettingService,
        private readonly loadToolsService: LoadToolsService,
    ) {}

    ngOnInit(): void {
        const tools = this.loadSettingService.getTools(this.flow);
        const actions: PageTitleAction[] = [];
        if (tools === 'BOTH' || tools === 'SCAN')
            actions.push({ title: 'اسکن حواله', icon: 'qr_code_scanner', action: this.scan.bind(this) });
        if (tools === 'BOTH' || tools === 'PLATE')
            actions.push({ title: 'جستجوی پلاک', icon: 'pin', action: this.plate.bind(this) });
        this.title = { ...this.title, actions };

        this.loadList(true);
        this.loadInterval = setInterval(this.loadList.bind(this), 15_000);

        this.onTruckWeighted = this.loadFlowService.onTruckWeighted.subscribe({ next: () => this.loadList() });
    }

    ngOnDestroy(): void {
        if (this.loadInterval) clearInterval(this.loadInterval);
        this.onTruckWeighted?.unsubscribe();
    }

    loadList(firstLoad?: boolean): void {
        this.apiService.request<ILoadFlowListRs>(
            'LoadFlowList',
            { params: { flow: this.flow }, silent: !firstLoad, loading: !!firstLoad },
            (response, index) => {
                if (this.loadIndex > index) return;
                this.loadIndex = index;

                this.loading = false;
                this.drafts = response.sort((d1, d2) =>
                    !d1.previousStep || !d2.previousStep
                        ? 0
                        : d1.previousStep.date.getTime() - d2.previousStep.date.getTime(),
                );
                this.filterList();

                const cargos: Map<string, string> = new Map<string, string>();
                response.forEach((r) => {
                    if (cargos.has(r.cargo.id)) return;
                    cargos.set(r.cargo.id, r.cargo.title);
                });

                const paramType: NgxHelperParam = {
                    name: 'type',
                    type: 'SELECT',
                    title: 'نوع بار',
                    options: [
                        ...LoadCargoList.filter((c: LoadCargo) => c !== 'SITE').map((c: LoadCargo) => ({
                            id: c,
                            title: LoadCargoInfo[c].title,
                        })),
                        'DIVIDER',
                        { id: 'ALL-IN', title: 'بارهای ورودی' },
                        { id: 'ALL-OUT', title: 'بارهای خروجی' },
                    ],
                };
                const paramCargo: NgxHelperParam = {
                    name: 'cargo',
                    type: 'SELECT',
                    title: 'بار',
                    options: [...cargos.keys()].map((k) => ({ id: k, title: cargos.get(k) || '' })),
                };

                const options: { id: string; title: string }[] = [];
                LoadCargoList.forEach((cargo: LoadCargo) => {
                    LoadCargoInfo[cargo].steps.forEach((step) => {
                        if (step.flow !== this.flow || !step.filter) return;
                        if (options.find((o) => o.id === step.id && o.title === step.title)) return;

                        options.push({ id: step.id, title: step.title });
                    });
                });
                const stepParam: NgxHelperParam | undefined =
                    options.length === 0 ? undefined : { name: 'step', type: 'SELECT', title: 'فرایند', options };

                this.title = {
                    ...this.title,
                    toolbar: {
                        route: ['/flow', this.flow],
                        params: stepParam ? [paramType, paramCargo, stepParam] : [paramType, paramCargo],
                    },
                };
            },
        );
    }

    filterList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const type: string = this.params?.params?.['type']?.param || '';
        const cargo: string = this.params?.params?.['cargo']?.param || '';
        const step: string = this.params?.params?.['step']?.param || '';
        this.filtered = this.drafts.filter((d) => {
            if (type) {
                switch (type) {
                    case 'ALL-IN':
                        if (d.cargo.type !== 'IN' && d.cargo.type !== 'BUY') return false;
                        break;
                    case 'ALL-OUT':
                        if (d.cargo.type !== 'OUT') return false;
                        break;
                    default:
                        if (d.cargo.type !== type) return false;
                        break;
                }
            }
            if (cargo && d.cargo.id !== cargo) return false;
            if (step && d.step !== step) return false;

            return true;
        });
    }

    scan(): void {
        this.ngxHelperBottomSheetService.open<{ id: string; plate: string; code: string }>(
            FlowScanComponent,
            'اسکن حواله',
            { data: { flow: this.flow, drafts: this.drafts }, disableClose: true },
            (response) => {
                const draft = this.drafts.find((d) => d.plate === response.plate);
                if (draft) this.action(draft);
            },
        );
    }

    plate(): void {
        this.ngxHelperBottomSheetService.open<{ plate: string }>(
            FlowPlateComponent,
            'جستجوی پلاک',
            { data: { drafts: this.drafts }, disableClose: true },
            (response) => {
                const draft = this.drafts.find((d) => d.plate === response.plate);
                if (draft) this.action(draft);
            },
        );
    }

    action(draft: ILoadDraftFlowDTO): void {
        const step = LoadCargoInfo[draft.cargo.type].steps.find((s) => s.id === draft.step);
        if (!step) return;

        let component: ComponentType<any> | null = null;
        switch (draft.cargo.type) {
            case 'OUT':
                switch (draft.step) {
                    case 'WEIGHT_EMPTY':
                        component = FlowOutWeightEmptyComponent;
                        break;
                    case 'LOADING':
                        component = FlowOutLoadingComponent;
                        break;
                    case 'WEIGHT_FULL':
                        component = FlowOutWeightFullComponent;
                        break;
                    case 'EXIT':
                        component = FlowOutExitComponent;
                        break;
                }
                break;
            case 'IN':
                switch (draft.step) {
                    case 'ENTER_MINE':
                        component = FlowInEnterMineComponent;
                        break;
                    case 'LOADING_MINE':
                        component = FlowInLoadingMineComponent;
                        break;
                    case 'EXIT_MINE':
                        component = FlowInExitMineComponent;
                        break;
                    case 'ENTER':
                        component = FlowInEnterComponent;
                        break;
                    case 'WEIGHT_FULL':
                        component = FlowInWeightFullComponent;
                        break;
                    case 'DISCHARGE':
                        component = FlowInDischargeComponent;
                        break;
                    case 'WEIGHT_EMPTY':
                        component = FlowInWeightEmptyComponent;
                        break;
                    case 'EXIT':
                        component = FlowInExitComponent;
                        break;
                }
                break;
            case 'BUY':
                switch (draft.step) {
                    case 'WEIGHT_FULL':
                        component = FlowBuyWeightFullComponent;
                        break;
                    case 'DISCHARGE':
                        component = FlowBuyDischargeComponent;
                        break;
                    case 'WEIGHT_EMPTY':
                        component = FlowBuyWeightEmptyComponent;
                        break;
                    case 'EXIT':
                        component = FlowBuyExitComponent;
                        break;
                }
                break;
        }

        if (!component) return;

        const cargoInput: NgxFormInputs = {
            type: 'COMMENT',
            title: `بار ${LoadCargoInfo[draft.cargo.type].title}`,
            value: draft.cargo.title,
        };

        const ngxForm: INgxForm = {
            submit: 'ثبت اطلاعات',
            inputs: [
                {
                    inputs: [
                        { type: 'COMMENT', title: 'حواله', value: draft.code, english: true },
                        { type: 'COMMENT', title: 'ناوگان', value: draft.truck ? draft.truck.type : 'ثبت نشده' },
                    ],
                    flex: [0.5],
                },
                draft.transporter
                    ? [cargoInput, { type: 'COMMENT', title: 'باربری', value: draft.transporter.title }]
                    : cargoInput,
            ],
            buttons: [{ title: 'انصراف', action: () => this.ngxHelperBottomSheetService.close() }],
        };

        this.ngxHelperBottomSheetService.open<ILoadDraftFlowDTO>(component, step.title, { data: { draft, ngxForm } }, () => {
            this.ngxHelperToastService.success(`${step.title} با موفقیت ثبت شد.`);
            this.loadList();
        });
    }
}
