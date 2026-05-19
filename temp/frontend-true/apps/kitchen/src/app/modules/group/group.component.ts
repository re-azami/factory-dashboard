import { Component, OnInit } from '@angular/core';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, IKitchenGroupDeleteRs, IKitchenGroupDTO, IKitchenGroupListRs } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';

import { GroupCreateComponent } from './create/group-create.component';
import { GroupUpdateComponent } from './update/group-update.component';

@Component({
    host: { selector: 'group' },
    standalone: false,
    templateUrl: './group.component.html',
    styleUrl: './group.component.scss',
})
export class GroupComponent implements OnInit {
    public title: IPageTitle = {
        title: 'مدیریت گروه‌های کالا',
        actions: [{ type: 'CREATE', title: 'گروه جدید', action: this.create.bind(this) }],
    };

    public loading: boolean = true;
    public groups: IKitchenGroupDTO[] = [];

    public list: IList<IKitchenGroupDTO> = {
        type: 'گروه کالا',
        columns: [
            { title: 'عنوان', value: 'title' },
            { title: 'تعداد کالا', value: 'good', type: 'NUMBER' },
        ],
        actions: [
            { type: 'UPDATE', action: this.update.bind(this) },
            { type: 'DELETE', action: this.delete.bind(this), hideOn: (data) => data.good !== 0 },
        ],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        this.loadList();
    }

    loadList(): void {
        this.apiService.request<IKitchenGroupListRs>('KitchenGroupList', (response) => {
            this.loading = false;
            this.groups = response;
        });
    }

    create(): void {
        this.ngxHelperBottomSheetService.open(GroupCreateComponent, 'ثبت گروه جدید', () => {
            this.loadList();
            this.ngxHelperToastService.success('گروه با موفقیت ثبت شد.');
        });
    }

    update(group: IKitchenGroupDTO): void {
        this.ngxHelperBottomSheetService.open(GroupUpdateComponent, 'ویرایش گروه', { data: { group } }, () => {
            this.loadList();
            this.ngxHelperToastService.success('گروه با موفقیت ویرایش شد.');
        });
    }

    delete(group: IKitchenGroupDTO): void {
        const item: string = 'گروه کالا';
        const title: string = group.title;
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = group.id;
            this.apiService.request<IKitchenGroupDeleteRs>('KitchenGroupDelete', { ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('گروه با موفقیت حذف شد.');
            });
        });
    }
}
