import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { INgxHelperValue } from '@webilix/ngx-helper/value';

import { ILoadPartyDTO } from '@lib/apis';
import { LoadCargoInfo } from '@lib/shared';

@Component({
    host: { selector: 'party-attachment' },
    templateUrl: './party-attachment.component.html',
    styleUrl: './party-attachment.component.scss',
    standalone: false
})
export class PartyAttachmentComponent {
    public party: ILoadPartyDTO = this.activatedRoute.snapshot.data['party'];

    public values: INgxHelperValue[] = [
        { title: 'ثبت', value: { type: 'DATE', value: this.party.create } },
        {
            title: 'نوع بار',
            value: { type: 'MULTILINE', value: this.party.cargo.map((cargo) => LoadCargoInfo[cargo].title).join('\n') },
        },
        { title: 'وضعیت', value: this.party.status === 'ACTIVE' ? 'فعال' : 'غیرفعال' },
    ];

    constructor(private readonly activatedRoute: ActivatedRoute) {}
}
