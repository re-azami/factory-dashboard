import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxHelperModule } from '@webilix/ngx-helper';
import { NgxHelperValueModule } from '@webilix/ngx-helper/value';

import { ListModule } from '@lib/list';
import { MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { HelpRoutingModule } from './help.routing';
import { HelpComponent } from './help.component';
import { HelpKeyComponent } from './key/help-key.component';
import { HelpTitleComponent } from './title/help-title.component';

@NgModule({
    declarations: [HelpComponent, HelpKeyComponent, HelpTitleComponent],
    imports: [
        CommonModule,
        HelpRoutingModule,

        NgxHelperModule,
        NgxHelperValueModule,

        ListModule,
        MaterialModule,
        PageModule,
    ],
})
export class HelpModule {}
