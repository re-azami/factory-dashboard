export type App = 'EDUCATION' | 'KITCHEN' | 'LABORATORY' | 'LOAD' | 'PERSONNEL' | 'SUPPORT' | 'TRANSPORT' | 'WAREHOUSE';

interface IApp {
    title: string;
    icon: string;
    subdomain: string;
}

export const AppInfo: { [key in App]: IApp } = {
    EDUCATION: { title: 'آموزش', icon: 'cast_for_education', subdomain: 'education' },
    KITCHEN: { title: 'آشپزخانه', icon: 'local_dining', subdomain: 'kitchen' },
    LABORATORY: { title: 'آزمایشگاه', icon: 'biotech', subdomain: 'lab' },
    LOAD: { title: 'مدیریت بار', icon: 'local_shipping', subdomain: 'load' },
    PERSONNEL: { title: 'پرسنل', icon: 'people', subdomain: 'personnel' },
    SUPPORT: { title: 'پشتیبانی', icon: 'support_agent', subdomain: 'support' },
    TRANSPORT: { title: 'حمل و نقل', icon: 'departure_board', subdomain: 'transport' },
    WAREHOUSE: { title: 'انبار', icon: 'warehouse', subdomain: 'warehouse' },
};

export const AppList: App[] = (Object.keys(AppInfo) as App[]).sort((a1, a2) =>
    AppInfo[a1].title.localeCompare(AppInfo[a2].title),
);
