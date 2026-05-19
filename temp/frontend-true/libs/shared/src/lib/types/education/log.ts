export type EducationLog =
    | 'COURSE'
    | 'CREATE'
    | 'EDUCATOR'
    | 'UPDATE'
    | 'DELETE'
    | 'CANCEL'
    | 'DEPARTMENT'
    | 'PARTICIPANT'
    | 'PAYMENT'
    | 'DONE'
    // EXPENSE
    | 'EXPENSE'
    | 'EXPENSE_CREATE'
    | 'EXPENSE_DELETE'
    | 'EXPENSE_UPDATE'
    // PARTICIPANT
    | 'PARTICIPANT_CREATE'
    | 'PARTICIPANT_DELETE';

interface IEducationLog {
    title: string;
    icon: string;
    color: 'primary' | 'accent' | 'warn';
}

export const EducationLogInfo: { [key in EducationLog]: IEducationLog } = {
    COURSE: { title: 'تغییر دوره', icon: 'school', color: 'accent' },
    CREATE: { title: 'ثبت', icon: 'add', color: 'primary' },
    EDUCATOR: { title: 'تغییر برگزارکننده', icon: 'badge', color: 'accent' },
    UPDATE: { title: 'ویرایش', icon: 'edit', color: 'accent' },
    DELETE: { title: 'حذف', icon: 'delete', color: 'warn' },
    CANCEL: { title: 'لغو', icon: 'cancel', color: 'warn' },
    DEPARTMENT: { title: 'تغییر واحدهای مرتبط', icon: 'business', color: 'accent' },
    PARTICIPANT: { title: 'تغییر تعداد شرکت‌کننده', icon: 'people_alt', color: 'accent' },
    PAYMENT: { title: 'ثبت پرداخت هزینه', icon: 'paid', color: 'primary' },
    DONE: { title: 'ثبت پایان دوره', icon: 'done_all', color: 'primary' },

    EXPENSE: { title: 'تغییر هزینه برگزاری', icon: 'monetization_on', color: 'accent' },
    EXPENSE_CREATE: { title: 'ثبت هزینه', icon: 'currency_exchange', color: 'primary' },
    EXPENSE_DELETE: { title: 'حذف هزینه', icon: 'currency_exchange', color: 'warn' },
    EXPENSE_UPDATE: { title: 'ویرایش هزینه', icon: 'currency_exchange', color: 'accent' },

    PARTICIPANT_CREATE: { title: 'ثبت شرکت‌کننده', icon: 'person_add_alt', color: 'primary' },
    PARTICIPANT_DELETE: { title: 'حذف شرکت‌کننده', icon: 'person_remove', color: 'warn' },
};

export const EducationLogList: EducationLog[] = Object.keys(EducationLogInfo) as EducationLog[];
