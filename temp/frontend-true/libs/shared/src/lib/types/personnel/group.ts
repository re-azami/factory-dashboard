export type PersonnelGroup = 'EDUCATION' | 'DEPARTMENT' | 'POSITION';

interface IPersonnelGroup {
    title: string;
}

export const PersonnelGroupInfo: { [key in PersonnelGroup]: IPersonnelGroup } = {
    EDUCATION: { title: 'مدرک تحصیلی' },
    DEPARTMENT: { title: 'واحد' },
    POSITION: { title: 'سمت' },
};

export const PersonnelGroupList: PersonnelGroup[] = Object.keys(PersonnelGroupInfo) as PersonnelGroup[];
