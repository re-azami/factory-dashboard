import { EducationExpense } from '@lib/shared';

import { IEducationExpenseDTO } from '../../../dtos';

export interface IEducationExpenseUpdateRq {
    readonly date: Date;
    readonly type: EducationExpense;
    readonly expense: number;
    readonly description: string;
}

export interface IEducationExpenseUpdateRs extends IEducationExpenseDTO {}
