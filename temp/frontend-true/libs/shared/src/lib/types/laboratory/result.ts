export type LaboratoryResult = 'FE' | 'FEO' | 'GRIND' | 'MOISTURE' | 'SULPHUR';

interface ILaboratoryResult {
    title: string;
}

export const LaboratoryResultInfo: { [key in LaboratoryResult]: ILaboratoryResult } = {
    FE: { title: 'FE' },
    FEO: { title: 'FEO' },
    GRIND: { title: 'دانه‌بندی' },
    MOISTURE: { title: 'رطوبت' },
    SULPHUR: { title: 'سولفور' },
};

export const LaboratoryResultList: LaboratoryResult[] = Object.keys(LaboratoryResultInfo) as LaboratoryResult[];
