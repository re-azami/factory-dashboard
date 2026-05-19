import { AfterContentInit, Component, ContentChildren, EventEmitter, Input, Output, QueryList } from '@angular/core';
import { PageTabContentComponent } from 'libs/page/src/lib/tab/content/page-tab-content.component';

@Component({
    selector: 'page-tab',
    templateUrl: './page-tab.component.html',
    styleUrl: './page-tab.component.scss',
    standalone: false
})
export class PageTabComponent implements AfterContentInit {
    @ContentChildren(PageTabContentComponent) public tabs!: QueryList<PageTabContentComponent>;

    @Input({ required: false }) activeTab: number = 0;
    @Output() activeTabChanged: EventEmitter<number> = new EventEmitter<number>();

    public titles: string[] = [];

    ngAfterContentInit(): void {
        let activeIndex: number = -1;
        this.tabs.forEach((t, index) => {
            this.titles.push(t.title);
            if (activeIndex === -1 && t.active) activeIndex = index;
        });
        if (activeIndex === -1 || activeIndex > this.tabs.length - 1) activeIndex = 0;

        this.activeTab = activeIndex;
        this.tabs.forEach((t, index) => (t.active = index === activeIndex));
    }

    setActiveIndex(index: number) {
        const tab = this.tabs.get(index);
        if (!tab) return;

        this.activeTab = index;
        this.tabs.forEach((t, i) => (t.active = i === index));

        this.activeTabChanged.emit(index);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
