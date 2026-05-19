import { IAccess } from './access.interface';
import { Access } from './access.type';

export const AccessInfo: { [key in Access]: IAccess } = {
    //#region EDUCATION
    // DASHBOARD
    EDUCATION_DASHBOARD_ACTIVE: { app: 'EDUCATION', title: 'لیست دوره‌های در حال برگزاری', type: 'DASHBOARD' },
    EDUCATION_DASHBOARD_STUDY: { app: 'EDUCATION', title: 'نمودار ماهانه دوره‌های برگزار شده', type: 'DASHBOARD' },
    // REPORT
    EDUCATION_REPORT_STUDY: { app: 'EDUCATION', title: 'گزارش دوره‌های برگزار شده', type: 'REPORT' },
    EDUCATION_REPORT_COURSE: { app: 'EDUCATION', title: 'گزارش دوره‌ها', type: 'REPORT' },
    EDUCATION_REPORT_INSTITUTE: { app: 'EDUCATION', title: 'گزارش موسسه‌ها', type: 'REPORT' },
    EDUCATION_REPORT_MENTOR: { app: 'EDUCATION', title: 'گزارش مدرس‌ها', type: 'REPORT' },
    EDUCATION_REPORT_PARTICIPANT: { app: 'EDUCATION', title: 'گزارش شرکت‌کننده‌ها', type: 'REPORT' },
    EDUCATION_REPORT_PERSONNEL: { app: 'EDUCATION', title: 'گزارش دوره‌ای امتیاز پرسنل', type: 'REPORT' },
    // ACCESS
    EDUCATION_COURSE: { app: 'EDUCATION', title: 'مدیریت دوره‌ها' },
    EDUCATION_MENTOR: { app: 'EDUCATION', title: 'مدیریت مدرس‌ها' },
    EDUCATION_INSTITUTE: { app: 'EDUCATION', title: 'مدیریت موسسه‌ها' },
    EDUCATION_LOCATION: { app: 'EDUCATION', title: 'مدیریت فضاهای آموزشی' },
    EDUCATION_ACTIVE: { app: 'EDUCATION', title: 'مشاهده دوره‌های در حال برگزاری' },
    EDUCATION_DONE: { app: 'EDUCATION', title: 'مشاهده دوره‌های برگزار شده' },
    EDUCATION_CANCELED: { app: 'EDUCATION', title: 'مشاهده دوره‌های لغو شده' },
    EDUCATION_UNPAID: { app: 'EDUCATION', title: 'مشاهده دوره‌های پرداخت نشده' },
    EDUCATION_LOG: { app: 'EDUCATION', title: 'مشاهده تغییرات دوره‌ها' },
    EDUCATION_SETTING: { app: 'EDUCATION', title: 'ثبت تنظیمات سیستم' },
    // ROLE
    EDUCATION_ROLE_STUDY: {
        app: 'EDUCATION',
        title: 'مسئول برگزاری دوره',
        actions: ['ثبت برگزاری دوره جدید', 'مدیریت اطلاعات دوره‌های در حال برگزاری', 'ثبت اطلاعات پایان دوره'],
        type: 'ROLE',
    },
    EDUCATION_ROLE_PAYMENT: {
        app: 'EDUCATION',
        title: 'مسئول امور مالی',
        actions: ['مشاهده لیست دوره‌های پرداخت نشده', 'ثبت اطلاعات پرداحت دوره (هزینه‌ برگزاری)'],
        type: 'ROLE',
    },
    //#endregion

    //#region KITCHEN
    // DASHBOARD
    KITCHEN_DASHBOARD_CALENDAR: { app: 'KITCHEN', title: 'مشاهده برنامه غذایی هفتگی', type: 'DASHBOARD' },
    KITCHEN_DASHBOARD_SERVING: { app: 'KITCHEN', title: 'مشاهده نمودار روزانه تعداد سرو', type: 'DASHBOARD' },
    KITCHEN_DASHBOARD_INVENTORY: { app: 'KITCHEN', title: 'مشاهده موجودی کالاهای منتخب', type: 'DASHBOARD' },
    // ACCESS
    KITCHEN_GROUP: { app: 'KITCHEN', title: 'مدیریت گروه‌های کالا' },
    KITCHEN_GOOD: { app: 'KITCHEN', title: 'مدیریت کالاها' },
    KITCHEN_INVENTORY: { app: 'KITCHEN', title: 'مدیریت موجودی کالاها' },
    KITCHEN_RECIPE: { app: 'KITCHEN', title: 'مدیریت غذاها' },
    KITCHEN_CALENDAR: { app: 'KITCHEN', title: 'مدیریت برنامه غذایی' },
    KITCHEN_SERVING: { app: 'KITCHEN', title: 'مدیریت سرو غذا' },
    KITCHEN_SERVING_LOG: { app: 'KITCHEN', title: 'گزارش تغییرات سرو غذا' },
    //#endregion

    //#region LABORATORY
    // DASHBOARD
    LABORATORY_DASHBOARD_DAILY: { app: 'LABORATORY', title: 'مشاهده گزارش روزانه ثبت نتایج', type: 'DASHBOARD' },
    // REPORT
    LABORATORY_REPORT_AVERAGE: { app: 'LABORATORY', title: 'گزارش متوسط نتایج آزمایش', type: 'REPORT' },
    LABORATORY_REPORT_CRUSHER_LOCATION: { app: 'LABORATORY', title: 'گزارش جامع سنگ شکن', type: 'REPORT' },
    LABORATORY_REPORT_KHATKA_LOCATION: { app: 'LABORATORY', title: 'گزارش جامع ختکا', type: 'REPORT' },
    LABORATORY_REPORT_CRUSHER: { app: 'LABORATORY', title: 'گزارش بارهای سنگ شکن', type: 'REPORT' },
    LABORATORY_REPORT_KHATKA: { app: 'LABORATORY', title: 'گزارش بارهای ختکا', type: 'REPORT' },
    LABORATORY_REPORT_LOAD: { app: 'LABORATORY', title: 'گزارش بارهای روزانه', type: 'REPORT' },
    // ACCESS
    LABORATORY_CARGO: { app: 'LABORATORY', title: 'مدیریت بارها' },
    LABORATORY_PRODUCTION_CRUSHER: { app: 'LABORATORY', title: 'مدیریت اطلاعات تولید سنگ شکن' },
    LABORATORY_PRODUCTION_KHATKA: { app: 'LABORATORY', title: 'مدیریت اطلاعات تولید ختکا' },
    LABORATORY_CRUSHER: { app: 'LABORATORY', title: 'مشاهده نتایج آزمایش سنگ شکن' },
    LABORATORY_KHATKA: { app: 'LABORATORY', title: 'مشاهده نتایج آزمایش ختکا' },
    LABORATORY_BLAINE: { app: 'LABORATORY', title: 'مشاهده نتایج آزمایش بلین' },
    LABORATORY_DAVIS: { app: 'LABORATORY', title: 'مشاهده نتایج آزمایش دیویس تیوب' },
    LABORATORY_SOLID: { app: 'LABORATORY', title: 'مشاهده نتایج آزمایش درصد جامد' },
    LABORATORY_LOAD: { app: 'LABORATORY', title: 'مشاهده نتایج آزمایش بارهای روزانه' },
    LABORATORY_MISC: { app: 'LABORATORY', title: 'مشاهده نتایج آزمایش بارهای متفرقه' },
    LABORATORY_SUPPLEMENTARY: { app: 'LABORATORY', title: 'مشاهده نتایج آزمایش بارهای متفرقه' },
    LABORATORY_LOG: { app: 'LABORATORY', title: 'مشاهده گزارش تغییرات نتایج آزمایش' },
    LABORATORY_SETTING: { app: 'LABORATORY', title: 'ثبت تنظیمات آزمایشگاه' },
    // ROLE
    LABORATORY_ROLE_LOAD: {
        app: 'LABORATORY',
        title: 'تکنیسین بارهای روزانه',
        actions: [
            'ثبت مقدار استاندارد',
            'مشاهده نتایج روزانه آزمایش‌ها',
            'ثبت و مدیریت نتایح آزمایش‌های بارهای روزانه',
            'مشاهده گزارش بارهای روزانه',
        ],
        type: 'ROLE',
    },
    LABORATORY_ROLE_MISC: {
        app: 'LABORATORY',
        title: 'تکنیسین بارهای متفرقه',
        actions: ['ثبت مقدار استاندارد', 'ثبت و مدیریت نتایح آزمایش‌های بارهای متفرقه'],
        type: 'ROLE',
    },
    LABORATORY_ROLE_SUPPLEMENTARY: {
        app: 'LABORATORY',
        title: 'تکنیسین بارهای متفرقه',
        actions: ['ثبت مقدار استاندارد', 'ثبت و مدیریت نتایح آزمایش‌های بارهای متفرقه'],
        type: 'ROLE',
    },
    LABORATORY_ROLE_TECHNICIAN: {
        app: 'LABORATORY',
        title: 'تکنیسین آزمایشگاه',
        actions: [
            'ثبت مقدار استاندارد',
            'مشاهده نتایج روزانه آزمایش‌ها',
            'ثبت و مدیریت نتایج آزمایش سنگ شکن',
            'ثبت و مدیریت نتایج آزمایش ختکا',
            'ثبت و مدیریت نتایج آزمایش بلین',
            'ثبت و مدیریت نتایج آزمایش دیویس تیوب',
            'ثبت و مدیریت نتایج آزمایش درصد جامد',
            'مشاهده گزارش جامع سنگ شکن',
            'مشاهده گزارش جامع ختکا',
            'مشاهده گزارش بارهای سنگ شکن',
            'مشاهده گزارش بارهای ختکا',
        ],
        type: 'ROLE',
    },
    //#endregion

    //#region LOAD
    // DASHBOARD
    LOAD_DASHBOARD_TYPE: { app: 'LOAD', title: 'اطلاعات کلی حواله‌ها بر حسب نوع بار', type: 'DASHBOARD' },
    LOAD_DASHBOARD_ACTIVE: { app: 'LOAD', title: 'اطلاعات حواله‌های فعال', type: 'DASHBOARD' },
    LOAD_DASHBOARD_CARGO: { app: 'LOAD', title: 'اطلاعات بارهای روزانه', type: 'DASHBOARD' },
    LOAD_DASHBOARD_CHART: { app: 'LOAD', title: 'نمودار حواله‌های روزانه', type: 'DASHBOARD' },
    // REPORT
    LOAD_REPORT_ACTIVE: { app: 'LOAD', title: 'گزارش بارهای فعال', type: 'REPORT' },
    LOAD_REPORT_DRAFT: { app: 'LOAD', title: 'گزارش حواله', type: 'REPORT' },
    LOAD_REPORT_DAILY: { app: 'LOAD', title: 'گزارش روزانه', type: 'REPORT' },
    LOAD_REPORT_PARTY: { app: 'LOAD', title: 'گزارش طرف حساب', type: 'REPORT' },
    LOAD_REPORT_SHIPMENT: { app: 'LOAD', title: 'گزارش محوله', type: 'REPORT' },
    LOAD_REPORT_TRANSPORTER: { app: 'LOAD', title: 'گزارش باربری', type: 'REPORT' },
    LOAD_REPORT_CARGO: { app: 'LOAD', title: 'گزارش بار', type: 'REPORT' },
    LOAD_REPORT_OWNER: { app: 'LOAD', title: 'گزارش مالک', type: 'REPORT' },
    LOAD_REPORT_TRUCK: { app: 'LOAD', title: 'گزارش ناوگان', type: 'REPORT' },
    LOAD_REPORT_DAILY_TRANSPORTER: { app: 'LOAD', title: 'گزارش روزانه باربری', type: 'REPORT' },
    // ACCESS
    LOAD_PARTY: { app: 'LOAD', title: 'مدیریت طرف حساب‌ها' },
    LOAD_SHIPMENT: { app: 'LOAD', title: 'مدیریت محموله‌ها' },
    LOAD_MISC: { app: 'LOAD', title: 'مدیریت محموله‌های متفرقه' },
    LOAD_TRANSPORTER: { app: 'LOAD', title: 'مدیریت باربری‌ها' },
    LOAD_CARGO: { app: 'LOAD', title: 'مدیریت بارها' },
    LOAD_OWNER: { app: 'LOAD', title: 'مدیریت مالک‌ها' },
    LOAD_TRUCK: { app: 'LOAD', title: 'مدیریت ناوگان' },
    LOAD_CHECKOUT: { app: 'LOAD', title: 'مدیریت پرداخت‌ها' },
    LOAD_SETTING: { app: 'LOAD', title: 'ثبت تنظیمات سیستم' },
    LOAD_DATA_LOG: { app: 'LOAD', title: 'مشاهده گزارش تغییرات اطلاعات' },
    LOAD_DRAFT_DAILY: { app: 'LOAD', title: 'مشاهده حواله‌های روزانه' },
    LOAD_DRAFT_ACTIVE: { app: 'LOAD', title: 'مشاهده حواله‌های فعال' },
    LOAD_DRAFT_FINISHED: { app: 'LOAD', title: 'مشاهده حواله‌های قبلی' },
    LOAD_DRAFT_CANCELED: { app: 'LOAD', title: 'مشاهده حواله‌های لغو شده' },
    LOAD_DRAFT_UPDATED: { app: 'LOAD', title: 'مشاهده حواله‌های ویرایش شده' },
    LOAD_DRAFT_LOG: { app: 'LOAD', title: 'مشاهده گزارش تغییرات حواله' },
    LOAD_DRAFT_UPDATE: { app: 'LOAD', title: 'ویرایش اطلاعات حواله' },
    LOAD_FLOW_CANCEL: { app: 'LOAD', title: 'لغو کردن حواله‌های فعال' },
    // ROLE
    LOAD_ROLE_TRAFFIC: {
        app: 'LOAD',
        title: 'مسئول ورود و خروج سایت',
        actions: [
            'مشاهده حواله‌های روزانه',
            'مشاهده حواله‌های فعال',
            'صدور حواله جدید',
            'ثبت اطلاعات ورود و خروج سایت در فرایندهای بار',
            'گزارش بارهای فعال',
            'گزارش روزانه باربری',
        ],
        type: 'ROLE',
    },
    LOAD_ROLE_TRAFFIC_MINE: {
        app: 'LOAD',
        title: 'مسئول ورود و خروج معدن',
        actions: [
            'مشاهده حواله‌های روزانه',
            'مشاهده حواله‌های فعال',
            'ثبت اطلاعات ورود و خروج معدن در فرایندهای بار',
            'گزارش بارهای فعال',
        ],
        type: 'ROLE',
    },
    LOAD_ROLE_WEIGHT: {
        app: 'LOAD',
        title: 'مسئول توزین',
        actions: [
            'مشاهده حواله‌های روزانه',
            'مشاهده حواله‌های فعال',
            'ثبت اطلاعات باسکول در فرابند‌های بار',
            'ثبت اطلاعات توزین خالی برای ناوگان ثبت شده',
            'گزارش بارهای فعال',
            'گزارش روزانه باربری',
        ],
        type: 'ROLE',
    },
    LOAD_ROLE_LOADING: {
        app: 'LOAD',
        title: 'مسئول بارگیری سایت',
        actions: [
            'مشاهده حواله‌های روزانه',
            'مشاهده حواله‌های فعال',
            'ثبت اطلاعات بارگیری سایت در فرایندهای بار',
            'گزارش بارهای فعال',
        ],
        type: 'ROLE',
    },
    LOAD_ROLE_LOADING_MINE: {
        app: 'LOAD',
        title: 'مسئول بارگیری معدن',
        actions: [
            'مشاهده حواله‌های روزانه',
            'مشاهده حواله‌های فعال',
            'ثبت اطلاعات بارگیری معدن در فرایند‌های بار',
            'گزارش بارهای فعال',
        ],
        type: 'ROLE',
    },
    LOAD_ROLE_DISCHARGE: {
        app: 'LOAD',
        title: 'مسئول تخلیه سایت',
        actions: [
            'مشاهده حواله‌های روزانه',
            'مشاهده حواله‌های فعال',
            'ثبت اطلاعات تخلیه سایت در فرایند‌های بار',
            'گزارش بارهای فعال',
        ],
        type: 'ROLE',
    },
    //#endregion

    //#region PERSONNEL
    // REPORT
    PERSONNEL_REPORT_MEMBER: { app: 'PERSONNEL', title: 'گزارش اطلاعات پرسنل', type: 'REPORT' },
    // ACCESS
    PERSONNEL_GROUP: { app: 'PERSONNEL', title: 'مدیریت گروه‌های اطلاعات' },
    PERSONNEL_MEMBER: { app: 'PERSONNEL', title: 'ثبت / ویرایش پرسنل' },
    PERSONNEL_LOCATION: { app: 'PERSONNEL', title: 'مدیریت مکان پرسنل' },
    PERSONNEL_SEARCH: { app: 'PERSONNEL', title: 'جستجوی پرسنل' },
    PERSONNEL_STATUS: { app: 'PERSONNEL', title: 'تغییر وضعیت استخدام' },
    PERSONNEL_EXPORT: { app: 'PERSONNEL', title: 'دانلود لیست پرسنل' },
    // ROLE
    PERSONNEL_ROLE_MEMBER: {
        app: 'PERSONNEL',
        title: 'مدیریت پرسنل',
        actions: [
            'ثبت پرسنل جدید',
            'ویرایش پرسنل',
            'تغییر وضعیت استخدام',
            'جستجوی پرسنل',
            'مشاهده گزارش تغییرات پرسنل',
            'مشاهده گزارش اطلاعات پرسنل',
            'دانلود لیست پرسنل',
        ],
        type: 'ROLE',
    },
    //#endregion

    //#region SUPPORT
    // ACCESS
    SUPPORT_TICKET: { app: 'SUPPORT', title: 'درخواست‌های پشتیبانی' },
    SUPPORT_NOTIFICATION: { app: 'SUPPORT', title: 'اعلان‌های عمومی' },
    SUPPORT_ALERT: { app: 'SUPPORT', title: 'اعلان‌های سیستمی' },
    SUPPORT_SETTING: { app: 'SUPPORT', title: 'ثبت تنظیمات سیستم' },
    //#endregion

    //#region TRANSPORT
    // ACCESS
    TRANSPORT_GROUP: { app: 'TRANSPORT', title: 'مدیریت گروه‌های مکان' },
    TRANSPORT_LOCATION: { app: 'TRANSPORT', title: 'مدیریت مکان‌ها' },
    TRANSPORT_PARKING: { app: 'TRANSPORT', title: 'مدیریت پارکینگ‌ها' },
    TRANSPORT_IMPORT: { app: 'TRANSPORT', title: 'آپلود لیست مکان‌ها' },
    TRANSPORT_FINAL: { app: 'TRANSPORT', title: 'مشاهده مسیرهای نهایی' },
    // ROLE
    TRANSPORT_ROLE_STATION: {
        app: 'TRANSPORT',
        title: 'مدیر ایستگاه',
        actions: ['مشاهده لیست و مشخصات مکان‌ها', 'مدیریت ایستگاه‌ها', 'ویرایش ایستگاه‌های محاسبه شده'],
        type: 'ROLE',
    },
    TRANSPORT_ROLE_ROUTE: {
        app: 'TRANSPORT',
        title: 'مدیر مسیر',
        actions: [
            'مشاهده لیست و مشخصات مکان‌ها',
            'مشاهده لیست و مشخصات پارکینگ‌ها',
            'مشاهده لیست و مشخصات ایستگاه‌ها',
            'مدیریت مسیرها',
        ],
        type: 'ROLE',
    },
    //#endregion

    //#region WAREHOUSE
    // ACCESS
    WAREHOUSE_CATEGORY_LOG: { app: 'WAREHOUSE', title: 'گزارش تغییرات گروه‌ها' },
    WAREHOUSE_STOCK_LOG: { app: 'WAREHOUSE', title: 'گزارش تغییرات کالاها' },
    WAREHOUSE_INVENTORY: { app: 'WAREHOUSE', title: 'مشاهده لیست کالاها' },
    WAREHOUSE_EXPORT: { app: 'WAREHOUSE', title: 'دانلود لیست کالاها' },
    WAREHOUSE_SETTING: { app: 'WAREHOUSE', title: 'ثبت تنظیمات سیستم' },
    WAREHOUSE_HELP: { app: 'WAREHOUSE', title: 'مشاهده راهنمای کد گروه‌ها' },
    // ROLE
    WAREHOUSE_CATEGORY: {
        app: 'WAREHOUSE',
        title: 'مدیر گروه',
        actions: ['ثبت گروه جدید', 'ویرایش گروه', 'حذف گروه'],
        type: 'ROLE',
    },
    WAREHOUSE_STOCK: {
        app: 'WAREHOUSE',
        title: 'مدیر کالا',
        actions: ['ثبت کالای جدید', 'ویرایش عنوان کالا', 'ایجاد زیرگروه از گروه‌های ثبت شده'],
        type: 'ROLE',
    },
    WAREHOUSE_DELETE: {
        app: 'WAREHOUSE',
        title: 'مدیر حذف کالا',
        actions: ['مشاهده لیست کالاها', 'حذف کالا'],
        type: 'ROLE',
    },
    //#endregion
};
