import { Component, OnInit } from '@angular/core';

import { INgxFormValues, INgxResponsiveForm } from '@webilix/ngx-form';
import { NgxHelperToastService } from '@webilix/ngx-helper';

import { ApiService, ILoadDraftActiveRs, ILoadDraftDTO, ILoadFlowBulkCancelRq, ILoadFlowBulkCancelRs } from '@lib/apis';
import { IPageTitle } from '@lib/page';

import { LoadToolsService } from '../../../providers';

@Component({
    host: { selector: 'draft-bulk-cancel' },
    templateUrl: './draft-bulk-cancel.component.html',
    styleUrl: './draft-bulk-cancel.component.scss',
    standalone: false
})
export class DraftBulkCancelComponent implements OnInit {
    public title: IPageTitle = { title: 'لغو عمومی حواله‌ها' };

    public loading: boolean = true;
    public drafts: ILoadDraftDTO[] = [];
    public cargos: { id: string; title: string; count: number }[] = [];
    public selected: string[] = [];

    public ngxForm: INgxResponsiveForm = {
        submit: 'لغو حواله‌های مشخص شده',
        sections: [
            {
                columns: [
                    {
                        name: 'description',
                        type: 'TEXTAREA',
                        title: 'توضیحات',
                        description: 'توضیحات در گزارش تغییرات حواله نمایش داده می‌شود.',
                    },
                    {
                        name: 'confirm',
                        type: 'CHECKBOX',
                        message: 'برای تایید لغو حواله‌های مشخص شده، این گزینه را انتخاب کنید',
                    },
                ],
            },
        ],
    };

    constructor(
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly loadToolsService: LoadToolsService,
    ) {}

    ngOnInit(): void {
        this.loadList();
    }

    loadList(): void {
        this.apiService.request<ILoadDraftActiveRs>('LoadDraftActive', (response) => {
            this.loading = false;
            this.drafts = response.filter((draft: ILoadDraftDTO) => this.loadToolsService.canCancelDraft(draft));
            if (this.drafts.length === 0) return;

            this.cargos = [];
            this.drafts.forEach((draft: ILoadDraftDTO) => {
                const cargo = this.cargos.find((c) => c.id === draft.cargo.id);
                if (cargo) cargo.count++;
                else this.cargos.push({ id: draft.cargo.id, title: draft.cargo.title, count: 1 });
            });
            this.cargos = this.cargos.sort((c1, c2) => c1.title.localeCompare(c2.title));
            this.selected = [];
        });
    }

    setCargo(id: string): void {
        if (!this.cargos.find((c) => c.id === id)) return;

        this.selected = this.drafts
            .filter((draft: ILoadDraftDTO) => draft.cargo.id === id)
            .map((draft: ILoadDraftDTO) => draft.id);
    }

    selectDraft(id: string): void {
        if (!this.drafts.find((d) => d.id === id)) return;

        if (!this.selected.includes(id)) this.selected.push(id);
        else this.selected = this.selected.filter((s) => s !== id);
    }

    ngxSubmit(values: INgxFormValues): void {
        if (this.selected.length === 0) return;

        if (!values['confirm']) {
            this.ngxHelperToastService.error('انتخاب گزینه تایید لغو، الزامی است.');
            return;
        }

        const body: ILoadFlowBulkCancelRq = {
            drafts: this.selected,
            description: values['description'],
        };
        this.apiService.request<ILoadFlowBulkCancelRs>('LoadFlowBulkCancel', { body }, () => {
            this.ngxHelperToastService.error('حواله‌های مشخص شده با موفقیت لغو شد.');
            this.loadList();
        });
    }
}
