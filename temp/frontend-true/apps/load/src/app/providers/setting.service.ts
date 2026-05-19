import { Injectable } from '@angular/core';

import { ILoadSettingDTO } from '@lib/apis';
import { SettingService } from '@lib/providers';
import { Access, LoadFlow } from '@lib/shared';

@Injectable({ providedIn: 'root' })
export class LoadSettingService {
    get report(): 'CREATE' | 'FINISH' {
        return this.settingService.load.report;
    }

    get remaining(): 'KILO' | 'TON' {
        return this.settingService.load.remaining;
    }

    get order(): 'TITLE' | 'DATE' {
        return this.settingService.load.order;
    }

    get site(): boolean {
        return this.settingService.load.site;
    }

    get weight(): { multiply: number; empty: number; full: number } {
        return this.settingService.load.weight;
    }

    get update(): { cargo: Access; plate: Access; transporter: Access; weight: Access } {
        return this.settingService.load.update;
    }

    constructor(private readonly settingService: SettingService) {}

    getTools(flow: LoadFlow): 'PLATE' | 'SCAN' | 'BOTH' {
        const setting = this.settingService.load.tools;

        if (setting.plate.includes(flow)) return 'PLATE';
        if (setting.scan.includes(flow)) return 'SCAN';
        return 'BOTH';
    }

    getStep(
        step: string,
        setting: ILoadSettingDTO | Omit<ILoadSettingDTO, 'cargo'>,
    ): { status: 'ACTIVE' | 'DEACTIVE'; delay: number | undefined } {
        const data = setting.steps.find((s) => s.step === step);
        return { status: data?.status || 'ACTIVE', delay: data?.delay || undefined };
    }
}
