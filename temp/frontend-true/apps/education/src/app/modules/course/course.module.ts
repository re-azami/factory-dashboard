import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';

import { ListModule } from '@lib/list';
import { PageModule } from '@lib/page';

import { CourseRoutingModule } from './course.routing';
import { CourseComponent } from './course.component';
import { CourseCreateComponent } from './create/course-create.component';
import { CourseUpdateComponent } from './update/course-update.component';
import { CourseCodeComponent } from './code/course-code.component';

@NgModule({
    declarations: [CourseComponent, CourseCreateComponent, CourseUpdateComponent, CourseCodeComponent],
    imports: [CommonModule, CourseRoutingModule, NgxFormModule, ListModule, PageModule],
})
export class CourseModule {}
