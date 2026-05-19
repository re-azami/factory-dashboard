import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { IUserDTO } from '@lib/apis';
import { Access, AccessInfo, AccessList, App, Storages, UserGroup } from '@lib/shared';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _user?: IUserDTO;
    get user(): IUserDTO | undefined {
        return this._user;
    }

    private userChanged: Subject<IUserDTO | undefined> = new Subject<IUserDTO | undefined>();
    get onUserChanged(): Observable<IUserDTO | undefined> {
        return this.userChanged.asObservable();
    }

    initUser(user: IUserDTO | undefined): void {
        this._user = user;
        this.userChanged.next(this._user);
    }

    signin(token: string, user: IUserDTO): void {
        localStorage.setItem(Storages.USER_TOKEN, token);
        this.initUser(user);
    }

    signout(): void {
        localStorage.removeItem(Storages.USER_TOKEN);
        this.initUser(undefined);
    }

    hasAccess(check: { group?: UserGroup | UserGroup[]; admin?: App; app?: App; access?: Access | Access[] }): boolean {
        if (!this._user) return false;
        if (this._user.group === 'MANAGER') return true;

        const group: UserGroup[] = check.group === undefined ? [] : Array.isArray(check.group) ? check.group : [check.group];
        if (group.length !== 0 && !group.includes(this._user.group)) return false;

        const admin: App | undefined = check.admin;
        if (admin && (!this._user.admin.includes(admin) || this._user.group === 'USER')) return false;

        const app: App | undefined = check.app;
        if (app && !this.hasAccess({ access: AccessList.filter((a: Access) => AccessInfo[a].app === app) })) return false;

        const access: Access[] =
            check.access === undefined ? [] : Array.isArray(check.access) ? check.access : [check.access];
        if (access.length !== 0) {
            const check: boolean[] = access.map((a) => {
                if (!this._user) return false;

                if (this._user.group === 'ADMIN' && this._user.admin.includes(AccessInfo[a].app)) return true;
                return this._user.access.includes(a);
            });
            if (!check.includes(true)) return false;
        }

        return true;
    }
}
