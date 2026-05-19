import { Component } from '@angular/core';

import {
    NgxHelperBottomSheetService,
    NgxHelperConfirmService,
    NgxHelperHttpService,
    NgxHelperToastService,
} from '@webilix/ngx-helper';
import { INgxHelperParamValue } from '@webilix/ngx-helper/param';

import {
    ApiService,
    ILaboratorySupplementaryDeleteRs,
    ILaboratorySupplementaryDownloadRq,
    ILaboratorySupplementaryDownloadRs,
    ILaboratorySupplementaryDTO,
    ILaboratorySupplementaryListRs,
    IPaginationDTO,
} from '@lib/apis';
import { IList } from '@lib/list';
import { IPageTitle } from '@lib/page';
import { ConfigService, UserService } from '@lib/providers';
import { ExportType, ExportTypeInfo, ExportTypeList } from '@lib/shared';

import { SupplementaryCreateComponent } from './create/supplementary-create.component';
import { SupplementaryUpdateComponent } from './update/supplementary-update.component';

@Component({
    host: { selector: 'supplementary' },
    standalone: false,
    templateUrl: './supplementary.component.html',
    styleUrl: './supplementary.component.scss',
})
export class SupplementaryComponent {
    public page: number = 1;
    public title: IPageTitle = {
        title: 'نتایج آزمایش بارهای متفرقه',
        toolbar: {
            route: ['/supplementary'],
            params: [],
        },
        actions: this.userService.hasAccess({ access: 'LABORATORY_ROLE_SUPPLEMENTARY' })
            ? [{ type: 'CREATE', title: 'ثبت بار', action: this.create.bind(this) }]
            : [],
    };

    public params?: INgxHelperParamValue;
    public loading: boolean = true;
    public supplementaries: ILaboratorySupplementaryDTO[] = [];
    public pagination: IPaginationDTO | null = null;

    public list: IList<ILaboratorySupplementaryDTO> = {
        type: 'بار متفرقه',
        columns: [
            { title: 'عنوان', value: 'title', action: (data) => ['/supplementary', data.id] },
            { title: 'ثبت', value: 'date', type: 'DATE' },
            { title: 'تعداد آزمایش', value: 'tests', type: 'NUMBER' },
        ],
        description: (data) => data.description,
        actions: [
            ...ExportTypeList.map((type: ExportType) => ({
                title: ExportTypeInfo[type].title,
                icon: ExportTypeInfo[type].icon,
                action: (data: ILaboratorySupplementaryDTO) => this.download(data, type),
                hideOn: (data: ILaboratorySupplementaryDTO) => data.tests === 0,
            })),
            'DIVIDER',
            ...(this.userService.hasAccess({ access: 'LABORATORY_ROLE_SUPPLEMENTARY' })
                ? [
                      { type: 'UPDATE' as 'UPDATE', action: this.update.bind(this) },
                      { type: 'DELETE' as 'DELETE', action: this.delete.bind(this) },
                  ]
                : []),
        ],
    };

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperHttpService: NgxHelperHttpService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
        private readonly userService: UserService,
    ) {}

    loadList(value?: INgxHelperParamValue): void {
        this.params = value || this.params;

        const page: string = this.params?.page?.toString() || '1';
        this.apiService.request<ILaboratorySupplementaryListRs>(
            'LaboratorySupplementaryList',
            { params: { page } },
            (response) => {
                this.loading = false;
                this.supplementaries = response.list;
                this.pagination = response.pagination;
            },
        );
    }

    create(): void {
        this.ngxHelperBottomSheetService.open(SupplementaryCreateComponent, 'ثبت بار متفرقه جدید', () => {
            this.loadList();
            this.ngxHelperToastService.success('بار متفرقه با موفقیت ثبت شد.');
        });
    }

    update(supplementary: ILaboratorySupplementaryDTO): void {
        this.ngxHelperBottomSheetService.open(
            SupplementaryUpdateComponent,
            'ویرایش بار متفرقه',
            { data: { supplementary } },
            () => {
                this.loadList();
                this.ngxHelperToastService.success('بار متفرقه با موفقیت ویرایش شد.');
            },
        );
    }

    delete(supplementary: ILaboratorySupplementaryDTO): void {
        const item: string = 'بار متفرقه';
        const title: string = supplementary.title;
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const ID: string = supplementary.id;
            this.apiService.request<ILaboratorySupplementaryDeleteRs>(
                'LaboratorySupplementaryDelete',
                { ids: { ID } },
                () => {
                    this.loadList();
                    this.ngxHelperToastService.success('بار متفرقه با موفقیت حذف شد.');
                },
            );
        });
    }

    download(supplementary: ILaboratorySupplementaryDTO, type: ExportType): void {
        if (supplementary.tests === 0) return;

        const body: ILaboratorySupplementaryDownloadRq = { id: supplementary.id, type };
        this.apiService.request<ILaboratorySupplementaryDownloadRs>(
            'LaboratorySupplementaryDownload',
            { body },
            (response) => {
                const file: string = response.path.split('/').slice(-1)[0];
                this.ngxHelperHttpService.download(file, this.configService.getApiUrl(response.path));
            },
        );
    }
}
