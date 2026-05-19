import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { INgxHelperValue } from '@webilix/ngx-helper/value';

import { ILoadCargoDTO } from '@lib/apis';
import { LoadCargoInfo } from '@lib/shared';

@Component({
    host: { selector: 'cargo-attachment' },
    templateUrl: './cargo-attachment.component.html',
    styleUrl: './cargo-attachment.component.scss',
    standalone: false
})
export class CargoAttachmentComponent {
    public cargo: ILoadCargoDTO = this.activatedRoute.snapshot.data['cargo'];

    public values: INgxHelperValue[] = [
        { title: 'ثبت', value: { type: 'DATE', value: this.cargo.create } },
        { title: 'نوع بار', value: LoadCargoInfo[this.cargo.type].title },
        { title: 'وضعیت', value: this.cargo.status === 'ACTIVE' ? 'فعال' : 'غیرفعال' },
    ];

    constructor(private readonly activatedRoute: ActivatedRoute) {}
}
