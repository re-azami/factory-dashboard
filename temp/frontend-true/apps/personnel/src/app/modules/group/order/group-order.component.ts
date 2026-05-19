import { Component, Inject } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { NgxHelperBottomSheetService } from '@webilix/ngx-helper';

import { IPersonnelGroupDTO } from '@lib/apis';
import { PersonnelGroup } from '@lib/shared';

@Component({
    host: { selector: 'group-order' },
    templateUrl: './group-order.component.html',
    styleUrl: './group-order.component.scss',
    standalone: false
})
export class GroupOrderComponent {
    public groups: IPersonnelGroupDTO[] = [...this.data.groups];

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { type: PersonnelGroup; groups: IPersonnelGroupDTO[] },
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
    ) {}

    drop(event: CdkDragDrop<IPersonnelGroupDTO>): void {
        if (event.previousIndex === event.currentIndex) return;
        moveItemInArray(this.groups, event.previousIndex, event.currentIndex);
    }

    order(): void {
        this.ngxHelperBottomSheetService.close(this.groups.map((group: IPersonnelGroupDTO) => group.id));
    }
}
