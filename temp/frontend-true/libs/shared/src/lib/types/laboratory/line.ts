export type LaboratoryLine = '1' | '2';

interface ILaboratoryLine {
    icon: string;
    title: string;
}

export const LaboratoryLineInfo: { [key in LaboratoryLine]: ILaboratoryLine } = {
    1: { icon: 'looks_one', title: 'خط یک' },
    2: { icon: 'looks_two', title: 'خط دو' },
};

export const LaboratoryLineList: LaboratoryLine[] = Object.keys(LaboratoryLineInfo) as LaboratoryLine[];
