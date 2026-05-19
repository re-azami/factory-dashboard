export type LoadData = 'PARTY' | 'SHIPMENT' | 'MISC' | 'TRANSPORTER' | 'CARGO' | 'OWNER' | 'TRUCK' | 'CHECKOUT';

interface ILoadData {
    title: string;
}

export const LoadDataInfo: { [key in LoadData]: ILoadData } = {
    PARTY: { title: 'طرف حساب' },
    SHIPMENT: { title: 'محموله' },
    MISC: { title: 'محموله متفرقه' },
    TRANSPORTER: { title: 'باربری' },
    CARGO: { title: 'بار' },
    OWNER: { title: 'مالک' },
    TRUCK: { title: 'ناوگان' },
    CHECKOUT: { title: 'رسید پرداخت' },
};

export const LoadDataList: LoadData[] = Object.keys(LoadDataInfo) as LoadData[];
