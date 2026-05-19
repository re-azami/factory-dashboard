import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { JalaliDateTime } from '@webilix/jalali-date-time';
import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { NgxHelperMonthPipe } from '@webilix/ngx-helper/pipe';

import {
    ApiService,
    IPersonnelMemberDTO,
    IPersonnelMemberEmployementDeleteRs,
    IPersonnelMemberEmployementLogDTO,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageBlock, IPageCardButton } from '@lib/page';
import { PersonnelStatus, PersonnelStatusInfo } from '@lib/shared';

import { MemberStatusActiveComponent } from './active/member-status-active.component';
import { MemberStatusDeactiveComponent } from './deactive/member-status-deactive.component';

@Component({
    selector: 'member-status',
    templateUrl: './member-status.component.html',
    styleUrl: './member-status.component.scss',
    standalone: false
})
export class MemberStatusComponent implements OnInit {
    @Input({ required: true }) member!: IPersonnelMemberDTO;

    @Output() updated: EventEmitter<IPersonnelMemberDTO> = new EventEmitter<IPersonnelMemberDTO>();
    @Output() canceled: EventEmitter<void> = new EventEmitter<void>();

    public blocks: IPageBlock[][] = [];
    public buttons: IPageCardButton[] = [];

    public list: IList<IPersonnelMemberEmployementLogDTO> = {
        type: 'تغییر وضعیت استخدام',
        description: (data) => data.description,
        icon: (data) => ({
            icon: PersonnelStatusInfo[data.status].icon,
            color: PersonnelStatusInfo[data.status].color,
        }),
        columns: [
            { title: 'تغییر وضعیت', value: (data) => PersonnelStatusInfo[data.status].title },
            { title: 'تاریخ', value: 'date', type: 'DATE' },
        ],
        actions: [
            {
                type: 'DELETE',
                action: this.delete.bind(this),
                hideOn: (data) =>
                    this.member.employement.logs.length === 0 ||
                    data.id !== this.member.employement.logs[this.member.employement.logs.length - 1].id,
            },
        ],
    };

    private jalali = JalaliDateTime();
    private monthPipe = new NgxHelperMonthPipe().transform;

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        this.setData();
    }

    setMember(member: IPersonnelMemberDTO): void {
        this.member = member;
        this.updated.emit(member);

        this.setData();
    }

    setData(): void {
        this.blocks = [
            [
                { title: 'کد پرسنلی', value: this.member.code, english: true },
                { title: 'وضعیت استخدام', value: PersonnelStatusInfo[this.member.employement.status].title },
            ],
            [
                { title: 'تاریخ استخدام', value: this.jalali.toTitle(this.member.employement.date) },
                { title: 'مدت استخدام', value: this.monthPipe(this.member.employement.month) },
            ],
        ];

        this.buttons =
            this.member.employement.status !== 'ACTIVE'
                ? [{ icon: PersonnelStatusInfo['ACTIVE'].icon, title: 'بازگشت به کار', action: this.active.bind(this) }]
                : (['SUSPEND', 'LEFT', 'FIRED'] as PersonnelStatus[]).map((status: PersonnelStatus) => ({
                      icon: PersonnelStatusInfo[status].icon,
                      title: PersonnelStatusInfo[status].title,
                      color: PersonnelStatusInfo[status].color,
                      action: () => this.deactive(status),
                  }));
    }

    active(): void {
        if (this.member.employement.status === 'ACTIVE') return;

        this.ngxHelperBottomSheetService.open<IPersonnelMemberDTO>(
            MemberStatusActiveComponent,
            'فعال کردن وضعیت استخدام',
            { data: { member: this.member, status } },
            (response) => {
                this.setMember(response);
                this.ngxHelperToastService.success('وضعیت استخدام با موفقیت ثبت شد.');
            },
        );
    }

    deactive(status: PersonnelStatus): void {
        if (this.member.employement.status !== 'ACTIVE') return;

        this.ngxHelperBottomSheetService.open<IPersonnelMemberDTO>(
            MemberStatusDeactiveComponent,
            'غیرفعال کردن وضعیت استخدام',
            { data: { member: this.member, status } },
            (response) => {
                this.setMember(response);
                this.ngxHelperToastService.success('وضعیت استخدام با موفقیت ثبت شد.');
            },
        );
    }

    delete(log: IPersonnelMemberEmployementLogDTO): void {
        if (
            this.member.employement.logs.length === 0 ||
            this.member.employement.logs[this.member.employement.logs.length - 1].id !== log.id
        )
            return;

        const item: string = 'تغییر وضعیت';
        const title: string = PersonnelStatusInfo[log.status].title;
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const MEMBERID: string = this.member.id;
            const ID: string = log.id;
            this.apiService.request<IPersonnelMemberEmployementDeleteRs>(
                'PersonnelMemberEmployementDelete',
                { ids: { MEMBERID, ID } },
                (response) => {
                    this.setMember(response);
                    this.ngxHelperToastService.success('تغییر وضعیت استخدام با موفقیت حذف شد.');
                },
            );
        });
    }
}
