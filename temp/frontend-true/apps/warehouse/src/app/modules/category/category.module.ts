import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';

import { ListModule } from '@lib/list';
import { MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { ParentsComponent } from '../../components';

import { CategoryRoutingModule } from './category.routing';
import { CategoryComponent } from './category.component';
import { CategoryCreateComponent } from './create/category-create.component';
import { CategoryUpdateComponent } from './update/category-update.component';

@NgModule({
    declarations: [CategoryComponent, CategoryCreateComponent, CategoryUpdateComponent],
    imports: [CommonModule, CategoryRoutingModule, NgxFormModule, ListModule, MaterialModule, PageModule, ParentsComponent],
})
export class CategoryModule {}
