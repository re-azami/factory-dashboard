import { AfterViewInit, Component } from '@angular/core';

import { NgxHelperToastService } from '@webilix/ngx-helper';

const STORAGE_KEY = 'factory-dashboard:app-updated';

@Component({
    selector: 'app-page-updated',
    templateUrl: './page-updated.component.html',
    styleUrl: './page-updated.component.scss',
    standalone: false,
})
export class PageUpdatedComponent implements AfterViewInit {
    constructor(private readonly toast: NgxHelperToastService) {}

    ngAfterViewInit(): void {
        if (localStorage.getItem(STORAGE_KEY) !== 'TRUE') return;

        setTimeout(() => {
            localStorage.removeItem(STORAGE_KEY);
            this.toast.info('اپلیکیشن با موفقیت به‌روزرسانی شد.', 0);
        }, 0);
    }
}
