import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, IPersonnelGroupFullRs, IPersonnelMemberDeleteRs, IPersonnelMemberDTO } from '@lib/apis';
import { IPageTitle } from '@lib/page';
import { UserService } from '@lib/providers';

import { MemberLogComponent } from '../log/member-log.component';

type Tab = 'STATUS' | 'UPDATE' | 'CODE' | 'EMPLOYEMENT' | 'DEPARTMENT' | 'POSITION' | 'EDUCATION';

@Component({
    host: { selector: 'member-info' },
    templateUrl: './member-info.component.html',
    styleUrl: './member-info.component.scss',
    standalone: false
})
export class MemberInfoComponent implements OnInit {
    public groups: IPersonnelGroupFullRs = this.activatedRoute.snapshot.data['groups'];
    public member: IPersonnelMemberDTO = this.activatedRoute.snapshot.data['member'];

    public title: IPageTitle = {
        title: 'مدیریت پرسنل',
        actions: [
            {
                title: 'گزارش تغییرات',
                icon: 'published_with_changes',
                action: this.log.bind(this),
                access: { access: 'PERSONNEL_ROLE_MEMBER' },
            },
            {
                type: 'DELETE',
                title: 'حذف پرسنل',
                action: this.delete.bind(this),
                access: { access: 'PERSONNEL_ROLE_MEMBER' },
            },
            { type: 'RETURN', action: ['/member'] },
        ],
    };

    public access: { manager: boolean; update: boolean; status: boolean } = {
        manager: this.userService.hasAccess({ group: 'MANAGER' }),
        update: this.userService.hasAccess({ access: ['PERSONNEL_MEMBER', 'PERSONNEL_ROLE_MEMBER'] }),
        status: this.userService.hasAccess({ access: ['PERSONNEL_STATUS', 'PERSONNEL_ROLE_MEMBER'] }),
    };

    public tabs: Partial<{ [key in Tab]: { title: string; index: number } }> = {};
    public activeTab: number = 0;

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly userService: UserService,
    ) {}

    ngOnInit(): void {
        this.setTabs();
        this.setMember(this.member);
    }

    setTabs(): void {
        let tabIndex = 0;
        this.tabs.STATUS = this.access.status ? { title: 'وضعیت استخدام', index: ++tabIndex } : undefined;
        this.tabs.UPDATE = this.access.update ? { title: 'ویرایش مشخصات', index: ++tabIndex } : undefined;
        this.tabs.CODE = this.access.manager ? { title: 'تغییر کد پرسنلی', index: ++tabIndex } : undefined;
        this.tabs.EMPLOYEMENT = this.access.manager ? { title: 'تغییر تاریخ استخدام', index: ++tabIndex } : undefined;
        this.tabs.DEPARTMENT = this.access.update ? { title: 'تغییر واحد', index: ++tabIndex } : undefined;
        this.tabs.POSITION = this.access.update ? { title: 'تغییر سمت', index: ++tabIndex } : undefined;
        this.tabs.EDUCATION = this.access.update ? { title: 'تغییر مدرک تحصیلی', index: ++tabIndex } : undefined;

        this.activeTab = this.tabs.STATUS?.index || 0;
    }

    setMember(member: IPersonnelMemberDTO): void {
        this.member = member;
    }

    log(): void {
        this.ngxHelperBottomSheetService.open(MemberLogComponent, 'گزارش تغییرات پرسنل', { data: { member: this.member } });
    }

    delete(): void {
        const item: string = 'پرسنل';
        const title: string = `${this.member.name.first} ${this.member.name.last}`;
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = this.member.id;
            this.apiService.request<IPersonnelMemberDeleteRs>('PersonnelMemberDelete', { ids: { ID } }, () => {
                this.router.navigate(['/member']);
                this.ngxHelperToastService.success('پرسنل با موفقیت حذف شد.');
            });
        });
    }
}
