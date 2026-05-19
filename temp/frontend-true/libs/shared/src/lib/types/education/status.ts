export type EducationStatus = 'ACTIVE' | 'CANCELED' | 'DONE';

interface IEducationStatus {
    title: string;
}

export const EducationStatusInfo: { [key in EducationStatus]: IEducationStatus } = {
    ACTIVE: { title: 'فعال' },
    CANCELED: { title: 'لغو شده' },
    DONE: { title: 'برگزار شده' },
};

export const EducationStatusList: EducationStatus[] = Object.keys(EducationStatusInfo) as EducationStatus[];
