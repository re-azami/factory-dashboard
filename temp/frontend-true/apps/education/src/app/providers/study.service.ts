import { Injectable } from '@angular/core';

import { NgxHelperBottomSheetService, NgxHelperHttpService } from '@webilix/ngx-helper';

import {
    ApiService,
    IEducationExportStudyExpenseRq,
    IEducationExportStudyExpenseRs,
    IEducationExportStudyParticipantRq,
    IEducationExportStudyParticipantRs,
    IEducationStudyDTO,
    IEducationStudyExportRq,
    IEducationStudyExportRs,
} from '@lib/apis';
import { ConfigService } from '@lib/providers';
import { ExportType } from '@lib/shared';

import { StudyLogComponent } from '../modules/study/log/study-log.component';

@Injectable({ providedIn: 'root' })
export class EducationStudyService {
    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperHttpService: NgxHelperHttpService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
    ) {}

    showLog(study: IEducationStudyDTO): void {
        this.ngxHelperBottomSheetService.open(StudyLogComponent, 'گزارش تغییرات برگزاری دوره', { data: { study } });
    }

    exportStudy(study: IEducationStudyDTO, type: ExportType): void {
        const ID: string = study.id;
        const body: IEducationStudyExportRq = { type };
        this.apiService.request<IEducationStudyExportRs>('EducationStudyExport', { body, ids: { ID } }, (response) => {
            const file: string = response.path.split('/').slice(-1)[0];
            this.ngxHelperHttpService.download(file, this.configService.getApiUrl(response.path));
        });
    }

    exportStudyParticipant(study: IEducationStudyDTO, type: ExportType): void {
        const ID: string = study.id;
        const body: IEducationExportStudyParticipantRq = { type };
        this.apiService.request<IEducationExportStudyParticipantRs>(
            'EducationExportStudyParticipant',
            { body, ids: { ID } },
            (response) => {
                const file: string = response.path.split('/').slice(-1)[0];
                this.ngxHelperHttpService.download(file, this.configService.getApiUrl(response.path));
            },
        );
    }

    exportStudyExpense(study: IEducationStudyDTO, type: ExportType): void {
        const ID: string = study.id;
        const body: IEducationExportStudyExpenseRq = { type };
        this.apiService.request<IEducationExportStudyExpenseRs>(
            'EducationExportStudyExpense',
            { body, ids: { ID } },
            (response) => {
                const file: string = response.path.split('/').slice(-1)[0];
                this.ngxHelperHttpService.download(file, this.configService.getApiUrl(response.path));
            },
        );
    }
}
