import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { UserService } from '@lib/providers';
import { App, AppInfo, AppList } from '@lib/shared';

export const AdminAppResolver: ResolveFn<string> = (route): string => {
    const router = inject(Router);
    const userService = inject(UserService);

    const app: App = route.paramMap.get('APP') as App;
    if (!app || !AppList.includes(app) || userService.user?.group !== 'MANAGER') {
        router.navigate(['/dashboard']);
        return '';
    }

    return `سرویس ${AppInfo[app].title}`;
};
