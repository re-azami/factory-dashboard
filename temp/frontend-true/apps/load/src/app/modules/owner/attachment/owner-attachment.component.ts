import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { INgxHelperValue } from '@webilix/ngx-helper/value';

import { ILoadOwnerDTO } from '@lib/apis';

@Component({
    host: { selector: 'owner-attachment' },
    templateUrl: './owner-attachment.component.html',
    styleUrl: './owner-attachment.component.scss',
    standalone: false
})
export class OwnerAttachmentComponent {
    public owner: ILoadOwnerDTO = this.activatedRoute.snapshot.data['owner'];

    public values: INgxHelperValue[] = [
        { title: 'ثبت', value: { type: 'DATE', value: this.owner.create } },
        { title: 'وضعیت', value: this.owner.status === 'ACTIVE' ? 'فعال' : 'غیرفعال' },
    ];

    constructor(private readonly activatedRoute: ActivatedRoute) {}
}
