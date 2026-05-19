import { Component, Input } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { RouterModule } from '@angular/router';

import { NgxHelperBoxModule } from '@webilix/ngx-helper/box';

import { ITransportGroupDTO, ITransportLocationDTO } from '@lib/apis';
import { MaterialModule } from '@lib/modules';
import { TransportPassengerInfo } from '@lib/shared';

@Component({
    selector: 'tooltip-location',
    imports: [RouterModule, NgxHelperBoxModule, MaterialModule],
    templateUrl: './tooltip-location.component.html',
    styleUrl: './tooltip-location.component.scss',
    animations: [
        trigger('box', [
            transition(':enter', [style({ opacity: 0, height: 0 }), animate('250ms', style({ opacity: 1, height: '*' }))]),
            transition(':leave', [style({ opacity: 1, height: '*' }), animate('250ms', style({ opacity: 0, height: 1 }))]),
        ]),
    ]
})
export class TooltipLocationComponent {
    @Input({ required: true }) location?: ITransportLocationDTO;
    @Input({ required: false }) group?: ITransportGroupDTO;
    @Input({ required: false }) buttons: boolean = false;

    public transportPassengerInfo = TransportPassengerInfo;
}
