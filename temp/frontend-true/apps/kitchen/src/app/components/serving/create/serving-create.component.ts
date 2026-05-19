import { Component, Inject, OnInit } from '@angular/core';

import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { JalaliDateTime } from '@webilix/jalali-date-time';
import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';

import { ApiService, IKitchenRecipeListDTO, IKitchenServingCreateRq, IKitchenServingCreateRs } from '@lib/apis';
import { KitchenMeal, KitchenMealInfo } from '@lib/shared';

import { KitchenToolsService } from '../../../providers';

@Component({
    host: { selector: 'serving-create' },
    imports: [NgxFormModule, NgxHelperLoaderModule],
    templateUrl: './serving-create.component.html',
    styleUrl: './serving-create.component.scss',
})
export class ServingCreateComponent implements OnInit {
    public loading: boolean = true;
    public ngxForm: INgxForm = {
        submit: 'ثبت',
        inputs: [
            {
                inputs: [
                    { type: 'COMMENT', title: 'تاریخ', value: JalaliDateTime().toTitle(this.data.date) },
                    { type: 'COMMENT', title: 'وعده غذایی', value: KitchenMealInfo[this.data.meal].title },
                ],
                flex: [2],
            },
            {
                name: 'serving',
                type: 'NUMBER',
                title: 'تعداد سرو',
                minimum: 1,
                autoFocus: true,
                description:
                    'این تعداد به صورت تقریبی مشخص شده و برای محاسبه مواد غذایی مورد نیاز استفاده می‌شود. امکان تغییر این گزینه پس از سرو غذا وجود دارد.',
            },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { date: Date; meal: KitchenMeal },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly kitchenToolsService: KitchenToolsService,
    ) {}

    ngOnInit(): void {
        this.kitchenToolsService.getActiveRecipe(this.data.meal).then((recipes: IKitchenRecipeListDTO[]) => {
            this.loading = false;
            this.ngxForm.inputs.splice(1, 0, [{ name: 'recipe', type: 'SELECT', title: 'غذا', options: recipes }]);
        });
    }

    ngxSubmit(values: INgxFormValues): void {
        const body: IKitchenServingCreateRq = {
            date: this.data.date,
            meal: this.data.meal,
            recipe: values['recipe'],
            serving: values['serving'],
            description: values['description'],
        };
        this.apiService.request<IKitchenServingCreateRs>('KitchenServingCreate', { body }, (response) => {
            this.ngxHelperToastService.success('برنامه غذایی با موفقیت ثبت شد.');
            this.ngxHelperBottomSheetService.close(response);
        });
    }
}
