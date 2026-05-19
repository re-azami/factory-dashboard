import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';

import { ListModule } from '@lib/list';
import { PageModule } from '@lib/page';

import { PersonRoutingModule } from './person.routing';
import { PersonComponent } from './person.component';
import { PersonCreateComponent } from './create/person-create.component';
import { PersonAccessComponent } from './access/person-access.component';
import { PersonAdminComponent } from './admin/person-admin.component';
import { PersonPasswordComponent } from './password/person-password.component';
import { PersonInfoComponent } from './info/person-info.component';
import { PersonCodeComponent } from './code/person-code.component';

@NgModule({
    declarations: [
        PersonComponent,
        PersonCreateComponent,
        PersonAccessComponent,
        PersonAdminComponent,
        PersonPasswordComponent,
        PersonInfoComponent,
        PersonCodeComponent,
    ],
    imports: [CommonModule, PersonRoutingModule, NgxFormModule, ListModule, PageModule],
})
export class PersonModule {}
