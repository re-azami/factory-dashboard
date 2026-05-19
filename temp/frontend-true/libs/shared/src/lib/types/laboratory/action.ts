export type LaboratoryAction =
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'CARGO'
    | 'CLEAR'
    // TEST
    | 'TEST_CREATE'
    | 'TEST_UPDATE'
    | 'TEST_DELETE';

interface ILaboratoryAction {
    icon: string;
    title: string;
}

export const LaboratoryActionInfo: { [key in LaboratoryAction]: ILaboratoryAction } = {
    CREATE: { icon: 'add', title: 'ثبت' },
    UPDATE: { icon: 'edit', title: 'ویرایش' },
    DELETE: { icon: 'delete', title: 'حذف' },
    CARGO: { icon: 'terrain', title: 'تغییر بار' },
    CLEAR: { icon: 'delete', title: 'حذف نتایج' },

    TEST_CREATE: { icon: 'biotech', title: 'ثبت نتیجه آزمایش' },
    TEST_UPDATE: { icon: 'biotech', title: 'ویرایش نتیجه آزمایش' },
    TEST_DELETE: { icon: 'biotech', title: 'حذف نتیجه آزمایش' },
};

export const LaboratoryActionList: LaboratoryAction[] = Object.keys(LaboratoryActionInfo) as LaboratoryAction[];
