import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { ListModule } from '@lib/list';
import { MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { NotificationRoutingModule } from './notification.routing';
import { NotificationComponent } from './notification.component';
import { NotificationCreateComponent } from './create/notification-create.component';
import { NotificationUpdateComponent } from './update/notification-update.component';
import { NotificationAppComponent } from './app/notification-app.component';
import { NotificationUserComponent } from './user/notification-user.component';

@NgModule({
    declarations: [
        NotificationComponent,
        NotificationCreateComponent,
        NotificationUpdateComponent,
        NotificationAppComponent,
        NotificationUserComponent,
    ],
    imports: [
        CommonModule,
        NotificationRoutingModule,

        NgxFormModule,
        NgxHelperPipeModule,

        ListModule,
        MaterialModule,
        PageModule,
    ],
})
export class NotificationModule {}
