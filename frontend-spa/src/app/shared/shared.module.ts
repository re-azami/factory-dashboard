import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { PageComponent } from './page/page.component';
import { PageHeaderComponent } from './page/header/page-header.component';
import { PageFooterComponent } from './page/footer/page-footer.component';
import { PageLoadingComponent } from './page/loading/page-loading.component';
import { PageUpdatedComponent } from './page/updated/page-updated.component';
import { PageAboutComponent } from './page/about/page-about.component';

@NgModule({
    declarations: [
        PageComponent,
        PageHeaderComponent,
        PageFooterComponent,
        PageLoadingComponent,
        PageUpdatedComponent,
        PageAboutComponent,
    ],
    imports: [
        CommonModule,
        RouterModule,
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        MatProgressBarModule,
    ],
    exports: [
        CommonModule,
        RouterModule,
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        MatProgressBarModule,
        PageComponent,
        PageHeaderComponent,
        PageFooterComponent,
        PageLoadingComponent,
        PageUpdatedComponent,
        PageAboutComponent,
    ],
})
export class SharedModule {}
