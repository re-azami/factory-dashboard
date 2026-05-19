import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { UserService } from '@lib/providers';

import { Access } from '../access';

export const UserAccessGuard: CanActivateFn = (route): boolean => {
    const router = inject(Router);
    const userService = inject(UserService);

    const access: Access | Access[] | undefined = route.data['userAccess'];
    if (access === undefined) return false;

    const hasAccess: boolean = userService.hasAccess({ access });
    if (!hasAccess) router.navigate(['/dashboard']);

    return hasAccess;
};
