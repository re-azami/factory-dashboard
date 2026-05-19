import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperMenuModule } from '@webilix/ngx-helper/menu';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { ListModule } from '@lib/list';
import { ChartModule, MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { ReportRoutingModule } from './report.routing';

import { ReportStudyComponent } from './study/report-study.component';
import { ReportCourseComponent } from './course/report-course.component';
import { ReportInstituteComponent } from './institute/report-institute.component';
import { ReportMentorComponent } from './mentor/report-mentor.component';
import { ReportParticipantComponent } from './participant/report-participant.component';
import { ReportPersonnelComponent } from './personnel/report-personnel.component';

@NgModule({
    declarations: [
        ReportStudyComponent,
        ReportCourseComponent,
        ReportInstituteComponent,
        ReportMentorComponent,
        ReportParticipantComponent,
        ReportPersonnelComponent,
    ],
    imports: [
        CommonModule,
        ReportRoutingModule,

        NgxFormModule,
        NgxHelperMenuModule,
        NgxHelperPipeModule,

        ListModule,
        ChartModule,
        MaterialModule,
        PageModule,
    ],
})
export class ReportModule {}
