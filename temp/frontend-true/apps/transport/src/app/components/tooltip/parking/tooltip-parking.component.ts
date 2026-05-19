import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

import { NgxHelperBoxModule } from '@webilix/ngx-helper/box';

import { ITransportParkingDTO } from '@lib/apis';
import { MaterialModule } from '@lib/modules';
import { TransportVehicleInfo } from '@lib/shared';

@Component({
    selector: 'tooltip-parking',
    imports: [CommonModule, NgxHelperBoxModule, MaterialModule],
    templateUrl: './tooltip-parking.component.html',
    styleUrl: './tooltip-parking.component.scss',
    animations: [
        trigger('box', [
            transition(':enter', [style({ opacity: 0, height: 0 }), animate('250ms', style({ opacity: 1, height: '*' }))]),
            transition(':leave', [style({ opacity: 1, height: '*' }), animate('250ms', style({ opacity: 0, height: 1 }))]),
        ]),
    ]
})
export class TooltipParkingComponent {
    @Input({ required: true }) parking?: ITransportParkingDTO;

    public transportVehicleInfo = TransportVehicleInfo;
}
