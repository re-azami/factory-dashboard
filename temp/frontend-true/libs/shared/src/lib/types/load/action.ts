export type LoadAction =
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'ACTIVE'
    | 'DEACTIVE'
    | 'STATUS'
    | 'SETTING'
    | 'ACTIVATION'
    | 'WEIGHT'
    | 'PAYMENT'
    | 'PLATE'
    | 'OWNER'
    | 'DRIVER'
    | 'CHECKOUT';

interface ILoadAction {
    icon: string;
    title: string;
}

export const LoadActionInfo: { [key in LoadAction]: ILoadAction } = {
    CREATE: { icon: 'add', title: 'ثبت' },
    UPDATE: { icon: 'edit', title: 'ویرایش' },
    DELETE: { icon: 'delete', title: 'حذف' },
    ACTIVE: { icon: 'check_circle', title: 'فعال کردن' },
    DEACTIVE: { icon: 'cancel', title: 'غیرفعال کردن' },

    STATUS: { icon: 'task_alt', title: 'تغییر وضعیت بار' },
    SETTING: { icon: 'settings', title: 'تغییر تنظیمات اختصاصی بار' },
    ACTIVATION: { icon: 'done_all', title: 'تغییر فعال سازی اتوماتیک بار' },
    WEIGHT: { icon: 'scale', title: 'توزین ناوگان' },
    PAYMENT: { icon: 'paid', title: 'تغییر مشخصات حمل' },
    PLATE: { icon: 'pin', title: 'تغییر پلاک' },
    OWNER: { icon: 'account_box', title: 'تغییر مالک' },
    DRIVER: { icon: 'airline_seat_recline_normal', title: 'تغییر راننده' },
    CHECKOUT: { icon: 'price_check', title: 'ثبت پرداخت' },
};

export const LoadActionList: LoadAction[] = Object.keys(LoadActionInfo) as LoadAction[];
