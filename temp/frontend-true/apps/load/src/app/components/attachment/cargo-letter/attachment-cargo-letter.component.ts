import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

import { NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import {
    ApiService,
    ILoadCargoDTO,
    ILoadCargoLetterDeleteRs,
    ILoadCargoLetterUploadRq,
    ILoadCargoLetterUploadRs,
} from '@lib/apis';
import { MaterialModule } from '@lib/modules';
import { IPageCardButton, PageModule } from '@lib/page';

import { LoadToolsService } from '../../../providers';

@Component({
    selector: 'attachment-cargo-letter',
    imports: [NgxHelperPipeModule, MaterialModule, PageModule],
    templateUrl: './attachment-cargo-letter.component.html',
    styleUrl: './attachment-cargo-letter.component.scss'
})
export class AttachmentCargoLetterComponent implements OnInit {
    @ViewChild('fileUpload') fileUpload?: ElementRef;

    @Input({ required: true }) cargo!: ILoadCargoDTO;

    public buttons: IPageCardButton[] = [];

    public uploadMimes: string[] = ['image/gif', 'image/jpeg', 'image/png', 'application/pdf'];

    constructor(
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly loadToolsService: LoadToolsService,
    ) {}

    ngOnInit(): void {
        this.buttons.push({ title: 'آپلود', icon: 'upload', action: this.upload.bind(this) });
        if (this.cargo.letter) {
            this.buttons.push({ title: 'دانلود', icon: 'download', action: this.download.bind(this) });
            this.buttons.push({ title: 'حذف', icon: 'delete', action: this.delete.bind(this), color: 'warn' });
        }
    }

    upload(): void {
        if (!this.fileUpload) return;

        const element: HTMLInputElement = this.fileUpload.nativeElement;
        element.value = '';
        element.click();
    }

    uploadFile(event: Event): void {
        const files = (event.target as HTMLInputElement).files;
        if (!files || files.length === 0) return;

        const file: File = files[0];
        this.apiService.upload('LOAD_LETTER', file, (upload) => {
            const ID: string = this.cargo.id;
            const body: ILoadCargoLetterUploadRq = {
                path: upload.path,
                mime: upload.mime,
                size: upload.size,
            };
            this.apiService.request<ILoadCargoLetterUploadRs>('LoadCargoLetterUpload', { body, ids: { ID } }, (response) => {
                this.cargo = response;
                this.ngxHelperToastService.success('نامه ترخیص با موفقیت آپلود شد.');
            });
        });
    }

    download(): void {
        if (!this.cargo.letter) return;

        this.loadToolsService.downloadFile(this.cargo.letter.path, this.cargo.title);
    }

    delete(): void {
        if (!this.cargo.letter) return;

        const item: string = 'نامه ترخیص بار';
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { message }, () => {
            const ID: string = this.cargo.id;
            this.apiService.request<ILoadCargoLetterDeleteRs>('LoadCargoLetterDelete', { ids: { ID } }, (response) => {
                this.cargo = response;
                this.ngxHelperToastService.success('نامه ترخیص با موفقیت حذف شد.');
            });
        });
    }
}
