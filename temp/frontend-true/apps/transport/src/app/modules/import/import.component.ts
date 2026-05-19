import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Helper } from '@webilix/helper-library';
import { INgxForm, INgxFormValues } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';
import { NgxHelperParam } from '@webilix/ngx-helper/param';

import { IOptionDTO } from '@lib/apis';
import { IPageTitle } from '@lib/page';
import { TransportPassenger, TransportPassengerInfo, TransportPassengerList } from '@lib/shared';

import { ImportProgressComponent } from './progress/import-progress.component';
import { IImportLocation, IImportPassenger } from './import.interface';

@Component({
    host: { selector: 'import' },
    templateUrl: './import.component.html',
    styleUrls: ['./import.component.scss'],
    standalone: false
})
export class ImportComponent implements OnInit {
    public transportPassengerInfo = TransportPassengerInfo;

    public title: IPageTitle = { title: 'آپلود لیست مکان‌ها' };

    public params: NgxHelperParam[] = [];
    public ngxForm: INgxForm = { submit: 'آپلود لیست', inputs: [] };

    public file: string = '';
    public readError: boolean = false;
    public emptyError: boolean = false;
    public hasError: boolean = false;
    public showForm: boolean = false;

    public passengers: IImportPassenger[] = [];
    public locations: IImportLocation[] = [];

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
    ) {}

    ngOnInit(): void {
        this.setParams();
    }

    setParams(): void {
        this.params = [{ type: 'COMMENT', title: 'فایل', value: this.file || 'مشخص نشده است', english: !!this.file }];
    }

    setForm(): void {
        this.ngxForm.inputs = [];
        if (!this.file || this.readError || this.emptyError || this.hasError) return;

        const groups: IOptionDTO[] = this.activatedRoute.snapshot.data['groups'];
        const group: string | undefined = this.activatedRoute.snapshot.params['groupId'] || undefined;

        this.ngxForm.inputs = [
            {
                name: 'group',
                type: 'SELECT',
                title: 'گروه مکان',
                value: group,
                options: groups,
                description:
                    'در صورت تایید، اطلاعات تمام مکان‌ها و مسافرهای ثبت شده در گروه از سیستم حذف شده ' +
                    'و اطلاعات جدید جایگزین آنها می‌شود. تغییرات ایجاد شده قابل بازیابی نخواهند بود.',
            },
            [
                { type: 'COMMENT', title: 'تعداد مکان', value: Helper.NUMBER.format(this.locations.length) },
                { type: 'COMMENT', title: 'تعداد مسافر', value: Helper.NUMBER.format(this.passengers.length) },
            ],
        ];

        this.showForm = true;
    }

    upload(event: Event): void {
        this.showForm = false;

        const files = (event.target as HTMLInputElement).files;
        if (!files || files.length === 0) return;

        const file: File = files[0];
        this.file = file.name;
        this.readError = false;
        this.emptyError = false;
        this.hasError = false;
        this.setParams();

        this.passengers = [];
        this.locations = [];

        const fileReader = new FileReader();
        fileReader.onerror = () => (this.readError = true);
        fileReader.onload = () => {
            const text: string = (fileReader.result as string).trim().replace(/\r/gi, '');
            text.split('\n').forEach((content: string, line: number) => {
                const [latitude, longitude, code, passenger, type] = content
                    .trim()
                    .split(',')
                    .map((t) => t.trim());
                if (latitude === '' && longitude === '' && code === '' && passenger === '' && type === '') return;

                const errors: string[] = [];
                if (latitude === '' || isNaN(+longitude)) errors.push('طول جغرافیایی صحیح مشخص نشده است.');
                if (latitude === '' || isNaN(+latitude)) errors.push('عرض جغرافیایی صحیح مشخص نشده است.');
                if (code.trim() === '') errors.push('کد پرسنلی مشخص نشده است.');
                if (code.trim().length !== 4 || !Helper.IS.STRING.numeric(code.trim()))
                    errors.push('کد پرسنلی صحیح مشخص نشده است.');
                if (passenger.trim() === '') errors.push('نام مسافر مشخص نشده است.');
                if (!TransportPassengerList.includes(type as TransportPassenger))
                    errors.push('نوع مسافر صحیح مشخص نشده است.');

                this.passengers.push({
                    line,
                    content,
                    errors,
                    latitude: +latitude,
                    longitude: +longitude,
                    passenger: passenger.trim(),
                    code: code.trim(),
                    type: type as TransportPassenger,
                });
            });

            this.emptyError = this.passengers.length === 0;
            this.hasError = this.passengers.some((passenger: IImportPassenger) => passenger.errors.length !== 0);

            this.passengers.forEach((passenger: IImportPassenger) => {
                const location = this.locations.find(
                    (l) => l.latitude === passenger.latitude && l.longitude === passenger.longitude,
                );

                if (location)
                    location.passengers.push({ name: passenger.passenger, code: passenger.code, type: passenger.type });
                else
                    this.locations.push({
                        latitude: passenger.latitude,
                        longitude: passenger.longitude,
                        passengers: [{ name: passenger.passenger, code: passenger.code, type: passenger.type }],
                    });
            });

            this.setForm();
        };
        fileReader.readAsText(file);
    }

    ngxSubmit(values: INgxFormValues): void {
        if (this.readError || this.emptyError || this.hasError || this.passengers.length === 0) return;

        this.ngxHelperBottomSheetService.open<{ group: string }>(
            ImportProgressComponent,
            'آپلود لیست',
            { data: { group: values['group'], locations: this.locations } },
            (response) => {
                this.ngxHelperToastService.success('آپلود لیست با موفقیت انجام شد.');
                this.router.navigate(['/location', response.group]);
            },
        );
    }
}
