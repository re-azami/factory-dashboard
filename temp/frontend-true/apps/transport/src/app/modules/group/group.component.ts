import { Component } from '@angular/core';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import { ApiService, IPaginationDTO, ITransportGroupDTO, ITransportGroupDeleteRs, ITransportGroupListRs } from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';

import { GroupCreateComponent } from './create/group-create.component';
import { GroupUpdateComponent } from './update/group-update.component';

@Component({
    host: { selector: 'group' },
    templateUrl: './group.component.html',
    styleUrls: ['./group.component.scss'],
    standalone: false
})
export class GroupComponent {
    public page: number = 1;
    public title: IPageTitle = {
        title: 'مدیریت گروه‌ها',
        toolbar: {
            route: ['/group'],
            params: [{ name: 'query', type: 'SEARCH' }],
        },
        actions: [{ type: 'CREATE', title: 'ثبت گروه', action: this.create.bind(this) }],
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public groups: ITransportGroupDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ITransportGroupDTO> = {
        type: 'گروه',
        columns: [
            { title: 'عنوان', value: 'title' },
            { title: 'مکان', value: 'location', type: 'NUMBER' },
            { title: 'مسافر', value: 'passenger', type: 'NUMBER' },
        ],
        actions: [
            {
                icon: 'location_on',
                title: 'مدیریت مکان‌ها',
                action: (data: ITransportGroupDTO) => ['/location', data.id],
                access: { access: 'TRANSPORT_LOCATION' },
            },
            {
                icon: 'file_upload',
                title: 'آپلود لیست مکان‌ها',
                action: (data: ITransportGroupDTO) => ['/import', data.id],
                access: { access: 'TRANSPORT_IMPORT' },
            },
            'DIVIDER',
            { type: 'UPDATE', action: this.update.bind(this) },
            { type: 'DELETE', action: this.delete.bind(this) },
        ],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
    ) {}

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const query: string = this.params?.params?.['query']?.param || '';
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<ITransportGroupListRs>('TransportGroupList', { params: { query, page } }, (response) => {
            this.groups = response.list;
            this.pagination = response.pagination;
            this.loading = false;
        });
    }

    create(): void {
        this.ngxHelperBottomSheetService.open(GroupCreateComponent, 'ثبت گروه مکان جدید', (location) => {
            this.loadList();
            this.ngxHelperToastService.success('گروه مکان با موفقیت ثبت شد.');
        });
    }

    update(group: ITransportGroupDTO): void {
        this.ngxHelperBottomSheetService.open(GroupUpdateComponent, 'ویرایش گروه مکان', { data: { group } }, () => {
            this.loadList();
            this.ngxHelperToastService.success('گروه مکان با موفقیت ویرایش شد.');
        });
    }

    delete(group: ITransportGroupDTO): void {
        const item: string = 'مکان';
        const title: string = group.title;
        const message: string =
            'در صورت تایید، علاوه بر گروه مکان، تمام مکان‌ها و مسافرهای مرتبط با گروه حذف می‌شوند. امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = group.id;
            this.apiService.request<ITransportGroupDeleteRs>('TransportGroupDelete', { ids: { ID } }, () => {
                this.loadList();
                this.ngxHelperToastService.success('گروه مکان با موفقیت حذف شد.');
            });
        });
    }
}
