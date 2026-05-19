import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxHelperBottomSheetService, NgxHelperHttpService, NgxHelperToastService } from '@webilix/ngx-helper';
import { NgxHelperCalendarService } from '@webilix/ngx-helper/calendar';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import {
    ApiService,
    ILoadExportProceedingsTransporterListRs,
    ILoadExportProceedingsTransporterRq,
    ILoadExportProceedingsTransporterRs,
} from '@lib/apis';
import { MaterialModule } from '@lib/modules';
import { ConfigService, DeviceService } from '@lib/providers';

@Component({
    host: { selector: 'print-proceedings-transporter' },
    imports: [CommonModule, NgxHelperLoaderModule, NgxHelperPipeModule, MaterialModule],
    templateUrl: './print-proceedings-transporter.component.html',
    styleUrl: './print-proceedings-transporter.component.scss'
})
export class PrintProceedingsTransporterComponent implements OnInit {
    public loading: boolean = true;
    public date: Date = new Date();
    public transporters: { id: string; title: string; count: number; weight: number }[] = [];
    public selected: string[] = [];

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperCalendarService: NgxHelperCalendarService,
        private readonly ngxHelperHttpService: NgxHelperHttpService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly deviceService: DeviceService,
        private readonly configService: ConfigService,
    ) {}

    ngOnInit(): void {
        this.loadList();
    }

    loadList(): void {
        this.loading = true;
        const date: string = this.date.toJSON();
        this.apiService.request<ILoadExportProceedingsTransporterListRs>(
            'LoadExportProceedingsTransporterList',
            { params: { date } },
            (response) => {
                this.loading = false;
                this.transporters = response;
                this.selected = this.transporters.map((transporter) => transporter.id);
            },
        );
    }

    changeDate(): void {
        this.ngxHelperCalendarService.getDate(
            { value: this.date, title: 'تاریخ صورت جلسه', maxDate: new Date() },
            (date: Date) => {
                this.date = date;
                this.loadList();
            },
        );
    }

    setSelected(id: string, checked: boolean): void {
        if (checked) {
            if (!this.selected.includes(id)) this.selected.push(id);
        } else {
            if (this.selected.includes(id)) this.selected = this.selected.filter((s) => s !== id);
        }
    }

    export() {
        if (this.selected.length === 0) {
            this.ngxHelperToastService.error('انتخاب حداقل یک باربری الزامی است.');
            return;
        }

        const body: ILoadExportProceedingsTransporterRq = {
            date: this.date,
            transporters: this.selected,
        };
        this.apiService.request<ILoadExportProceedingsTransporterRs>(
            'LoadExportProceedingsTransporter',
            { body },
            (response) => {
                const url: string = this.configService.getApiUrl(response.path);

                if (!this.deviceService.isMobile()) this.ngxHelperHttpService.printPDF(url);
                else {
                    const file: string = response.path.split('/').slice(-1)[0];
                    this.ngxHelperHttpService.download(file, url);
                }
                this.ngxHelperBottomSheetService.close();
            },
        );
    }
}
