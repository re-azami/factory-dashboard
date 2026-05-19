import { Injectable } from '@angular/core';

import { Helper } from '@webilix/helper-library';
import { NgxHelperBottomSheetService, NgxHelperHttpService, NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    ILoadDraftDownloadRs,
    ILoadDraftDTO,
    ILoadFlowCancelRq,
    ILoadFlowCancelRs,
    ILoadTruckDTO,
} from '@lib/apis';
import { ConfigService, DeviceService } from '@lib/providers';
import { LoadCargoInfo, LoadData, LoadDataInfo, LoadPrintPage, LoadPrintPageList, Storages } from '@lib/shared';

import {
    DraftCodeComponent,
    FlowCancelComponent,
    FlowCreateComponent,
    LogDataComponent,
    PrintPageComponent,
    TruckComponent,
} from '../components';

export interface IDraftDailySetting {
    readonly hidden: {
        readonly party: boolean;
        readonly shipment: boolean;
        readonly transporter: boolean;
        readonly driver: boolean;
        readonly mobile: boolean;
    };
}

@Injectable({ providedIn: 'root' })
export class LoadToolsService {
    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperHttpService: NgxHelperHttpService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly deviceService: DeviceService,
        private readonly configService: ConfigService,
    ) {}

    logData(type: LoadData, id: string): void {
        const title: string = `گزارش تغییرات ${LoadDataInfo[type].title}`;
        this.ngxHelperBottomSheetService.open(LogDataComponent, title, { data: { type, id } });
    }

    getPlate(plate: string): string {
        const [left, letter, right, iran] = plate.split('-');
        return [left, letter === 'ا' ? 'الف' : letter, right].join(' ') + ` / ایران ${iran}`;
    }

    canCancelDraft(draft: Pick<ILoadDraftDTO, 'step' | 'cargo'>): boolean {
        const disallowCancel = LoadCargoInfo[draft.cargo.type].disallowCancel;
        if (!disallowCancel) return true;

        const checkIndex: number = LoadCargoInfo[draft.cargo.type].steps.findIndex((s) => s.id === disallowCancel);
        const stepIndex: number = LoadCargoInfo[draft.cargo.type].steps.findIndex((s) => s.id === draft.step);

        return checkIndex === -1 || stepIndex === -1 || checkIndex >= stepIndex;
    }

    cancelDraft(draft: Pick<ILoadDraftDTO, 'id' | 'step' | 'cargo'>, callback: () => void): void {
        if (!this.canCancelDraft(draft)) return;

        this.ngxHelperBottomSheetService.open<{ description: string }>(
            FlowCancelComponent,
            'لغو حواله',
            { data: { draft }, disableClose: true },
            (response) => {
                const ID: string = draft.id;
                const body: ILoadFlowCancelRq = { description: response.description };
                this.apiService.request<ILoadFlowCancelRs>('LoadFlowCancel', { body, ids: { ID } }, () => {
                    callback();
                    this.ngxHelperToastService.success('حواله مورد نظر با موفقیت لغو شد.');
                });
            },
        );
    }

    createDraft(plate?: string): void {
        this.ngxHelperBottomSheetService.open(FlowCreateComponent, 'صدور حواله / بارکد', {
            data: { plate },
            disableClose: true,
        });
    }

    draftCode(callback: (draft: ILoadDraftDTO) => void): void {
        this.ngxHelperBottomSheetService.open<ILoadDraftDTO>(DraftCodeComponent, 'انتخاب حواله', (response) =>
            callback(response),
        );
    }

    downloadDraft(draft: string): void {
        const getDownloadPage = (): Promise<LoadPrintPage> => {
            return new Promise<LoadPrintPage>((resolve, reject) => {
                const page: LoadPrintPage | null = localStorage.getItem(Storages.LOAD_PRINT_PAGE) as LoadPrintPage;
                if (page && LoadPrintPageList.includes(page)) {
                    resolve(page);
                    return;
                }

                this.ngxHelperBottomSheetService.open<{ page: LoadPrintPage }>(
                    PrintPageComponent,
                    'انتخاب اندازه‌ی صفحه',
                    { disableClose: true },
                    (response) => (response && response.page ? resolve(response.page) : reject()),
                );
            });
        };

        getDownloadPage().then(
            (page: LoadPrintPage) => {
                this.apiService.request<ILoadDraftDownloadRs>(
                    'LoadDraftDownload',
                    { params: { draft, page } },
                    (response) => {
                        const url: string = this.configService.getApiUrl(response.path);

                        if (!this.deviceService.isMobile()) this.ngxHelperHttpService.printPDF(url);
                        else {
                            const file: string = response.path.split('/').slice(-1)[0];
                            this.ngxHelperHttpService.download(file, url);
                        }
                    },
                );
            },
            () => {},
        );
    }

    downloadFile(path: string, title: string): void {
        const getExt = (): string => {
            const name: string[] = path.split('.');
            return name.length > 1 ? name[name.length - 1] : '';
        };

        const ext: string = getExt();
        const url: string = this.configService.getApiUrl(path);
        const file: string = Helper.STRING.getFileName(title, ext);
        this.ngxHelperHttpService.download(file, url);
    }

    selectTruck(action: (turck: ILoadTruckDTO) => void): void {
        this.ngxHelperBottomSheetService.open<ILoadTruckDTO>(TruckComponent, 'جستجوی ناوگان', (response) =>
            action(response),
        );
    }

    //#region SETTING
    get dailySetting(): IDraftDailySetting {
        return {
            hidden: {
                party: localStorage.getItem(Storages.LOAD_HIDE_PARTY) === 'TRUE',
                shipment: localStorage.getItem(Storages.LOAD_HIDE_SHIPMENT) === 'TRUE',
                transporter: localStorage.getItem(Storages.LOAD_HIDE_TRANSPORTER) === 'TRUE',
                driver: localStorage.getItem(Storages.LOAD_HIDE_DRIVER) === 'TRUE',
                mobile: localStorage.getItem(Storages.LOAD_HIDE_MOBILE) === 'TRUE',
            },
        };
    }

    set dailySetting(setting: IDraftDailySetting) {
        // PARTY
        if (setting.hidden.party) localStorage.setItem(Storages.LOAD_HIDE_PARTY, 'TRUE');
        else localStorage.removeItem(Storages.LOAD_HIDE_PARTY);

        // SHIPMENT
        if (setting.hidden.shipment) localStorage.setItem(Storages.LOAD_HIDE_SHIPMENT, 'TRUE');
        else localStorage.removeItem(Storages.LOAD_HIDE_SHIPMENT);

        // TRANSPORTER
        if (setting.hidden.transporter) localStorage.setItem(Storages.LOAD_HIDE_TRANSPORTER, 'TRUE');
        else localStorage.removeItem(Storages.LOAD_HIDE_TRANSPORTER);

        // DRIVER
        if (setting.hidden.driver) localStorage.setItem(Storages.LOAD_HIDE_DRIVER, 'TRUE');
        else localStorage.removeItem(Storages.LOAD_HIDE_DRIVER);

        // MOBILE
        if (setting.hidden.mobile) localStorage.setItem(Storages.LOAD_HIDE_MOBILE, 'TRUE');
        else localStorage.removeItem(Storages.LOAD_HIDE_MOBILE);
    }
    //#endregion
}
