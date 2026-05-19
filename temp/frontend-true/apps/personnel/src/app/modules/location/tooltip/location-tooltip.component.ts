import { Component, Input } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

import { PersonnelGenderInfo, PersonnelLocationInfo } from '@lib/shared';
import { ILocation } from '../location.interface';

@Component({
    selector: 'personnel-location-tooltip',
    templateUrl: './location-tooltip.component.html',
    styleUrl: './location-tooltip.component.scss',
    animations: [
        trigger('box', [
            transition(':enter', [style({ opacity: 0, height: 0 }), animate('250ms', style({ opacity: 1, height: '*' }))]),
            transition(':leave', [style({ opacity: 1, height: '*' }), animate('250ms', style({ opacity: 0, height: 1 }))]),
        ]),
    ],
    standalone: false
})
export class LocationTooltipComponent {
    @Input({ required: true }) location?: ILocation;

    public personnelGenderInfo = PersonnelGenderInfo;
    public personnelLocationInfo = PersonnelLocationInfo;
}
