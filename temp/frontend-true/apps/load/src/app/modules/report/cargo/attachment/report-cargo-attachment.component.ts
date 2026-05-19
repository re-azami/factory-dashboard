import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ApiService, ILoadAttachmentDTO, ILoadReportCargoAttachmentRs, ILoadReportCargoInfoRs } from '@lib/apis';
import { IList } from '@lib/list';

import { LoadToolsService } from '../../../../providers';

@Component({
    host: { selector: 'report-cargo-attachment' },
    templateUrl: './report-cargo-attachment.component.html',
    styleUrl: './report-cargo-attachment.component.scss',
    standalone: false
})
export class ReportCargoAttachmentComponent implements OnInit {
    public info: ILoadReportCargoInfoRs = this.activatedRoute.snapshot.data['info'];

    public loading: boolean = true;
    public attachments: ILoadAttachmentDTO[] = [];

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
    };

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly apiService: ApiService,
        private readonly loadToolsService: LoadToolsService,
    ) {}

    ngOnInit(): void {
        const ID: string = this.info.cargo.id;
        this.apiService.request<ILoadReportCargoAttachmentRs>('LoadReportCargoAttachment', { ids: { ID } }, (response) => {
            this.loading = false;
            this.attachments = response;
        });
    }

    download(attachment: ILoadAttachmentDTO): void {
        this.loadToolsService.downloadFile(
            attachment.file.path,
            this.info.cargo.title + ' ' + attachment.title + (attachment.code ? ' - ' + attachment.code : ''),
        );
    }
}
