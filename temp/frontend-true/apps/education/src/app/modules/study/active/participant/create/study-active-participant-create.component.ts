import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { Helper } from '@webilix/helper-library';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';
import { NgxHelperMenu } from '@webilix/ngx-helper/menu';

import {
    ApiService,
    IEducationParticipantCreateRq,
    IEducationParticipantCreateRs,
    IEducationStudyDTO,
    IEducationStudyDataRs,
    ISharedPersonnelMemberDTO,
} from '@lib/apis';

@Component({
    host: { selector: 'study-active-participant-create' },
    templateUrl: './study-active-participant-create.component.html',
    styleUrl: './study-active-participant-create.component.scss',
    standalone: false
})
export class StudyActiveParticipantCreateComponent implements OnInit, OnDestroy {
    public study: IEducationStudyDTO = this.data.study;

    public personnels: ISharedPersonnelMemberDTO[] = [];
    public filter: { department?: string; query?: string; code?: string } = {};
    public selected: string[] = [];

    private departments: string[] =
        this.data.study.department.length === 0
            ? this.data.data.departments.map((d) => d.id)
            : this.data.study.department.map((d) => d.id);

    public departmentsMenu: NgxHelperMenu[] = [
        ...(this.data.study.department.length === 0 ? this.data.data.departments : this.data.study.department).map((d) => ({
            title: d.title,
            click: () => this.setDeprtmentFilter(d.id),
            disableOn: () => this.filter.department === d.id,
        })),
        'DIVIDER',
        { title: 'همه موارد', click: () => this.setDeprtmentFilter(), disableOn: () => !this.filter.department },
    ];

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA)
        private readonly data: { study: IEducationStudyDTO; data: IEducationStudyDataRs; selected: string[] },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        document.documentElement.style.setProperty('--ngxHelperDialogWidth', '800px');
        this.filterPersonnels();
    }

    ngOnDestroy(): void {
        document.documentElement.style.setProperty('--ngxHelperDialogWidth', '500px');
    }

    setDeprtmentFilter(deprtment?: string): void {
        if (deprtment && !this.departments.includes(deprtment)) deprtment = undefined;
        this.filter.department = deprtment;

        this.filterPersonnels();
    }

    setNameFilter(query?: string): void {
        query = typeof query === 'string' ? query.trim() || undefined : undefined;
        this.filter.query = query;

        this.filterPersonnels();
    }

    setCodeFilter(code?: string): void {
        code = typeof code === 'string' ? Helper.STRING.changeNumbers(code.trim(), 'EN') || undefined : undefined;
        this.filter.code = code;

        this.filterPersonnels();
    }

    toggle(id: string): void {
        if (!this.selected.includes(id)) this.selected.push(id);
        else this.selected = this.selected.filter((s) => s !== id);
    }

    filterPersonnels() {
        this.personnels = this.data.data.personnels
            .filter((p) => this.departments.includes(p.department.id))
            .filter((p) => !this.data.selected.includes(p.id));

        const department = this.filter.department;
        if (department) this.personnels = this.personnels.filter((p) => p.department.id === department);

        const query = this.filter.query;
        if (query) this.personnels = this.personnels.filter((p) => `${p.name.first} ${p.name.last}`.includes(query));

        const code = this.filter.code;
        if (code) this.personnels = this.personnels.filter((p) => p.code.includes(code));
    }

    select(): void {
        if (this.selected.length === 0) return;

        const maximum: number = this.study.participant.maximum - this.study.participant.count;
        if (this.selected.length > maximum) {
            this.ngxHelperToastService.error(`امکان انتخاب بیش از ${maximum} شرکت‌کننده وجود ندارد.`);
            return;
        }

        const STUDYID: string = this.data.study.id;
        const body: IEducationParticipantCreateRq = { participants: this.selected };
        this.apiService.request<IEducationParticipantCreateRs>(
            'EducationParticipantCreate',
            { body, ids: { STUDYID } },
            (response) => this.ngxHelperBottomSheetService.close(response),
        );
    }
}
