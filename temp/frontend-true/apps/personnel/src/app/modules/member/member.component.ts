import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { INgxHelperParamValue } from '@webilix/ngx-helper/param';
import { NgxHelperMonthPipe } from '@webilix/ngx-helper/pipe';

import { ApiService, IPaginationDTO, IPersonnelGroupFullRs, IPersonnelMemberDTO, IPersonnelMemberListRs } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { PersonnelStatus, PersonnelStatusInfo, PersonnelStatusList } from '@lib/shared';

@Component({
    host: { selector: 'member' },
    templateUrl: './member.component.html',
    styleUrl: './member.component.scss',
    standalone: false
})
export class MemberComponent {
    public groups: IPersonnelGroupFullRs = this.activatedRoute.snapshot.data['groups'];

    public page: number = 1;
    public title: IPageTitle = {
        title: 'مدیریت پرسنل',
        toolbar: {
            route: ['/member'],
            params: [
                {
                    name: 'status',
                    type: 'MENU',
                    options: PersonnelStatusList.map((status: PersonnelStatus) => ({
                        title: PersonnelStatusInfo[status].title,
                        value: status,
                    })),
                    icon: 'account_circle',
                },
                { name: 'department', type: 'SELECT', title: 'واحد', options: this.groups.department },
                { name: 'position', type: 'SELECT', title: 'سمت', options: this.groups.position },
                { name: 'query', type: 'SEARCH' },
            ],
        },
        actions: [{ type: 'CREATE', title: 'ثبت پرسنل', action: ['/member', 'create'] }],
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public members: IPersonnelMemberDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<IPersonnelMemberDTO> = {
        type: 'پرسنل',
        isDeactive: (data) => data.employement.status !== 'ACTIVE',
        icon: (data) => ({
            icon: PersonnelStatusInfo[data.employement.status].icon,
            color: PersonnelStatusInfo[data.employement.status].color,
        }),
        columns: [
            {
                title: 'نام و نام خانوادگی',
                value: (data) => `${data.name.first} ${data.name.last}`,
                action: (data) => ['/member', 'info', data.id],
            },
            { title: 'کد پرسنلی', value: 'code', english: true, isDescription: true },
            {
                title: 'تاریخ استخدام',
                value: (data) => data.employement.date,
                type: 'DATE',
                description: (data) => this.monthPipe(data.employement.month),
            },
            { title: 'وضعیت استخدام', value: (data) => PersonnelStatusInfo[data.employement.status].title },
            { title: 'واحد', value: (data) => data.department.title },
            { title: 'سمت', value: (data) => data.position.title },
            { title: 'موبایل', value: 'mobile', type: 'MOBILE', copy: (data) => data.mobile },
        ],
    };

    private monthPipe = new NgxHelperMonthPipe().transform;

    constructor(private readonly activatedRoute: ActivatedRoute, private readonly apiService: ApiService) {}

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const status: string = this.params?.params?.['status']?.param || '';
        const department: string = this.params?.params?.['department']?.param || '';
        const position: string = this.params?.params?.['position']?.param || '';
        const query: string = this.params?.params?.['query']?.param || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<IPersonnelMemberListRs>(
            'PersonnelMemberList',
            { params: { status, department, position, query, page } },
            (response) => {
                this.loading = false;
                this.members = response.list;
                this.pagination = response.pagination;
            },
        );
    }
}
