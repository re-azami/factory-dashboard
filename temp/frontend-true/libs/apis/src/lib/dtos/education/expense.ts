import { EducationExpense } from '@lib/shared';

export interface IEducationExpenseDTO {
    readonly id: string;
    readonly date: Date;
    readonly type: EducationExpense;
    readonly expense: number;
    readonly description: string;
}
