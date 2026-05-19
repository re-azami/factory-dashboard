import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';

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
        ReactiveFormsModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatDividerModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatSliderModule,
        MatTooltipModule,
    ],
    exports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatDividerModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatSliderModule,
        MatTooltipModule,
        PageComponent,
        PageHeaderComponent,
        PageFooterComponent,
        PageLoadingComponent,
        PageUpdatedComponent,
        PageAboutComponent,
    ],
})
export class SharedModule {}
