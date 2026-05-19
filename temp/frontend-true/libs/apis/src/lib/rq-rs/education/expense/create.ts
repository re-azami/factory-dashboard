import { EducationExpense } from '@lib/shared';

import { IEducationExpenseDTO } from '../../../dtos';

export interface IEducationExpenseCreateRq {
    readonly date: Date;
    readonly type: EducationExpense;
    readonly expense: number;
    readonly description: string;
}

export interface IEducationExpenseCreateRs extends IEducationExpenseDTO {}
