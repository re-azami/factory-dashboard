import { Component, Input, OnInit } from '@angular/core';

import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';
import { INgxHelperValue, NgxHelperValueModule } from '@webilix/ngx-helper/value';

import {
    ApiService,
    ILoadAttachmentDeleteRs,
    ILoadAttachmentDTO,
    ILoadAttachmentListRs,
    ILoadCargoDTO,
    IPaginationDTO,
} from '@lib/apis';
import { IList, ListModule } from '@lib/list';
import { IPageTitle, PageModule } from '@lib/page';
import { LoadAttachment, LoadAttachmentInfo } from '@lib/shared';

import { LoadToolsService } from '../../providers';

import { AttachmentCreateComponent } from './create/attachment-create.component';
import { AttachmentUpdateComponent } from './update/attachment-update.component';
import { AttachmentCargoLetterComponent } from './cargo-letter/attachment-cargo-letter.component';

@Component({
    selector: 'attachment',
    imports: [NgxHelperValueModule, ListModule, PageModule, AttachmentCargoLetterComponent],
    templateUrl: './attachment.component.html',
    styleUrl: './attachment.component.scss'
})
export class AttachmentComponent implements OnInit {
    @Input({ required: true }) attachment!: LoadAttachment;
    @Input({ required: true }) route!: string[];
    @Input({ required: true }) data!: { id: string; title: string };
    @Input({ required: true }) values: INgxHelperValue[] = [];
    @Input({ required: false }) cargo!: ILoadCargoDTO;

    public loadAttachmentInfo = LoadAttachmentInfo;

    public page: number = 1;
    public title!: IPageTitle;

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public attachments: ILoadAttachmentDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ILoadAttachmentDTO> = {
        type: 'فایل ضمیمه',
        description: (data) => data.description,
        columns: [
            { title: 'عنوان', value: 'title' },
            { title: '', value: 'code', english: true, isDescription: true },
            { title: 'ثبت', value: 'create', type: 'DATE' },
            { value: (data) => data.file.size, type: 'FILE-SIZE' },
        ],
        action: { icon: 'download', action: this.download.bind(this) },
        actions: [
            { type: 'UPDATE', action: this.update.bind(this) },
            { type: 'DELETE', action: this.delete.bind(this) },
        ],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly loadToolsService: LoadToolsService,
    ) {}

    ngOnInit(): void {
        this.title = {
            title: LoadAttachmentInfo[this.attachment].page.title,
            description: 'فایل‌های ضمیمه',
            toolbar: { route: this.route },
            actions: [
                { title: 'آپلود', icon: 'upload', action: this.create.bind(this), color: 'primary' },
                { type: 'RETURN', action: LoadAttachmentInfo[this.attachment].page.route },
            ],
        };
    }

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const attachment: LoadAttachment = this.attachment;
        const data: string = this.data.id;
        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<ILoadAttachmentListRs>(
            'LoadAttachmentList',
            { params: { attachment, data, page } },
            (response) => {
                this.loading = false;
                this.attachments = response.list;
                this.pagination = response.pagination;
            },
        );
    }

    create(): void {
        this.ngxHelperBottomSheetService.open(
            AttachmentCreateComponent,
            'آپلود فایل ضمیمه',
            { data: { type: this.attachment, data: this.data } },
            () => {
                this.loadList();
                this.ngxHelperToastService.success('فایل ضمیمه با موفقیت آپلود شد.');
            },
        );
    }

    download(attachment: ILoadAttachmentDTO): void {
        this.loadToolsService.downloadFile(
            attachment.file.path,
            this.data.title + ' ' + attachment.title + (attachment.code ? ' - ' + attachment.code : ''),
        );
    }

    update(attachment: ILoadAttachmentDTO): void {
        this.ngxHelperBottomSheetService.open(
            AttachmentUpdateComponent,
            'ویرایش فایل ضمیمه',
            { data: { type: this.attachment, data: this.data, attachment } },
            () => {
                this.loadList();
                this.ngxHelperToastService.success('فایل ضمیمه با موفقیت ویرایش شد.');
            },
        );
    }

    delete(attachment: ILoadAttachmentDTO): void {
        const item: string = 'فایل ضمیمه';
        const title: string = attachment.title;
        const message: string =
            'در صورت تایید، اطلاعات فایل ضمیمه به صورت کامل از سیستم حذف شده و امکان بازیابی اطلاعات حذف شده وجود ندارد. ';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = attachment.id;
            const data: string = this.data.id;
            this.apiService.request<ILoadAttachmentDeleteRs>(
                'LoadAttachmentDelete',
                { ids: { ID }, params: { attachment: this.attachment, data } },
                () => {
                    this.loadList();
                    this.ngxHelperToastService.success('فایل ضمیمه با موفقیت حذف شد.');
                },
            );
        });
    }
}
