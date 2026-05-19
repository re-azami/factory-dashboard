import { Component, OnInit } from '@angular/core';

import { ApiService, IWarehouseCategoryDashboardRs, IWarehouseStockDashboardRs } from '@lib/apis';
import { IPageBlock } from '@lib/page';

@Component({
    host: { selector: 'dashboard' },
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    standalone: false
})
export class DashboardComponent implements OnInit {
    public category: { loading: boolean; count: number } = { loading: true, count: 0 };
    public stock: { loading: boolean; count: number } = { loading: true, count: 0 };
    public blocks: IPageBlock[] = [];

    constructor(private readonly apiService: ApiService) {}

    ngOnInit(): void {
        this.loadCategory();
        this.loadStock();
    }

    setBlocks(): void {
        this.blocks = [];
        if (!this.category.loading) this.blocks.push({ title: 'گروه', value: this.category.count });
        if (!this.stock.loading) this.blocks.push({ title: 'کالا', value: this.stock.count });
    }

    loadCategory(): void {
        this.apiService.request<IWarehouseCategoryDashboardRs>('WarehouseCategoryDashboard', (response) => {
            this.category.loading = false;
            this.category.count = response.count;
            this.setBlocks();
        });
    }

    loadStock(): void {
        this.apiService.request<IWarehouseStockDashboardRs>('WarehouseStockDashboard', (response) => {
            this.stock.loading = false;
            this.stock.count = response.count;
            this.setBlocks();
        });
    }
}
