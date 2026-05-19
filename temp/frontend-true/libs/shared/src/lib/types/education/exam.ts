export type EducationExam = 'PRACTICAL' | 'WRITTEN' | 'ORAL' | 'ELECTRONIC';

interface IEducationExam {
    title: string;
}

export const EducationExamInfo: { [key in EducationExam]: IEducationExam } = {
    PRACTICAL: { title: 'عملی' },
    WRITTEN: { title: 'کتبی' },
    ORAL: { title: 'شفاهی' },
    ELECTRONIC: { title: 'الکترونیکی' },
};

export const EducationExamList: EducationExam[] = Object.keys(EducationExamInfo) as EducationExam[];
