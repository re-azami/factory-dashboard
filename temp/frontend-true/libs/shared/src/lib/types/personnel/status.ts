export type PersonnelStatus = 'ACTIVE' | 'SUSPEND' | 'LEFT' | 'FIRED';

interface IPersonnelStatus {
    title: string;
    icon: string;
    color: 'primary' | 'accent' | 'warn';
    chart: string;
}

export const PersonnelStatusInfo: { [key in PersonnelStatus]: IPersonnelStatus } = {
    ACTIVE: { title: 'فعال', icon: 'badge', color: 'primary', chart: 'rgb(29, 91, 116)' },
    SUSPEND: { title: 'تعلیق', icon: 'update', color: 'accent', chart: 'rgb(228, 190, 146)' },
    LEFT: { title: 'ترک کار', icon: 'cancel', color: 'warn', chart: 'rgb(255, 49, 27)' },
    FIRED: { title: 'اخراج', icon: 'logout', color: 'warn', chart: 'rgb(255, 49, 27)' },
};

export const PersonnelStatusList: PersonnelStatus[] = Object.keys(PersonnelStatusInfo) as PersonnelStatus[];
