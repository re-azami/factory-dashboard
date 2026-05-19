export type LaboratorySolid =
    | 'BALLMILL_1ST'
    | 'BALLMILL_2ND'
    | 'HYDROCYCLONE_1ST'
    | 'HYDROCYCLONE_2ND'
    | 'ENTRANCE'
    | 'THICKENER'
    | 'TANK'
    | 'LINE_28'
    | 'LINE_29'
    | 'POURED_1ST'
    | 'POURED_2ND';

interface ILaboratorySolid {
    title: string;
}

export const LaboratorySolidInfo: { [key in LaboratorySolid]: ILaboratorySolid } = {
    BALLMILL_1ST: { title: 'خروجی بالمیل اولیه' },
    BALLMILL_2ND: { title: 'خروجی بالمیل ثانویه' },
    HYDROCYCLONE_1ST: { title: 'سرریز هیدروسیکلون اولیه' },
    HYDROCYCLONE_2ND: { title: 'سرریز هیدروسیکلون ثانویه' },
    ENTRANCE: { title: 'ورودی تیکنر' },
    THICKENER: { title: 'خروجی تیکنر' },
    TANK: { title: 'مخزن' },
    LINE_28: { title: 'لاین ۲۸' },
    LINE_29: { title: 'لاین ۲۹' },
    POURED_1ST: { title: 'ته‌ریز اولیه' },
    POURED_2ND: { title: 'ته‌ریز ثانویه' },
};

export const LaboratorySolidList: LaboratorySolid[] = Object.keys(LaboratorySolidInfo) as LaboratorySolid[];
