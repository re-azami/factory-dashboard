import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperCalendarModule } from '@webilix/ngx-helper/calendar';
import { NgxHelperMenuModule } from '@webilix/ngx-helper/menu';
import { NgxHelperPaginationModule } from '@webilix/ngx-helper/pagination';
import { NgxHelperParamModule } from '@webilix/ngx-helper/param';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { ListModule } from '@lib/list';

import { PageComponent } from './page.component';
import { PageBlockComponent } from './block/page-block.component';
import { PageCardComponent } from './card/page-card.component';

import { PageTitleComponent } from './title/page-title.component';
import { PageTitleMenuComponent } from './title/menu/page-title-menu.component';

import { PageSectionComponent } from './section/page-section.component';
import { PageSectionColumnComponent } from './section/column/page-section-column.component';

import { PageTabComponent } from './tab/page-tab.component';
import { PageTabContentComponent } from './tab/content/page-tab-content.component';

import { PageHeaderComponent } from './header/page-header.component';
import { PageFooterComponent } from './footer/page-footer.component';
import { PageAboutComponent } from './about/page-about.component';
import { PageAlertComponent } from './alert/page-alert.component';

import { PageUserSigninComponent } from './user/signin/page-user-signin.component';
import { PageUserRetrievalComponent } from './user/retrieval/page-user-retrieval.component';
import { PageUserUpdateComponent } from './user/update/page-user-update.component';
import { PageUserPasswordComponent } from './user/password/page-user-password.component';

@NgModule({
    declarations: [
        PageComponent,
        PageBlockComponent,
        PageCardComponent,

        PageTitleComponent,
        PageTitleMenuComponent,

        PageSectionComponent,
        PageSectionColumnComponent,

        PageTabComponent,
        PageTabContentComponent,

        PageHeaderComponent,
        PageFooterComponent,
        PageAboutComponent,
        PageAlertComponent,

        PageUserSigninComponent,
        PageUserRetrievalComponent,
        PageUserUpdateComponent,
        PageUserPasswordComponent,
    ],
    imports: [
        CommonModule,
        RouterModule,

        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        MatProgressBarModule,

        NgxFormModule,
        NgxHelperCalendarModule,
        NgxHelperMenuModule,
        NgxHelperPaginationModule,
        NgxHelperParamModule,
        NgxHelperPipeModule,

        ListModule,
    ],
    exports: [
        PageComponent,
        PageBlockComponent,
        PageCardComponent,

        PageTitleComponent,

        PageSectionComponent,
        PageSectionColumnComponent,

        PageTabComponent,
        PageTabContentComponent,
    ],
})
export class PageModule {}
