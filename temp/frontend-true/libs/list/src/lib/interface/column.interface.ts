interface IListColumn<T> {
    readonly type?: 'STRING';
    readonly title: string;
    readonly value: keyof T | ((data: T) => any);
    readonly description?: (data: T) => string | { en: string } | undefined;
    readonly color?: string | ((data: T) => string);
    readonly action?: (data: T) => string[] | (() => void);
    readonly copy?: (data: T) => string;

    readonly isTitle?: boolean;
    readonly isDescription?: boolean;
    readonly isMono?: boolean;
}

export interface IListColumnString<T> extends IListColumn<T> {
    readonly english?: ((data: T) => boolean) | boolean;
}

export interface IListColumnDate<T> extends Omit<IListColumn<T>, 'type'> {
    readonly type: 'DATE';
    readonly format?: string;
}

export interface IListColumnDuration<T> extends Omit<IListColumn<T>, 'type'> {
    readonly type: 'DURATION';
    format?: 'FULL' | 'DAY' | 'HOUR';
}

export interface IListColumnFileSize<T> extends Omit<IListColumn<T>, 'title' | 'type'> {
    readonly title?: string;
    readonly type: 'FILE-SIZE';
}

export interface IListColumnMobile<T> extends Omit<IListColumn<T>, 'title' | 'type'> {
    readonly title?: string;
    readonly type: 'MOBILE';
}

export interface IListColumnNationalCode<T> extends Omit<IListColumn<T>, 'title' | 'type'> {
    readonly title?: string;
    readonly type: 'NATIONAL-CODE';
}

export interface IListColumnNumber<T> extends Omit<IListColumn<T>, 'type'> {
    readonly type: 'NUMBER';
}

export interface IListColumnPlate<T> extends Omit<IListColumn<T>, 'title' | 'type'> {
    readonly title?: string;
    readonly type: 'PLATE';
}

export interface IListColumnPrice<T> extends Omit<IListColumn<T>, 'type'> {
    readonly type: 'PRICE';
}
