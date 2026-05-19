export type KitchenLog = 'CREATE' | 'UPDATE' | 'DELETE' | 'USAGE' | 'SERVING' | 'GOOD_CREATE' | 'GOOD_DELETE';

interface IKitchenLog {
    title: string;
}

export const KitchenLogInfo: { [key in KitchenLog]: IKitchenLog } = {
    CREATE: { title: 'ثبت برنامه غذایی' },
    UPDATE: { title: 'ویرایش برنامه غذایی' },
    DELETE: { title: 'حذف برنامه غذایی' },
    USAGE: { title: 'ثبت میزان مصرف' },
    SERVING: { title: 'ثبت اطلاعات سرو' },

    GOOD_CREATE: { title: 'اضافه کردن کالا' },
    GOOD_DELETE: { title: 'حذف کردن کالا' },
};

export const KitchenLogList: KitchenLog[] = Object.keys(KitchenLogInfo) as KitchenLog[];
