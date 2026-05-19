import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { NgxHelperCoordinatesService } from '@webilix/ngx-helper';

import { ApiService, IPersonnelLogDTO, IPersonnelMemberDTO, IPersonnelMemberLogRs } from '@lib/apis';
import { PersonnelLogInfo, PersonnelStatusInfo } from '@lib/shared';

@Component({
    host: { selector: 'member-log' },
    templateUrl: './member-log.component.html',
    styleUrl: './member-log.component.scss',
    standalone: false
})
export class MemberLogComponent implements OnInit {
    public personnelLogInfo = PersonnelLogInfo;

    public loading: boolean = true;
    public logs: IPersonnelLogDTO[] = [];

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { member: IPersonnelMemberDTO },
        private readonly ngxHelperCoordinatesService: NgxHelperCoordinatesService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        const ID: string = this.data.member.id;
        this.apiService.request<IPersonnelMemberLogRs>('PersonnelMemberLog', { ids: { ID } }, (response) => {
            this.loading = false;
            this.logs = response;
        });
    }

    getStatus(info: string): string {
        switch (info) {
            case 'ACTIVE':
            case 'SUSPEND':
            case 'LEFT':
            case 'FIRED':
                return PersonnelStatusInfo[info].title;
            default:
                return '';
        }
    }

    showLocation(latitude: number, longitude: number): void {
        this.ngxHelperCoordinatesService.show({ latitude, longitude });
    }
}
