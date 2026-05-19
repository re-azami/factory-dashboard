import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { INgxHelperValue } from '@webilix/ngx-helper/value';

import { ILoadTransporterDTO } from '@lib/apis';

@Component({
    host: { selector: 'transporter-attachment' },
    templateUrl: './transporter-attachment.component.html',
    styleUrl: './transporter-attachment.component.scss',
    standalone: false
})
export class TransporterAttachmentComponent {
    public transporter: ILoadTransporterDTO = this.activatedRoute.snapshot.data['transporter'];

    public values: INgxHelperValue[] = [
        { title: 'ثبت', value: { type: 'DATE', value: this.transporter.create } },
        { title: 'کد باربری', value: { type: 'ENGLISH', value: this.transporter.code || '' } },
        { title: 'وضعیت', value: this.transporter.status === 'ACTIVE' ? 'فعال' : 'غیرفعال' },
    ];

    constructor(private readonly activatedRoute: ActivatedRoute) {}
}
