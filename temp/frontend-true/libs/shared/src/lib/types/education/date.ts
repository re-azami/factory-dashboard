export type EducationDate = 'THEORETICAL' | 'PRACTICAL';

interface IEducationDate {
    title: string;
}

export const EducationDateInfo: { [key in EducationDate]: IEducationDate } = {
    THEORETICAL: { title: 'تئوری' },
    PRACTICAL: { title: 'عملی' },
};

export const EducationDateList: EducationDate[] = Object.keys(EducationDateInfo) as EducationDate[];
