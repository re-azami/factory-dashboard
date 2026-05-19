import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperListModule } from '@webilix/ngx-helper/list';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { ListModule } from '@lib/list';
import { MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { MemberRoutingModule } from './member.routing';
import { MemberComponent } from './member.component';
import { MemberCreateComponent } from './create/member-create.component';
import { MemberLogComponent } from './log/member-log.component';

import { MemberInfoComponent } from './info/member-info.component';
import { MemberInfoViewComponent } from './info/view/member-info-view.component';

import { MemberUpdateComponent } from './update/member-update.component';
import { MemberUpdateCodeComponent } from './update/code/member-update-code.component';
import { MemberUpdateEmployementComponent } from './update/employement/member-update-employement.component';
import { MemberUpdateDepartmentComponent } from './update/department/member-update-department.component';
import { MemberUpdatePositionComponent } from './update/position/member-update-position.component';
import { MemberUpdateEducationComponent } from './update/education/member-update-education.component';

import { MemberStatusComponent } from './status/member-status.component';
import { MemberStatusActiveComponent } from './status/active/member-status-active.component';
import { MemberStatusDeactiveComponent } from './status/deactive/member-status-deactive.component';

@NgModule({
    declarations: [
        MemberComponent,
        MemberCreateComponent,
        MemberLogComponent,

        MemberInfoComponent,
        MemberInfoViewComponent,

        MemberUpdateComponent,
        MemberUpdateCodeComponent,
        MemberUpdateEmployementComponent,
        MemberUpdateDepartmentComponent,
        MemberUpdatePositionComponent,
        MemberUpdateEducationComponent,

        MemberStatusComponent,
        MemberStatusActiveComponent,
        MemberStatusDeactiveComponent,
    ],
    imports: [
        CommonModule,
        MemberRoutingModule,

        NgxFormModule,
        NgxHelperListModule,
        NgxHelperLoaderModule,
        NgxHelperPipeModule,

        ListModule,
        MaterialModule,
        PageModule,
    ],
})
export class MemberModule {}
