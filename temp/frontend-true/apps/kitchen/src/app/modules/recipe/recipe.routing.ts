import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { KitchenRecipeResolver } from '../../resolvers';

import { RecipeComponent } from './recipe.component';
import { RecipeCreateComponent } from './create/recipe-create.component';
import { RecipeUpdateComponent } from './update/recipe-update.component';

const routes: Routes = [
    { path: '', component: RecipeComponent },
    { path: 'create', component: RecipeCreateComponent },
    { path: 'update/:ID', resolve: { recipe: KitchenRecipeResolver }, component: RecipeUpdateComponent },
];

@NgModule({ providers: [provideRouter(routes)] })
export class RecipeRoutingModule {}
