import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { SearchComponent } from './search.component';

const routes: Routes = [{ path: '', component: SearchComponent }];

@NgModule({ providers: [provideRouter(routes)] })
export class SearchRoutingModule {}
