export type WarehouseLog = 'CREATE' | 'DELETE' | 'JOIN' | 'TITLE' | 'UPDATE';

interface IWarehouseLog {
    icon: string;
    title: string;
    color: 'primary' | 'accent' | 'warn';
}

export const WarehouseLogInfo: { [key in WarehouseLog]: IWarehouseLog } = {
    CREATE: { icon: 'add', title: 'ثبت', color: 'primary' },
    DELETE: { icon: 'delete', title: 'حذف', color: 'warn' },
    JOIN: { icon: 'account_tree', title: 'ایجاد زیرگروه', color: 'accent' },
    TITLE: { icon: 'text_fields', title: 'ویرایش عنوان', color: 'accent' },
    UPDATE: { icon: 'edit', title: 'ویرایش', color: 'primary' },
};

export const WarehouseLogList: WarehouseLog[] = Object.keys(WarehouseLogInfo) as WarehouseLog[];
