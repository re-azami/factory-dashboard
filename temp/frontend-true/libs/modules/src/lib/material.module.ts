import { NgModule } from '@angular/core';

import { ClipboardModule } from '@angular/cdk/clipboard';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
    exports: [
        ClipboardModule,
        DragDropModule,

        MatIconModule,
        MatButtonModule,
        MatSelectModule,
        MatProgressBarModule,
        MatButtonToggleModule,
        MatTabsModule,
        MatCheckboxModule,
    ],
})
export class MaterialModule {}
