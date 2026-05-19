import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { NgxHelperToastService } from '@webilix/ngx-helper';

import { ILaboratoryCargoPortionDTO, ISharedLoadCargoDTO } from '@lib/apis';
import { IPageCardButton } from '@lib/page';
import { LoadCargo, LoadCargoInfo, SharedService } from '@lib/shared';

@Component({
    selector: 'cargo-mixed-portion',
    templateUrl: './cargo-mixed-portion.component.html',
    styleUrl: './cargo-mixed-portion.component.scss',
    standalone: false
})
export class CargoMixedPortionComponent implements OnInit {
    @Input({ required: true }) portions: ILaboratoryCargoPortionDTO[] = [];
    @Output() changed: EventEmitter<{ title: string; portions: ILaboratoryCargoPortionDTO[] }> = new EventEmitter<{
        title: string;
        portions: ILaboratoryCargoPortionDTO[];
    }>();

    public loadCargoInfo = LoadCargoInfo;

    public buttons: IPageCardButton[] = [{ title: 'انتخاب بار', icon: 'add', action: this.selectPortion.bind(this) }];

    constructor(
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly sharedService: SharedService,
    ) {}

    ngOnInit(): void {
        this.emmitChange();
    }

    emmitChange(): void {
        this.portions = this.portions.sort((p1, p2) => p1.title.localeCompare(p2.title));
        const titles: string[] = this.portions.map((p) => `${p.title}(${p.proportion})`);
        const title: string = titles.length >= 2 ? `MIXED[ ${titles.join(' | ')} ]` : '';

        this.changed.emit({ title, portions: this.portions });
    }

    selectPortion(): void {
        this.sharedService.getLoadCargo().then((cargo: ISharedLoadCargoDTO) => {
            const types: LoadCargo[] = ['BUY', 'IN', 'OUT'];
            if (!types.includes(cargo.type)) {
                this.ngxHelperToastService.error('امکان ثبت بارهای داخلی به عنوان بخشی از بار مخلوط وجود ندارد.');
                return;
            }

            if (this.portions.find((p) => p.id === cargo.id)) {
                this.ngxHelperToastService.error('بار مورد نظر قبلا در لیست بارها ثبت شده است.');
                return;
            }

            this.portions.push({
                id: cargo.id,
                title: cargo.title,
                type: cargo.type,
                party: cargo.party,
                shipment: cargo.shipment,
                proportion: 1,
            });
            this.emmitChange();
        });
    }

    changeProportion(portion: ILaboratoryCargoPortionDTO, change: number): void {
        const proportion: number = portion.proportion + change;
        if (proportion < 1) return;

        Object.assign(portion, { proportion });
        this.emmitChange();
    }

    deletePortion(portion: ILaboratoryCargoPortionDTO): void {
        this.portions = this.portions.filter((p) => p.id !== portion.id);
        this.emmitChange();
    }
}
