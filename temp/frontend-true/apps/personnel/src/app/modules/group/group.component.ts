import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    IPersonnelGroupDTO,
    IPersonnelGroupDeleteRs,
    IPersonnelGroupListRs,
    IPersonnelGroupOrderRq,
    IPersonnelGroupOrderRs,
    IPersonnelGroupStatusRq,
    IPersonnelGroupStatusRs,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { PersonnelGroup, PersonnelGroupInfo, PersonnelGroupList } from '@lib/shared';

import { GroupCreateComponent } from './create/group-create.component';
import { GroupUpdateComponent } from './update/group-update.component';
import { GroupOrderComponent } from './order/group-order.component';

@Component({
    host: { selector: 'group' },
    templateUrl: './group.component.html',
    styleUrl: './group.component.scss',
    standalone: false
})
export class GroupComponent implements OnInit {
    public personnelGroupInfo = PersonnelGroupInfo;

    public type?: PersonnelGroup;
    public title!: IPageTitle;

    public loading: boolean = true;
    public groups: IPersonnelGroupDTO[] = [];

    public list: IList<IPersonnelGroupDTO> = {
        type: '',
        isDeactive: (data) => data.status === 'DEACTIVE',
        icon: (data) => ({
            icon: data.status === 'ACTIVE' ? 'check_circle' : 'cancel',
            color: data.status === 'ACTIVE' ? 'primary' : 'warn',
        }),
        columns: [
            { title: 'عنوان', value: 'title' },
            { title: 'تعداد پرسنل', value: 'personnel', type: 'NUMBER' },
            { title: 'وضعیت', value: (data) => (data.status === 'ACTIVE' ? 'فعال' : 'غیرفعال') },
        ],
        actions: [
            { type: 'UPDATE', action: this.update.bind(this) },
            { type: 'STATUS', action: this.status.bind(this), isActive: (data) => data.status === 'ACTIVE' },
            { type: 'DELETE', action: this.delete.bind(this) },
        ],
    };

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        this.activatedRoute.params.subscribe({
            next: (params: Params) => {
                this.loading = true;
                this.type = PersonnelGroupList.includes(params['TYPE']) ? params['TYPE'] : undefined;
                if (!this.type) {
                    this.router.navigate(['/dashboard']);
                    return;
                }

                this.title = {
                    title: `مدیریت ${PersonnelGroupInfo[this.type].title}`,
                    actions: [
                        {
                            type: 'MENU',
                            title: 'ترتیب نمایش',
                            icon: 'sort_by_alpha',
                            action: (id) => {
                                switch (id) {
                                    case 'ALPHABET':
                                        this.orderAlphabet();
                                        return;
                                    case 'ORDER':
                                        this.orderList();
                                        return;
                                }
                            },
                            menu: [
                                { id: 'ALPHABET', title: 'نمایش به ترتیب حروف' },
                                { id: 'ORDER', title: 'انتخاب ترتیب نمایش' },
                            ],
                        },
                        {
                            type: 'CREATE',
                            title: `ثبت ${PersonnelGroupInfo[this.type].title}`,
                            action: this.create.bind(this),
                        },
                    ],
                };

                this.loadList();
            },
        });
    }

    loadList(): void {
        if (!this.type) return;

        const type: string = this.type;
        this.apiService.request<IPersonnelGroupListRs>('PersonnelGroupList', { params: { type } }, (response) => {
            this.loading = false;
            this.groups = response;
        });
    }

    create(): void {
        if (!this.type) return;

        this.ngxHelperBottomSheetService.open(GroupCreateComponent, 'ثبت گروه جدید', { data: { type: this.type } }, () => {
            this.loadList();
            this.ngxHelperToastService.success('گروه با موفقیت ثبت شد.');
        });
    }

    status(group: IPersonnelGroupDTO, active: boolean): void {
        if (!this.type) return;

        const item: string = PersonnelGroupInfo[this.type].title;
        const title: string = group.title;
        const message: string = active
            ? 'پس از فعال کردن، امکان استفاده از گروه در اطلاعات پرسنل وجود دارد.'
            : 'در صورت تایید، اطلاعات گروه در سیستم باقی خواهد ماند اما امکان استفاده از گروه در اطلاعات پرسنل وجود ندارد. ';

        this.ngxHelperConfirmService.verify(active ? 'ACTIVE' : 'DEACTIVE', item, { title, message }, () => {
            const ID: string = group.id;
            const body: IPersonnelGroupStatusRq = { active };
            this.apiService.request<IPersonnelGroupStatusRs>('PersonnelGroupStatus', { body, ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success(`گروه با موفقیت ${active ? 'فعال' : 'غیرفعال'} شد.`);
            });
        });
    }

    update(group: IPersonnelGroupDTO): void {
        if (!this.type) return;

        this.ngxHelperBottomSheetService.open(
            GroupUpdateComponent,
            'ویرایش گروه',
            { data: { type: this.type, group } },
            () => {
                this.loadList();
                this.ngxHelperToastService.success('گروه با موفقیت ویرایش شد.');
            },
        );
    }

    delete(group: IPersonnelGroupDTO): void {
        if (!this.type) return;

        const item: string = PersonnelGroupInfo[this.type].title;
        const title: string = group.title;
        const message: string =
            'در صورتی که از گروه در اطلاعات پرسنل استفاده شده باشد، تغییری در اطلاعات مرتبط ایجاد نمی‌شود. امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = group.id;
            this.apiService.request<IPersonnelGroupDeleteRs>('PersonnelGroupDelete', { ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('گروه با موفقیت حذف شد.');
            });
        });
    }

    order(groups: string[]): void {
        if (!this.type || groups.length < 2) return;

        const body: IPersonnelGroupOrderRq = {
            groups,
            type: this.type,
        };
        this.apiService.request<IPersonnelGroupOrderRs>('PersonnelGroupOrder', { body }, () => {
            this.loadList();
            this.ngxHelperToastService.success('ترتیب نمایش گروه‌ها با موفقیت ثبت شد.');
        });
    }

    orderAlphabet(): void {
        if (!this.type || this.groups.length < 2) return;

        this.ngxHelperConfirmService.verify(
            { title: 'مرتب', icon: 'sort_by_alpha' },
            'ترتیب نمایش گروه‌ها',
            { question: 'آیا می‌خواهید ترتیب نمایش گروه‌ها را به صورت مرتب شده بر اساس حروف الفبا تغییر دهید؟' },
            () => {
                const ids: string[] = [...this.groups]
                    .sort((g1, g2) => g1.title.localeCompare(g2.title))
                    .map((group: IPersonnelGroupDTO) => group.id);
                this.order(ids);
            },
        );
    }

    orderList(): void {
        if (!this.type || this.groups.length < 2) return;

        this.ngxHelperBottomSheetService.open<string[]>(
            GroupOrderComponent,
            'ترتیب نمایش گروه‌ها',
            { data: { type: this.type, groups: this.groups } },
            (ids) => {
                this.order(ids);
            },
        );
    }
}
