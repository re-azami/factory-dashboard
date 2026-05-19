import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperListModule } from '@webilix/ngx-helper/list';
import { NgxHelperLoaderModule } from '@webilix/ngx-helper/loader';
import { NgxHelperMenuModule } from '@webilix/ngx-helper/menu';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { ListModule } from '@lib/list';
import { MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { TimeTableComponent } from '../../components';

import { StudyRoutingModule } from './study.routing';
import { StudyCreateComponent } from './create/study-create.component';
import { StudyCalendarComponent } from './calendar/study-calendar.component';
import { StudyLogComponent } from './log/study-log.component';

import { StudyActiveComponent } from './active/study-active.component';
import { StudyActiveInfoComponent } from './active/info/study-active-info.component';
import { StudyActiveCancelComponent } from './active/cancel/study-active-cancel.component';
import { StudyActiveUpdateComponent } from './active/update/study-active-update.component';
import { StudyActiveCourseComponent } from './active/course/study-active-course.component';
import { StudyActiveEducatorComponent } from './active/educator/study-active-educator.component';
import { StudyActiveParticipantComponent } from './active/participant/study-active-participant.component';
import { StudyActiveParticipantCreateComponent } from './active/participant/create/study-active-participant-create.component';
import { StudyActiveParticipantDepartmentComponent } from './active/participant/department/study-active-participant-department.component';
import { StudyActiveParticipantMaximumComponent } from './active/participant/maximum/study-active-participant-maximum.component';
import { StudyActiveExpenseComponent } from './active/expense/study-active-expense.component';
import { StudyActiveExpenseEducatorComponent } from './active/expense/educator/study-active-expense-educator.component';
import { StudyActiveExpenseCreateComponent } from './active/expense/create/study-active-expense-create.component';
import { StudyActiveExpenseUpdateComponent } from './active/expense/update/study-active-expense-update.component';
import { StudyActiveFinishComponent } from './active/finish/study-active-finish.component';
import { StudyActiveFinishParticipantComponent } from './active/finish/participant/study-active-finish-participant.component';
import { StudyActiveFinishSaveComponent } from './active/finish/save/study-active-finish-save.component';

import { StudyListComponent } from './list/study-list.component';
import { StudyListInfoComponent } from './list/info/study-list-info.component';

import { StudyUnpaidComponent } from './unpaid/study-unpaid.component';
import { StudyUnpaidPaymentComponent } from './unpaid/payment/study-unpaid-payment.component';

import { StudyViewInfoComponent } from './view/info/study-view-info.component';
import { StudyViewParticipantComponent } from './view/participant/study-view-participant.component';
import { StudyViewExpenseComponent } from './view/expense/study-view-expense.component';

@NgModule({
    declarations: [
        StudyCreateComponent,
        StudyCalendarComponent,
        StudyLogComponent,

        StudyActiveComponent,
        StudyActiveInfoComponent,
        StudyActiveCancelComponent,
        StudyActiveUpdateComponent,
        StudyActiveCourseComponent,
        StudyActiveEducatorComponent,
        StudyActiveParticipantComponent,
        StudyActiveParticipantCreateComponent,
        StudyActiveParticipantDepartmentComponent,
        StudyActiveParticipantMaximumComponent,
        StudyActiveExpenseComponent,
        StudyActiveExpenseEducatorComponent,
        StudyActiveExpenseCreateComponent,
        StudyActiveExpenseUpdateComponent,
        StudyActiveFinishComponent,
        StudyActiveFinishParticipantComponent,
        StudyActiveFinishSaveComponent,

        StudyListComponent,
        StudyListInfoComponent,

        StudyUnpaidComponent,
        StudyUnpaidPaymentComponent,

        StudyViewInfoComponent,
        StudyViewParticipantComponent,
        StudyViewExpenseComponent,
    ],
    imports: [
        CommonModule,
        StudyRoutingModule,

        NgxFormModule,
        NgxHelperListModule,
        NgxHelperLoaderModule,
        NgxHelperMenuModule,
        NgxHelperPipeModule,

        ListModule,
        MaterialModule,
        PageModule,

        TimeTableComponent,
    ],
})
export class StudyModule {}
