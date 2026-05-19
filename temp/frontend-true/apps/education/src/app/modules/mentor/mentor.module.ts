import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';

import { ListModule } from '@lib/list';
import { PageModule } from '@lib/page';

import { MentorRoutingModule } from './mentor.routing';
import { MentorComponent } from './mentor.component';
import { MentorCreateComponent } from './create/mentor-create.component';
import { MentorUpdateComponent } from './update/mentor-update.component';
import { MentorUploadComponent } from './upload/mentor-upload.component';

@NgModule({
    declarations: [MentorComponent, MentorCreateComponent, MentorUpdateComponent, MentorUploadComponent],
    imports: [CommonModule, MentorRoutingModule, NgxFormModule, ListModule, PageModule],
})
export class MentorModule {}
