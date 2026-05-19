import { Component } from '@angular/core';

import { IPageMenu } from './shared/interfaces/page-menu';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false,
})
export class AppComponent {
    public menu: IPageMenu[] = [
        {
            id: 'CHAT',
            icon: 'forum',
            title: 'چت',
            children: [{ title: 'گفتگو با عامل', action: ['/chat'] }],
        },
        {
            id: 'DASHBOARD',
            icon: 'home',
            title: 'داشبورد',
            children: [{ title: 'داشبورد', action: ['/dashboard'] }],
        },
        {
            id: 'HISTORY',
            icon: 'history',
            title: 'تاریخچه',
            children: [{ title: 'تاریخچه پرسش‌ها', action: ['/history'] }],
        },
    ];
}
