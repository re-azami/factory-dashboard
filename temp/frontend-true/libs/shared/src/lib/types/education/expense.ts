export type EducationExpense = 'TRANSPORT' | 'BOOK' | 'EQUIPMENT' | 'ACCOMODATION' | 'FOOD' | 'OTHER';

interface IEducationExpense {
    title: string;
}

export const EducationExpenseInfo: { [key in EducationExpense]: IEducationExpense } = {
    TRANSPORT: { title: 'ایاب ذهاب' },
    BOOK: { title: 'کتاب و جزوه' },
    EQUIPMENT: { title: 'تجهیزات مصرفی' },
    ACCOMODATION: { title: 'اسکان' },
    FOOD: { title: 'اغذیه' },
    OTHER: { title: 'متفرقه' },
};

export const EducationExpenseList: EducationExpense[] = Object.keys(EducationExpenseInfo) as EducationExpense[];
