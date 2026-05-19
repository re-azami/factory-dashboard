import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { IUserDTO } from '@lib/apis';
import { UserService } from '@lib/providers';

export const UserGuard: CanActivateFn = (): boolean => {
    const router = inject(Router);
    const userService = inject(UserService);

    const user: IUserDTO | undefined = userService.user;
    if (user === undefined) router.navigate(['/']);

    return !!user;
};
