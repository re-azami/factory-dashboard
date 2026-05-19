import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';

import { JalaliDateTime } from '@webilix/jalali-date-time';
import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';

import {
    ApiService,
    ILoadDraftAttachmentDeleteRs,
    ILoadDraftBuyDTO,
    ILoadDraftDTO,
    ILoadDraftInDTO,
    ILoadDraftLogDTO,
    ILoadDraftLogRs,
    ILoadDraftOutDTO,
} from '@lib/apis';
import { IPageBlock, IPageTitle } from '@lib/page';
import { UserService } from '@lib/providers';
import { LoadCargoInfo } from '@lib/shared';

import { LoadToolsService } from '../../../providers';

import { DraftInfoUploadComponent } from './upload/draft-info-upload.component';

@Component({
    host: { selector: 'draft-info' },
    templateUrl: './draft-info.component.html',
    styleUrl: './draft-info.component.scss',
    standalone: false
})
export class DraftInfoComponent implements OnInit {
    public loadCargoInfo = LoadCargoInfo;

    public draft: ILoadDraftDTO = this.activatedRoute.snapshot.data['draft'];
    public draftBlock: IPageBlock[] = [];

    public title: IPageTitle = {
        title: 'مشاهده حواله',
        description: LoadCargoInfo[this.draft.cargo.type].title,
        actions: [
            {
                title: 'آپلود فایل',
                icon: 'upload',
                color: 'primary',
                action: this.fileUpload.bind(this),
                hideOn: () =>
                    !this.userService.hasAccess({
                        access: [
                            'LOAD_ROLE_TRAFFIC',
                            'LOAD_ROLE_TRAFFIC_MINE',
                            'LOAD_ROLE_WEIGHT',
                            'LOAD_ROLE_LOADING',
                            'LOAD_ROLE_LOADING_MINE',
                            'LOAD_ROLE_DISCHARGE',
                        ],
                    }),
            },
            {
                title: `پرینت ${LoadCargoInfo[this.draft.cargo.type].draft}`,
                icon: 'print',
                color: 'primary',
                action: () => this.loadToolsService.downloadDraft(this.draft.code),
                hideOn: () => this.draft.status === 'CANCELED',
            },
            {
                type: 'MENU',
                title: 'بازگشت',
                icon: 'chevron_right',
                menu: [
                    { id: 'active', title: 'حواله‌های فعال', access: { access: 'LOAD_DRAFT_ACTIVE' } },
                    { id: 'finished', title: 'حواله‌های قبلی', access: { access: 'LOAD_DRAFT_FINISHED' } },
                    { id: 'canceled', title: 'حواله‌های لغو شده', access: { access: 'LOAD_DRAFT_CANCELED' } },
                    'DIVIDER',
                    { id: 'updated', title: 'حواله‌های ویرایش شده', access: { access: 'LOAD_DRAFT_UPDATE' } },
                ],
                action: (id) => ['/draft', id],
            },
        ],
    };

    private jalali = JalaliDateTime();
    public draftData: IPageBlock[] = [];
    public dateData: IPageBlock[] = [];
    public weightData: IPageBlock[] = [];
    public paymentData: IPageBlock[][] = [];

    public logAccess: boolean = this.userService.hasAccess({ access: 'LOAD_DRAFT_LOG' });
    public logLoading: boolean = true;
    public logs: ILoadDraftLogDTO[] = [];

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly apiService: ApiService,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly loadToolsService: LoadToolsService,
        private readonly userService: UserService,
    ) {}

    ngOnInit(): void {
        this.activatedRoute.data.subscribe({
            next: (data: Data) => {
                this.draft = data['draft'];
                this.setData();
                this.loadLogs();
            },
        });
    }

    fileUpload(): void {
        this.ngxHelperBottomSheetService.open<ILoadDraftDTO>(
            DraftInfoUploadComponent,
            'آپلود فایل ضمیمه حواله',
            { data: { draft: this.draft } },
            (response) => {
                this.draft = response;
                this.ngxHelperToastService.success('فایل ضمیمه حواله با موفقیت آپلود شد.');
            },
        );
    }

    fileDownload(id: string): void {
        const attachment = this.draft.attachments.find((a) => a.id === id);
        if (!attachment) return;

        this.loadToolsService.downloadFile(attachment.file.path, `${this.draft.code} ${attachment.title}`);
    }

    checkDeleteAccess(id: string): boolean {
        const attachment = this.draft.attachments.find((a) => a.id === id);
        if (!attachment) return false;

        const user = this.userService.user;
        if (!user) return false;

        return user.group === 'MANAGER' || (user.group === 'ADMIN' && user.admin.includes('LOAD'));
    }

    fileDelete(id: string): void {
        if (!this.checkDeleteAccess(id)) return;

        const attachment = this.draft.attachments.find((a) => a.id === id);
        if (!attachment) return;

        const item: string = 'فایل ضمیمه حواله';
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { message }, () => {
            const ID: string = this.draft.id;
            const ATTACHMENTID: string = attachment.id;
            this.apiService.request<ILoadDraftAttachmentDeleteRs>(
                'LoadDraftAttachmentDelete',
                { ids: { ID, ATTACHMENTID } },
                (response) => {
                    this.draft = response;
                    this.ngxHelperToastService.success('فایل ضمیمه حواله با موفقیت حذف شد.');
                },
            );
        });
    }

    getStep(step: string): string {
        return LoadCargoInfo[this.draft.cargo.type].steps.find((s) => s.id === step)?.title || '';
    }

    setData(): void {
        const format: string = 'W، d N Y H:I';
        const status: string =
            this.draft.status === 'ACTIVE' ? 'فعال' : this.draft.status === 'CANCELED' ? 'لغو شده' : 'پایان فرایند';

        this.title = { ...this.title, description: LoadCargoInfo[this.draft.cargo.type].title };

        this.draftData = [
            { title: 'شماره حواله', value: this.draft.code, english: true },
            { title: 'وضعیت', value: status, color: 'warn' },
        ];
        this.dateData = [
            { title: 'تاریخ ثبت', value: this.jalali.toFullText(this.draft.date.create, { format }) },
            this.draft.status === 'FINISHED'
                ? { title: 'پایان فرایند', value: this.jalali.toFullText(this.draft.date.finish, { format }) }
                : { title: 'آخرین تغییر', value: this.jalali.toFullText(this.draft.date.update, { format }) },
        ];
        this.weightData = [
            { title: 'وزن خالص', value: this.draft.weight.net },
            { title: 'وزن پر', value: this.draft.weight.full },
            { title: 'وزن خالی', value: this.draft.weight.empty },
        ];
        this.paymentData = [
            [
                { title: 'هزینه حمل', value: this.draft.payment?.price },
                { title: 'مبلغ حمل', value: this.draft.payment?.value },
            ],
            [
                { title: 'رسید پرداخت', value: this.draft.payment?.checkout?.code, english: true },
                {
                    title: 'وضعیت پرداخت',
                    value: this.draft.payment?.checkout?.status === 'PAID' ? 'پرداخت شده' : 'پرداخت نشده',
                },
            ],
        ];

        this.draftBlock = [];
        switch (this.draft.cargo.type) {
            case 'OUT':
                const outDraft: ILoadDraftOutDTO = this.draft as ILoadDraftOutDTO;
                this.draftBlock = [
                    { title: 'شماره حواله بیتا', value: outDraft.bitaDraft, english: true },
                    { title: 'شماره بارنامه بیتا', value: outDraft.bitaBill, english: true },
                ];
                break;
            case 'IN':
                const inDraft: ILoadDraftInDTO = this.draft as ILoadDraftInDTO;
                this.draftBlock = [
                    { title: 'وزن خالی بارگیری معدن', value: inDraft.inWeightEmpty },
                    { title: 'وزن پر بارگیری معدن', value: inDraft.inWeightFull },
                    { title: 'وزن خالص بارگیری معدن', value: inDraft.inWeightNet },
                ];
                break;
            case 'BUY':
                const buyDraft: ILoadDraftBuyDTO = this.draft as ILoadDraftBuyDTO;
                this.draftBlock = [
                    { title: 'شماره بارنامه فرستنده', value: buyDraft.billNumber },
                    { title: 'وزن بارنامه فرستنده', value: buyDraft.billWeight },
                ];
                break;
        }
    }

    loadLogs(): void {
        if (!this.logAccess) return;

        this.logLoading = true;
        const ID: string = this.draft.id;
        this.apiService.request<ILoadDraftLogRs>(
            'LoadDraftLog',
            { ids: { ID }, silent: true, loading: false },
            (response) => {
                this.logLoading = false;
                this.logs = response;
            },
        );
    }
}
