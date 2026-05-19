export type PersonnelLog =
    | 'CREATE'
    | 'DELETE'
    | 'ACTIVE'
    | 'TERMINATE'
    | 'IMAGE'
    // EMPLOYEMENT
    | 'EMPLOYEMENT-DATE'
    | 'EMPLOYEMENT-ACTIVE'
    | 'EMPLOYEMENT-DEACTIVE'
    | 'EMPLOYEMENT-DELETE'
    // UPDATE
    | 'UPDATE'
    | 'UPDATE-CODE'
    | 'UPDATE-DEPARTMENT'
    | 'UPDATE-EDUCATION'
    | 'UPDATE-POSITION'
    // LOCATION
    | 'LOCATION-CREATE'
    | 'LOCATION-DELETE';

interface IPersonnelLog {
    title: string;
    icon: string;
    color: 'primary' | 'accent' | 'warn';
}

export const PersonnelLogInfo: { [key in PersonnelLog]: IPersonnelLog } = {
    CREATE: { title: 'ثبت پرسنل', icon: 'add_box', color: 'primary' },
    DELETE: { title: 'حذف پرسنل', icon: 'delete', color: 'warn' },
    ACTIVE: { title: 'فعال کردن وضعیت استخدام', icon: 'check_box', color: 'primary' },
    TERMINATE: { title: 'غیرفعال کردن وضعیت استخدام', icon: 'disabled_by_default', color: 'warn' },
    IMAGE: { title: 'تغییر عکس پرسنلی', icon: 'image', color: 'accent' },

    'EMPLOYEMENT-DATE': { title: 'تغییر تاریخ استخدام', icon: 'event', color: 'accent' },
    'EMPLOYEMENT-ACTIVE': { title: 'فعال کردن استخدام', icon: 'badge', color: 'primary' },
    'EMPLOYEMENT-DEACTIVE': { title: 'غیرفعال کردن استخدام', icon: 'cancel', color: 'warn' },
    'EMPLOYEMENT-DELETE': { title: 'حذف تغییر وضعیت استخدام', icon: 'delete', color: 'warn' },

    UPDATE: { title: 'ویرایش اطلاعات شخصی', icon: 'edit', color: 'accent' },
    'UPDATE-CODE': { title: 'تغییر کد پرسنلی', icon: 'badge', color: 'accent' },
    'UPDATE-DEPARTMENT': { title: 'تغییر واحد', icon: 'edit', color: 'accent' },
    'UPDATE-EDUCATION': { title: 'تغییر مدرک تحصیلی', icon: 'school', color: 'accent' },
    'UPDATE-POSITION': { title: 'تغییر سمت', icon: 'edit', color: 'accent' },

    'LOCATION-CREATE': { title: 'ثبت / تغییر مکان', icon: 'location_on', color: 'primary' },
    'LOCATION-DELETE': { title: 'حذف مکان', icon: 'location_off', color: 'warn' },
};

export const PersonnelLogList: PersonnelLog[] = Object.keys(PersonnelLogInfo) as PersonnelLog[];
