import { Injectable } from '@angular/core';

import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { IOptionDTO, ISharedPersonnelMemberDTO } from '@lib/apis';

import {
    SelectCourseComponent,
    SelectInstituteComponent,
    SelectMentorComponent,
    SelectParticipantComponent,
} from '../components';

@Injectable({ providedIn: 'root' })
export class EducationToolsService {
    constructor(private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService) {}

    selectCourse(callback: (course: IOptionDTO) => void, current?: string): void {
        this.ngxHelperBottomSheetService.open<IOptionDTO>(
            SelectCourseComponent,
            'انتخاب دوره',
            { data: { current } },
            (response) => callback(response),
        );
    }

    selectInstitute(callback: (institute: IOptionDTO) => void, current?: string): void {
        this.ngxHelperBottomSheetService.open<IOptionDTO>(
            SelectInstituteComponent,
            'انتخاب موسسه',
            { data: { current } },
            (response) => callback(response),
        );
    }

    selectMentor(callback: (mentor: IOptionDTO) => void, current?: string): void {
        this.ngxHelperBottomSheetService.open<IOptionDTO>(
            SelectMentorComponent,
            'انتخاب مدرس',
            { data: { current } },
            (response) => callback(response),
        );
    }

    selectParticipant(callback: (participant: ISharedPersonnelMemberDTO) => void, current?: string): void {
        this.ngxHelperBottomSheetService.open<ISharedPersonnelMemberDTO>(
            SelectParticipantComponent,
            'انتخاب شرکت کننده',
            { data: { current } },
            (response) => callback(response),
        );
    }
}
