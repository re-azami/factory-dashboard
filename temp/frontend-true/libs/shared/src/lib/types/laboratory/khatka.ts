export type LaboratoryKhatka =
    | 'FEED'
    | 'CONCENTRATE'
    | 'BALLMILL_1ST'
    | 'BALLMILL_2ND'
    | 'HYDROCYCLONE_1ST'
    | 'HYDROCYCLONE_2ND'
    | 'THICKENER'
    | 'FILTERPRESS';

interface ILaboratoryKhatka {
    title: string;
    grind: 'NONE' | 'FEED' | 'CONCENTRATE' | 'BALLMILL' | 'HYDROCYCLONE' | 'THICKENER';
    khatka: boolean;
}

export const LaboratoryKhatkaInfo: { [key in LaboratoryKhatka]: ILaboratoryKhatka } = {
    FEED: { title: 'خوراک (FEED)', grind: 'FEED', khatka: true },
    CONCENTRATE: { title: 'محصول (CONCENTRATE)', grind: 'CONCENTRATE', khatka: true },
    BALLMILL_1ST: { title: 'خروجی بالمیل اولیه', grind: 'BALLMILL', khatka: true },
    BALLMILL_2ND: { title: 'خروجی بالمیل ثانویه', grind: 'BALLMILL', khatka: true },
    HYDROCYCLONE_1ST: { title: 'سرریز هیدروسیکلون اولیه', grind: 'HYDROCYCLONE', khatka: true },
    HYDROCYCLONE_2ND: { title: 'سرریز هیدروسیکلون ثانویه', grind: 'HYDROCYCLONE', khatka: true },
    THICKENER: { title: 'خروجی تیکنر', grind: 'THICKENER', khatka: true },
    FILTERPRESS: { title: 'فیلترپرس', grind: 'NONE', khatka: false },
};

export const LaboratoryKhatkaList: LaboratoryKhatka[] = Object.keys(LaboratoryKhatkaInfo) as LaboratoryKhatka[];
