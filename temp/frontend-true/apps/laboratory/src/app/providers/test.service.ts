import { Injectable } from '@angular/core';

import { JalaliDateTime } from '@webilix/jalali-date-time';
import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import {
    ApiTypes,
    ILaboratorySolidTestDTO,
    ILaboratoryTestDavisRecoveryDTO,
    ILaboratoryTestFeDTO,
    ILaboratoryTestFeODTO,
    ILaboratoryTestGrindDTO,
    ILaboratoryTestMoistureDTO,
    ILaboratoryTestSulphurDTO,
} from '@lib/apis';
import { SettingService } from '@lib/providers';
import { LaboratoryResultInfo, LaboratorySolid } from '@lib/shared';

import {
    InfoFeComponent,
    InfoFeoComponent,
    InfoGrindComponent,
    InfoMoistureComponent,
    LogComponent,
    TestDavisRecoveryComponent,
    TestFeComponent,
    TestFeoComponent,
    TestGrindComponent,
    TestMoistureComponent,
    TestSolidComponent,
    TestSulphurComponent,
} from '../components';

@Injectable({ providedIn: 'root' })
export class LaboratoryTestService {
    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly settingService: SettingService,
    ) {}

    getFe(standard: number, fe?: ILaboratoryTestFeDTO, test?: string): Promise<ILaboratoryTestFeDTO | undefined> {
        return new Promise<ILaboratoryTestFeDTO | undefined>((resolve) => {
            this.ngxHelperBottomSheetService.open<{ fe?: ILaboratoryTestFeDTO }>(
                TestFeComponent,
                `محاسبه نتیجه آزمایش ${LaboratoryResultInfo['FE'].title}`,
                { data: { standard, fe, test }, disableClose: true },
                (response) => resolve(response.fe),
            );
        });
    }

    showFe(fe: ILaboratoryTestFeDTO): void {
        this.ngxHelperBottomSheetService.open(InfoFeComponent, `جزئیات آزمایش ${LaboratoryResultInfo['FE'].title}`, {
            data: { fe },
        });
    }

    getFeO(standard: number, feo?: ILaboratoryTestFeODTO, test?: string): Promise<ILaboratoryTestFeODTO | undefined> {
        return new Promise<ILaboratoryTestFeODTO | undefined>((resolve) => {
            this.ngxHelperBottomSheetService.open<{ feo?: ILaboratoryTestFeODTO }>(
                TestFeoComponent,
                `محاسبه نتیجه آزمایش ${LaboratoryResultInfo['FEO'].title}`,
                { data: { standard, feo, test }, disableClose: true },
                (response) => resolve(response.feo),
            );
        });
    }

    showFeO(feo: ILaboratoryTestFeODTO): void {
        this.ngxHelperBottomSheetService.open(InfoFeoComponent, `جزئیات آزمایش ${LaboratoryResultInfo['FEO'].title}`, {
            data: { feo },
        });
    }

    getGrind(
        type: 'NONE' | 'FEED' | 'CONCENTRATE' | 'BALLMILL' | 'HYDROCYCLONE' | 'THICKENER',
        grind?: ILaboratoryTestGrindDTO,
        test?: string,
    ): Promise<ILaboratoryTestGrindDTO | undefined> {
        let sizes: number[] = [];
        let total: number;
        switch (type) {
            case 'FEED':
                sizes = [8000, 5600, 4750, 3350, 2800, 2000, 1400, 1000, 710, 500, 355, 212, 125, 106, 45, 0];
                break;
            case 'CONCENTRATE':
                sizes = [250, 180, 125, 90, 63, 45, 0];
                total = 50.05;
                break;
            case 'BALLMILL':
                sizes = [500, 355, 212, 150, 125, 106, 63, 45, 0];
                total = 50.05;
                break;
            case 'HYDROCYCLONE':
                sizes = [250, 180, 125, 90, 63, 45, 0];
                total = 50.05;
                break;
            case 'THICKENER':
                sizes = [300, 212, 150, 125, 106, 63, 45, 0];
                total = 50.05;
                break;
        }

        return new Promise<ILaboratoryTestGrindDTO | undefined>((resolve) => {
            this.ngxHelperBottomSheetService.open<{ grind?: ILaboratoryTestGrindDTO }>(
                TestGrindComponent,
                `محاسبه نتیجه آزمایش ${LaboratoryResultInfo['GRIND'].title}`,
                { data: { sizes, total, grind, test }, disableClose: true },
                (response) => resolve(response.grind),
            );
        });
    }

    showGrind(grind: ILaboratoryTestGrindDTO): void {
        this.ngxHelperBottomSheetService.open(InfoGrindComponent, `جزئیات آزمایش ${LaboratoryResultInfo['GRIND'].title}`, {
            data: { grind },
        });
    }

    getMoisture(moisture?: ILaboratoryTestMoistureDTO, test?: string): Promise<ILaboratoryTestMoistureDTO | undefined> {
        return new Promise<ILaboratoryTestMoistureDTO | undefined>((resolve) => {
            this.ngxHelperBottomSheetService.open<{ moisture?: ILaboratoryTestMoistureDTO }>(
                TestMoistureComponent,
                `محاسبه نتیجه آزمایش ${LaboratoryResultInfo['MOISTURE'].title}`,
                { data: { moisture, test }, disableClose: true },
                (response) => resolve(response.moisture),
            );
        });
    }

    showMoisture(moisture: ILaboratoryTestMoistureDTO): void {
        this.ngxHelperBottomSheetService.open(
            InfoMoistureComponent,
            `جزئیات آزمایش ${LaboratoryResultInfo['MOISTURE'].title}`,
            { data: { moisture } },
        );
    }

    getSulphur(sulphur?: ILaboratoryTestSulphurDTO, test?: string): Promise<ILaboratoryTestSulphurDTO | undefined> {
        return new Promise<ILaboratoryTestSulphurDTO | undefined>((resolve) => {
            this.ngxHelperBottomSheetService.open<{ sulphur?: ILaboratoryTestSulphurDTO }>(
                TestSulphurComponent,
                `محاسبه نتیجه آزمایش ${LaboratoryResultInfo['SULPHUR'].title}`,
                { data: { sulphur, test }, disableClose: true },
                (response) => resolve(response.sulphur),
            );
        });
    }

    getDavisRecovery(recovery?: ILaboratoryTestDavisRecoveryDTO): Promise<ILaboratoryTestDavisRecoveryDTO | undefined> {
        return new Promise<ILaboratoryTestDavisRecoveryDTO | undefined>((resolve) => {
            this.ngxHelperBottomSheetService.open<{ recovery?: ILaboratoryTestDavisRecoveryDTO }>(
                TestDavisRecoveryComponent,
                'محاسبه نتیجه آزمایش ریکاوری',
                { data: { recovery }, disableClose: true },
                (response) => resolve(response.recovery),
            );
        });
    }

    getSolid(test: LaboratorySolid, solid?: ILaboratorySolidTestDTO): Promise<ILaboratorySolidTestDTO | undefined> {
        return new Promise<ILaboratorySolidTestDTO | undefined>((resolve) => {
            this.ngxHelperBottomSheetService.open<{ solid?: ILaboratorySolidTestDTO }>(
                TestSolidComponent,
                'محاسبه نتیجه آزمایش درصد جامد',
                { data: { test, solid }, disableClose: true },
                (response) => resolve(response.solid),
            );
        });
    }

    /***********************************************
     ***********************************************
     ***********************************************/

    getShiftTimes(shift: 'DAY' | 'NIGHT'): { begin: Date; end: Date } {
        const jalali = JalaliDateTime();
        const date: Date = jalali.periodDay(1, new Date(new Date().getTime() - 24 * 3600 * 1000)).from;
        const begin: Date = new Date(date.getTime() + (shift === 'NIGHT' ? 19 : 7) * 3600 * 1000);

        let end: Date = new Date(begin.getTime() + 12 * 3600 * 1000);
        if (end.getTime() >= new Date().getTime()) end = new Date(new Date().getTime() - 2000);

        return { begin, end };
    }

    getTimeDescription(begin: Date, end: Date): string | undefined {
        const jalali = JalaliDateTime();
        const format: string = 'Y-M-D';

        const bDate: string = jalali.toString(begin, { format });
        const eDate: string = jalali.toString(end, { format });
        if (bDate === eDate) return undefined;

        return jalali.toTitle(end, { format: 'd N' });
    }

    inputJump(index: number, event: KeyboardEvent, reverse?: boolean): void {
        if (!this.settingService.laboratory.jump.active) return;

        switch (this.settingService.laboratory.jump.key) {
            case 'SHIFT':
                if (!event.shiftKey) return;
                break;
            case 'CTRL':
                if (!event.ctrlKey) return;
                break;
        }

        const currentId: string = `ID-input-${index}`;
        const input: HTMLInputElement = document.getElementById(currentId) as HTMLInputElement;
        if (!input) return;

        if (event.key === (reverse ? 'ArrowRight' : 'ArrowLeft')) {
            const nextId: string = `ID-input-${index + 1}`;
            const next = document.getElementById(nextId) as HTMLInputElement;
            if (!next) return;

            next.focus();
            next.selectionStart = 0;
            next.selectionEnd = next.value?.length || 0;
        }

        if (event.key === (reverse ? 'ArrowLeft' : 'ArrowRight')) {
            const previousId: string = `ID-input-${index - 1}`;
            const previous = document.getElementById(previousId) as HTMLInputElement;
            if (!previous) return;

            previous.focus();
            previous.selectionStart = 0;
            previous.selectionEnd = previous.value?.length || 0;
        }
    }

    showLog(api: ApiTypes, id: string): void {
        this.ngxHelperBottomSheetService.open(LogComponent, 'گزارش تغییرات نتایج آزمایش', { data: { api, id } });
    }
}
