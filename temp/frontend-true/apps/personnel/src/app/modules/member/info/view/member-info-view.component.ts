import { Component, Input, OnInit } from '@angular/core';

import { IPersonnelMemberDTO } from '@lib/apis';
import { IPageBlock } from '@lib/page';
import { PersonnelGenderInfo, PersonnelMaritalInfo, PersonnelStatusInfo } from '@lib/shared';

@Component({
    selector: 'member-info-view',
    templateUrl: './member-info-view.component.html',
    styleUrl: './member-info-view.component.scss',
    standalone: false
})
export class MemberInfoViewComponent implements OnInit {
    @Input({ required: true }) member!: IPersonnelMemberDTO;

    public personnelStatusInfo = PersonnelStatusInfo;
    public personnelGenderInfo = PersonnelGenderInfo;
    public personnelMaritalInfo = PersonnelMaritalInfo;

    public blocks: IPageBlock[] = [];

    ngOnInit(): void {
        this.blocks = [
            { title: 'کد پرسنلی', value: this.member.code, english: true },
            { title: 'واحد', value: this.member.department.title },
            { title: 'سمت', value: this.member.position.title },
        ];
    }
}
