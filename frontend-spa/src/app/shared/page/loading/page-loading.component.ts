import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-page-loading',
    templateUrl: './page-loading.component.html',
    styleUrl: './page-loading.component.scss',
    standalone: false,
})
export class PageLoadingComponent {
    @Input() label: string = 'در حال بارگذاری ...';
}
