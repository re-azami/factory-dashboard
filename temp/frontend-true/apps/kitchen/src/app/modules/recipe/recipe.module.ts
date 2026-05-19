import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { ListModule } from '@lib/list';
import { MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { RecipeRoutingModule } from './recipe.routing';
import { RecipeComponent } from './recipe.component';
import { RecipeCreateComponent } from './create/recipe-create.component';
import { RecipeUpdateComponent } from './update/recipe-update.component';

import { RecipeGoodComponent } from './good/recipe-good.component';
import { RecipeGoodServingComponent } from './good/serving/recipe-good-serving.component';

@NgModule({
    declarations: [
        RecipeComponent,
        RecipeCreateComponent,
        RecipeUpdateComponent,

        RecipeGoodComponent,
        RecipeGoodServingComponent,
    ],
    imports: [CommonModule, RecipeRoutingModule, NgxFormModule, NgxHelperPipeModule, MaterialModule, ListModule, PageModule],
})
export class RecipeModule {}
