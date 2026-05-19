import {
    IListAction,
    IListActionDelete,
    IListActionLog,
    IListActionStatus,
    IListActionUpdate,
    IListColumnDate,
    IListColumnDuration,
    IListColumnFileSize,
    IListColumnMobile,
    IListColumnNationalCode,
    IListColumnNumber,
    IListColumnPlate,
    IListColumnPrice,
    IListColumnString,
} from './interface';

export type ListColumn<T> =
    | IListColumnString<T>
    | IListColumnDate<T>
    | IListColumnDuration<T>
    | IListColumnFileSize<T>
    | IListColumnMobile<T>
    | IListColumnNationalCode<T>
    | IListColumnNumber<T>
    | IListColumnPlate<T>
    | IListColumnPrice<T>;

export type ListAction<T> =
    | 'DIVIDER'
    | IListAction<T>
    | IListActionUpdate<T>
    | IListActionDelete<T>
    | IListActionStatus<T>
    | IListActionLog<T>;

export interface IList<T> {
    readonly type: string;
    readonly description?: (data: T) => string;
    readonly icon?: (data: T) => string | { icon: string; color: 'primary' | 'accent' | 'warn' };
    readonly isDeactive?: (data: T) => boolean;
    readonly columns: ListColumn<T>[];
    readonly action?: Omit<IListAction<T>, 'title' | 'access' | 'disableOn' | 'hideOn'>;
    readonly actions?: ListAction<T>[];
}
