import { Component, OnDestroy, OnInit } from '@angular/core';

import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';
import { NgxHelperMenu, NgxHelperMenuModule } from '@webilix/ngx-helper/menu';

import { ApiService, ISharedLoadCargoDTO, ISharedLoadCargoListRs } from '@lib/apis';
import { MaterialModule } from '@lib/modules';
import { LoadCargoInfo, LoadStatusInfo } from '@lib/shared';

@Component({
    host: { selector: 'shared-load' },
    imports: [NgxHelperLoaderModule, NgxHelperMenuModule, MaterialModule],
    templateUrl: './shared-load-cargo.component.html',
    styleUrl: './shared-load-cargo.component.scss'
})
export class SharedLoadCargoComponent implements OnInit, OnDestroy {
    public loadCargoInfo = LoadCargoInfo;
    public loadStatusInfo = LoadStatusInfo;

    public loading: boolean = true;
    public cargos: ISharedLoadCargoDTO[] = [];

    public filter: { party?: string; shipment?: string; query?: string } = {};
    public filtered: ISharedLoadCargoDTO[] = [];

    public partiesMenu: NgxHelperMenu[] = [];
    public shipmentsMenu: NgxHelperMenu[] = [];

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly apiService: ApiService,
    ) {}

    ngOnInit(): void {
        document.documentElement.style.setProperty('--ngxHelperDialogWidth', '800px');

        this.apiService.request<ISharedLoadCargoListRs>('SharedLoadCargoList', (response) => {
            this.loading = false;
            this.cargos = response;

            const parties: Map<string, string> = new Map<string, string>();
            const shipments: Map<string, string> = new Map<string, string>();
            this.cargos.forEach((c) => {
                if (c.party) parties.set(c.party.id, c.party.title);
                if (c.shipment) shipments.set(c.shipment.id, c.shipment.title);
            });

            this.partiesMenu = [...parties.keys()]
                .map((key: string) => ({
                    title: parties.get(key) || '',
                    click: () => this.setPartyFilter(key),
                    disableOn: () => this.filter.party === key,
                }))
                .sort((p1, p2) => p1.title.localeCompare(p2.title));
            this.partiesMenu.push('DIVIDER', {
                title: 'همه موارد',
                click: () => this.setPartyFilter(),
                disableOn: () => !this.filter.party,
            });

            this.shipmentsMenu = [...shipments.keys()]
                .map((key: string) => ({
                    title: shipments.get(key) || '',
                    click: () => this.setShipmentFilter(key),
                    disableOn: () => this.filter.shipment === key,
                }))
                .sort((s1, s2) => s1.title.localeCompare(s2.title));
            this.shipmentsMenu.push('DIVIDER', {
                title: 'همه موارد',
                click: () => this.setShipmentFilter(),
                disableOn: () => !this.filter.shipment,
            });

            this.filterCargos();
        });
    }

    ngOnDestroy(): void {
        document.documentElement.style.setProperty('--ngxHelperDialogWidth', '500px');
    }

    setPartyFilter(party?: string): void {
        this.filter.party = party;
        this.filterCargos();
    }

    setShipmentFilter(shipment?: string): void {
        this.filter.shipment = shipment;
        this.filterCargos();
    }

    setQueryFilter(query: string): void {
        this.filter.query = (query || '').trim() || undefined;
        this.filterCargos();
    }

    filterCargos(): void {
        this.filtered = this.cargos;

        if (this.filter.party) this.filtered = this.filtered.filter((c) => c.party && c.party.id === this.filter.party);
        if (this.filter.shipment)
            this.filtered = this.filtered.filter((c) => c.shipment && c.shipment.id === this.filter.shipment);
        if (this.filter.query) this.filtered = this.filtered.filter((c) => c.title.indexOf(this.filter.query || '') !== -1);
    }

    select(cargo: ISharedLoadCargoDTO): void {
        this.ngxHelperBottomSheetService.close(cargo);
    }
}
