import { Access, Alert, App, UserGroup } from '@lib/shared';

export interface IUserDTO {
    readonly id: string;
    readonly group: UserGroup;
    readonly username: string;
    readonly name: { readonly first: string; readonly last: string };
    readonly email: string;
    readonly mobile: string;
    readonly admin: App[];
    readonly access: Access[];
}

export interface IUserPersonDTO
    extends Pick<IUserDTO, 'id' | 'group' | 'username' | 'name' | 'mobile' | 'admin' | 'access'> {
    readonly code: string;
    readonly status: 'ACTIVE' | 'BLOCKED';
}

export interface IUserAlertDTO {
    readonly id: string;
    readonly type: Alert;
    readonly date: { readonly create: Date; readonly view: Date | null };
    readonly alert: string;
}
