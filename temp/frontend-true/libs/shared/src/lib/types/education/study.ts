export type EducationStudy = 'GENERAL' | 'TECHNICAL' | 'PROFESSIONAL';

interface IEducationStudy {
    title: string;
}

export const EducationStudyInfo: { [key in EducationStudy]: IEducationStudy } = {
    GENERAL: { title: 'عمومی' },
    TECHNICAL: { title: 'فنی' },
    PROFESSIONAL: { title: 'تخصصی' },
};

export const EducationStudyList: EducationStudy[] = Object.keys(EducationStudyInfo) as EducationStudy[];
