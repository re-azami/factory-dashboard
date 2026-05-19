export type EducationEducator = 'INSTITUTE' | 'MENTOR' | 'PERSONNEL';

interface IEducationEducator {
    title: string;
}

export const EducationEducatorInfo: { [key in EducationEducator]: IEducationEducator } = {
    INSTITUTE: { title: 'موسسه' },
    MENTOR: { title: 'مدرس' },
    PERSONNEL: { title: 'پرسنل' },
};

export const EducationEducatorList: EducationEducator[] = Object.keys(EducationEducatorInfo) as EducationEducator[];
