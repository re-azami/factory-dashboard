import { Access, App, UserGroup } from '@lib/shared';

export interface IListAction<T> {
    readonly type?: 'ACTION';
    readonly title: string;
    readonly icon: string;
    readonly color?: 'primary' | 'accent' | 'warn';
    readonly action: (data: T) => string[] | void;
    readonly access?: {
        readonly group?: UserGroup | UserGroup[];
        readonly admin?: App;
        readonly app?: App;
        readonly access?: Access | Access[];
    };

    disableOn?: (data: T) => boolean;
    hideOn?: (data: T) => boolean;
}

export interface IListActionUpdate<T> extends Omit<IListAction<T>, 'type' | 'title' | 'icon' | 'color'> {
    readonly type: 'UPDATE';
}

export interface IListActionDelete<T> extends Omit<IListAction<T>, 'type' | 'title' | 'icon' | 'color' | 'action'> {
    readonly type: 'DELETE';
    readonly action: (data: T) => void;
}

export interface IListActionStatus<T> extends Omit<IListAction<T>, 'type' | 'title' | 'icon' | 'color' | 'action'> {
    readonly type: 'STATUS';
    readonly action: (data: T, active: boolean) => void;
    readonly isActive: (data: T) => boolean;
}

export interface IListActionLog<T> extends Omit<IListAction<T>, 'type' | 'title' | 'icon' | 'color' | 'action'> {
    readonly type: 'LOG';
    readonly action: (data: T) => void;
}
