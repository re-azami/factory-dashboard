import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';

import { PageModule } from '@lib/page';

import { SettingRoutingModule } from './setting.routing';
import { SettingComponent } from './setting.component';
import { SettingCargoComponent } from './cargo/setting-cargo.component';

@NgModule({
    declarations: [SettingComponent, SettingCargoComponent],
    imports: [CommonModule, SettingRoutingModule, NgxFormModule, NgxHelperLoaderModule, PageModule],
})
export class SettingModule {}
