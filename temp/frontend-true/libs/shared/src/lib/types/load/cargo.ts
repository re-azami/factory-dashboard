import { LoadFlow } from './flow';

export type LoadCargo = 'OUT' | 'IN' | 'BUY' | 'SITE';

interface ILoadCargo {
    key: string;
    icon: string;
    title: string;
    color: string;
    description?: string;
    steps: { id: string; title: string; flow: LoadFlow; canDeactive?: boolean; filter?: boolean }[];
    disallowCancel?: string;
    draft: string;
}

export const LoadCargoInfo: { [key in LoadCargo]: ILoadCargo } = {
    OUT: {
        key: 'S',
        icon: 'logout',
        title: 'خروجی',
        color: '#ff6600',
        steps: [
            { id: 'ENTER', title: 'ورود به سایت (صدور بارکد)', flow: 'TRAFFIC' },
            { id: 'WEIGHT_EMPTY', title: 'توزین (خالی)', flow: 'WEIGHT', filter: true },
            { id: 'LOADING', title: 'بارگیری', flow: 'LOADING', canDeactive: true },
            { id: 'WEIGHT_FULL', title: 'توزین (پر)', flow: 'WEIGHT', filter: true },
            { id: 'EXIT', title: 'خروج از سایت', flow: 'TRAFFIC', filter: true },
        ],
        draft: 'بارکد',
    },
    IN: {
        key: 'M',
        icon: 'login',
        title: 'ورودی',
        color: '#0068b3',
        description: 'بارهای ورودی که پس از صدور حواله، ناوگان با مراجعه به معدن، اقدام به بارگیری می‌کند.',
        steps: [
            { id: 'ISSUE', title: 'صدور حواله', flow: 'TRAFFIC' },
            { id: 'ENTER_MINE', title: 'ورود به معدن', flow: 'TRAFFIC_MINE', canDeactive: true, filter: true },
            { id: 'LOADING_MINE', title: 'بارگیری معدن', flow: 'LOADING_MINE' },
            { id: 'EXIT_MINE', title: 'خروج از معدن', flow: 'TRAFFIC_MINE', canDeactive: true, filter: true },
            { id: 'ENTER', title: 'ورود به سایت', flow: 'TRAFFIC', filter: true },
            { id: 'WEIGHT_FULL', title: 'توزین (پر)', flow: 'WEIGHT', filter: true },
            { id: 'DISCHARGE', title: 'تخلیه', flow: 'DISCHARGE', canDeactive: true },
            { id: 'WEIGHT_EMPTY', title: 'توزین (خالی)', flow: 'WEIGHT', canDeactive: true, filter: true },
            { id: 'EXIT', title: 'خروج از سایت', flow: 'TRAFFIC', filter: true },
        ],
        disallowCancel: 'LOADING_MINE',
        draft: 'حواله',
    },
    BUY: {
        key: 'B',
        icon: 'comments_disabled',
        title: 'ورودی (آزاد)',
        color: '#33aaff',
        description: 'بارهای ورودی که از طرف فروشنده ارسال شده و حواله آنها توسط فروشنده صادر می‌شود.',
        steps: [
            { id: 'ENTER', title: 'ورود به سایت (صدور بارکد)', flow: 'TRAFFIC' },
            { id: 'WEIGHT_FULL', title: 'توزین (پر)', flow: 'WEIGHT', filter: true },
            { id: 'DISCHARGE', title: 'تخلیه', flow: 'DISCHARGE', canDeactive: true },
            { id: 'WEIGHT_EMPTY', title: 'توزین (خالی)', flow: 'WEIGHT', filter: true },
            { id: 'EXIT', title: 'خروج از سایت', flow: 'TRAFFIC', filter: true },
        ],
        draft: 'بارکد',
    },
    SITE: {
        key: 'I',
        icon: 'home_work',
        title: 'داخلی',
        color: '#1da756',
        description: 'بارهایی که به صورت داخلی و برای جابجایی دپوها در داخل سایت اسمیران تعریف می‌شود.',
        steps: [{ id: 'WEIGHT', title: 'توزین', flow: 'WEIGHT' }],
        draft: 'بارکد',
    },
};

export const LoadCargoList: LoadCargo[] = Object.keys(LoadCargoInfo) as LoadCargo[];
