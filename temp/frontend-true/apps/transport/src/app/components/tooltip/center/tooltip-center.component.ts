import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

import { NgxHelperBoxModule } from '@webilix/ngx-helper/box';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { ITransportStationCenterDTO, ITransportStationLocationDTO } from '@lib/apis';
import { MaterialModule } from '@lib/modules';
import { TransportPassengerInfo } from '@lib/shared';

@Component({
    selector: 'tooltip-center',
    imports: [CommonModule, NgxHelperBoxModule, NgxHelperPipeModule, MaterialModule],
    templateUrl: './tooltip-center.component.html',
    styleUrl: './tooltip-center.component.scss',
    animations: [
        trigger('box', [
            transition(':enter', [style({ opacity: 0, height: 0 }), animate('250ms', style({ opacity: 1, height: '*' }))]),
            transition(':leave', [style({ opacity: 1, height: '*' }), animate('250ms', style({ opacity: 0, height: 1 }))]),
        ]),
    ]
})
export class TooltipCenterComponent {
    @Input({ required: true }) index?: number;
    @Input({ required: true }) center?: ITransportStationCenterDTO;
    @Input({ required: true }) location?: ITransportStationLocationDTO;

    public transportPassengerInfo = TransportPassengerInfo;
}
