import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';

import { PageModule } from '@lib/page';

import { SettingRoutingModule } from './setting.routing';
import { SettingComponent } from './setting.component';

@NgModule({
    declarations: [SettingComponent],
    imports: [CommonModule, SettingRoutingModule, NgxFormModule, PageModule],
})
export class SettingModule {}
