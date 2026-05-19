import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import {
    ApiService,
    ITransportImportCreateRq,
    ITransportImportCreateRs,
    ITransportImportSaveRq,
    ITransportImportSaveRs,
} from '@lib/apis';

import { IImportLocation } from '../import.interface';

@Component({
    host: { selector: 'import-progress' },
    templateUrl: './import-progress.component.html',
    styleUrls: ['./import-progress.component.scss'],
    standalone: false
})
export class ImportProgressComponent implements OnInit {
    public locations: IImportLocation[] = this.data.locations;
    public code: string =
        new Date().getTime().toString() +
        '-' +
        Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, '0');
    public total: number = this.data.locations.length;
    public index: number = 0;
    public progress: number = 0;

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { group: string; locations: IImportLocation[] },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        setTimeout(this.import.bind(this), 0);
    }

    importLocation(title: string, location: IImportLocation): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            const body: ITransportImportCreateRq = {
                code: this.code,
                group: this.data.group,
                title,
                latitude: location.latitude,
                longitude: location.longitude,
                passengers: location.passengers.map((p) => ({ type: p.type, code: p.code, name: p.name })),
            };
            this.apiService.request<ITransportImportCreateRs>(
                'TransportImportCreate',
                { body },
                () => resolve(),
                () => reject(),
            );
        });
    }

    async import(): Promise<void> {
        for (let l = 0; l < this.locations.length; l++) {
            this.index = l;
            this.progress = this.index === 0 ? 0 : (this.index / this.total) * 100;

            try {
                const location: IImportLocation = this.locations[this.index];
                const title: string = `مکان ${(this.index + 1).toString().padStart(3, '0')}`;
                await this.importLocation(title, location);
            } catch (e) {
                this.ngxHelperBottomSheetService.close();
                return;
            }
        }

        const body: ITransportImportSaveRq = {
            code: this.code,
            group: this.data.group,
            location: this.locations.length,
            passenger: this.locations.reduce((sum: number, l) => sum + l.passengers.length, 0),
        };
        this.apiService.request<ITransportImportSaveRs>(
            'TransportImportSave',
            { body },
            () => this.ngxHelperBottomSheetService.close({ group: body.group }),
            () => this.ngxHelperBottomSheetService.close(),
        );
    }
}
