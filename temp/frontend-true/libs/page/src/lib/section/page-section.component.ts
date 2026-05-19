import { Component, Input } from '@angular/core';

@Component({
    selector: 'page-section',
    templateUrl: './page-section.component.html',
    styleUrl: './page-section.component.scss',
    standalone: false
})
export class PageSectionComponent {
    @Input({ required: false }) title?: string;
}
