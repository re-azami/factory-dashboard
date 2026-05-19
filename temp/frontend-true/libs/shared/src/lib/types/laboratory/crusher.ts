export type LaboratoryCrusher = 'CRUSHER' | 'FEED' | 'CONCENTRATE' | 'MIDDLE' | 'TAIL';

interface ILaboratoryCrusher {
    title: string;
    separator: boolean;
}

export const LaboratoryCrusherInfo: { [key in LaboratoryCrusher]: ILaboratoryCrusher } = {
    CRUSHER: { title: 'سنگ شکن', separator: false },
    FEED: { title: 'خوراک (F)', separator: true },
    CONCENTRATE: { title: 'نهایی (C)', separator: true },
    MIDDLE: { title: 'میانی (M)', separator: true },
    TAIL: { title: 'باطله (T)', separator: true },
};

export const LaboratoryCrusherList: LaboratoryCrusher[] = Object.keys(LaboratoryCrusherInfo) as LaboratoryCrusher[];
