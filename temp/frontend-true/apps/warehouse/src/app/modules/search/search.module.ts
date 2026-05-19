import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ListModule } from '@lib/list';
import { PageModule } from '@lib/page';

import { FilterComponent } from '../../components';

import { SearchRoutingModule } from './search.routing';
import { SearchComponent } from './search.component';

@NgModule({
    declarations: [SearchComponent],
    imports: [CommonModule, SearchRoutingModule, PageModule, ListModule, FilterComponent],
})
export class SearchModule {}
