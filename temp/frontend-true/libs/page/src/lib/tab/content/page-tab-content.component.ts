import { Component, Input } from '@angular/core';

@Component({
    selector: 'page-tab-content',
    templateUrl: './page-tab-content.component.html',
    styleUrl: './page-tab-content.component.scss',
    standalone: false
})
export class PageTabContentComponent {
    @Input({ required: true }) title!: string;
    @Input({ required: false }) active: boolean = false;
}
