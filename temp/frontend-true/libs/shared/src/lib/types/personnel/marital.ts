export type PersonnelMarital = 'MARRIED' | 'SINGLE';

interface IPersonnelMarital {
    title: string;
}

export const PersonnelMaritalInfo: { [key in PersonnelMarital]: IPersonnelMarital } = {
    MARRIED: { title: 'متاهل' },
    SINGLE: { title: 'مجرد' },
};

export const PersonnelMaritalList: PersonnelMarital[] = Object.keys(PersonnelMaritalInfo) as PersonnelMarital[];
