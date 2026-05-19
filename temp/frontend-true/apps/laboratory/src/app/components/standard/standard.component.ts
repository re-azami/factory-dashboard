import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { ApiService, ILaboratoryStandardCurrentRs, ILaboratoryStandardDTO } from '@lib/apis';
import { IPageCardButton, PageModule } from '@lib/page';

import { StandardCreateComponent } from './create/standard-create.component';

@Component({
    selector: 'standard',
    imports: [CommonModule, NgxHelperLoaderModule, NgxHelperPipeModule, PageModule],
    templateUrl: './standard.component.html',
    styleUrl: './standard.component.scss',
})
export class StandardComponent implements OnInit {
    @Input({ required: true }) standard?: ILaboratoryStandardDTO;
    @Output() standardChange: EventEmitter<ILaboratoryStandardDTO> = new EventEmitter<ILaboratoryStandardDTO>();

    public loading: boolean = true;
    public buttons: IPageCardButton[] = [{ title: 'محاسبه', icon: 'calculate', action: this.create.bind(this) }];

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        this.apiService.request<ILaboratoryStandardCurrentRs>('LaboratoryStandardCurrent', (response) => {
            this.loading = false;
            this.setStandard(response);
        });
    }

    create(): void {
        this.ngxHelperBottomSheetService.open<ILaboratoryStandardDTO>(
            StandardCreateComponent,
            'محاسبه استاندارد',
            (response) => this.setStandard(response),
        );
    }

    setStandard(standard?: ILaboratoryStandardDTO): void {
        this.standard = standard;
        this.standardChange.emit(standard);
    }
}
