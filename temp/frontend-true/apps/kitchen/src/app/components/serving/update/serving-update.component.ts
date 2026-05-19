import { Component, Inject, OnInit } from '@angular/core';

import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { JalaliDateTime } from '@webilix/jalali-date-time';
import { INgxForm, INgxFormValues, NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperBottomSheetService, NgxHelperToastService } from '@webilix/ngx-helper';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';

import {
    ApiService,
    IKitchenRecipeListDTO,
    IKitchenServingDTO,
    IKitchenServingUpdateRq,
    IKitchenServingUpdateRs,
} from '@lib/apis';
import { KitchenGoodInfo, KitchenMealInfo } from '@lib/shared';

import { KitchenToolsService } from '../../../providers';

@Component({
    host: { selector: 'serving-update' },
    imports: [NgxFormModule, NgxHelperLoaderModule],
    templateUrl: './serving-update.component.html',
    styleUrl: './serving-update.component.scss',
})
export class ServingUpdateComponent implements OnInit {
    public loading: boolean = true;
    public ngxForm: INgxForm = {
        submit: 'ویرایش',
        inputs: [
            {
                inputs: [
                    { type: 'COMMENT', title: 'تاریخ', value: JalaliDateTime().toTitle(this.data.serving.date) },
                    { type: 'COMMENT', title: 'وعده غذایی', value: KitchenMealInfo[this.data.serving.meal].title },
                ],
                flex: [2],
            },
            {
                name: 'serving',
                type: 'NUMBER',
                title: 'تعداد سرو',
                value: this.data.serving.serving,
                minimum: 1,
                autoFocus: true,
                description:
                    'این تعداد به صورت تقریبی مشخص شده و برای محاسبه مواد غذایی مورد نیاز استفاده می‌شود. امکان تغییر این گزینه پس از سرو غذا وجود دارد.',
            },
            { name: 'description', type: 'TEXTAREA', title: 'توضیحات', optional: true },
        ],
    };

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { serving: IKitchenServingDTO },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly kitchenToolsService: KitchenToolsService,
    ) {}

    ngOnInit(): void {
        this.kitchenToolsService.getActiveRecipe(this.data.serving.meal).then((recipes: IKitchenRecipeListDTO[]) => {
            this.loading = false;
            this.ngxForm.inputs.splice(1, 0, [
                {
                    name: 'recipe',
                    type: 'SELECT',
                    title: 'غذا',
                    value: this.data.serving.recipe.id,
                    options: recipes,
                    description: `در صورت تغییر، ${KitchenGoodInfo.INGREDIENT.title} و ${KitchenGoodInfo.ADDITIVE.title} تغییر داده خواهند شد.`,
                },
            ]);
        });
    }

    ngxSubmit(values: INgxFormValues): void {
        const ID: string = this.data.serving.id;
        const body: IKitchenServingUpdateRq = {
            recipe: values['recipe'],
            serving: values['serving'],
            description: values['description'],
        };
        this.apiService.request<IKitchenServingUpdateRs>('KitchenServingUpdate', { body, ids: { ID } }, (response) => {
            this.ngxHelperToastService.success('برنامه غذایی با موفقیت ویرایش شد.');
            this.ngxHelperBottomSheetService.close(response);
        });
    }
}
