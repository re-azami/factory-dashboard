import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';

import { NotificationComponent } from './notification.component';
import { NotificationService } from './notification.service';

@NgModule({
    declarations: [NotificationComponent],
    imports: [CommonModule, MatIconModule],
    providers: [NotificationService],
})
export class NotificationModule {}
