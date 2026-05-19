import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { INgxHelperValue } from '@webilix/ngx-helper/value';
import { LoadToolsService } from 'apps/load/src/app/providers';

import { ILoadTruckDTO } from '@lib/apis';

@Component({
    host: { selector: 'truck-attachment' },
    templateUrl: './truck-attachment.component.html',
    styleUrl: './truck-attachment.component.scss',
    standalone: false
})
export class TruckAttachmentComponent {
    public truck: ILoadTruckDTO = this.activatedRoute.snapshot.data['truck'];

    public values: INgxHelperValue[] = [
        { title: 'ثبت', value: { type: 'DATE', value: this.truck.create } },
        { title: 'نوع ناوگان', value: this.truck.type },
        {
            title: 'وضعیت',
            value: this.truck.status === 'ACTIVE' && this.truck.owner.status === 'ACTIVE' ? 'فعال' : 'غیرفعال',
        },
    ];

    public getPlate = this.loadToolsService.getPlate;

    constructor(private readonly activatedRoute: ActivatedRoute, private readonly loadToolsService: LoadToolsService) {}
}
