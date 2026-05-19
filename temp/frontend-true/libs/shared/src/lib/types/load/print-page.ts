export type LoadPrintPage = 'A5' | '8X15';

interface ILoadPrintPage {
    title: string;
}

export const LoadPrintPageInfo: { [key in LoadPrintPage]: ILoadPrintPage } = {
    A5: { title: 'کاغذ A5' },
    '8X15': { title: 'کاغذ 8 در 15 (پرینتر حرارتی)' },
};

export const LoadPrintPageList: LoadPrintPage[] = Object.keys(LoadPrintPageInfo) as LoadPrintPage[];
