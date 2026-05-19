import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { UserService } from '@lib/providers';

import { UserGroup } from '../types';

export const UserGroupGuard: CanActivateFn = (route): boolean => {
    const router = inject(Router);
    const userService = inject(UserService);

    const group: UserGroup | UserGroup[] | undefined = route.data['userGroup'];
    if (group === undefined) return false;

    const hasAccess: boolean = userService.hasAccess({ group });
    if (!hasAccess) router.navigate(['/dashboard']);

    return hasAccess;
};
