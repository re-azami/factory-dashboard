export type PersonnelLocation = 'DRIVER' | 'SUPERVISOR' | 'PERSONNEL';

interface IPersonnelLocation {
    title: string;
    icon: string;
}

export const PersonnelLocationInfo: { [key in PersonnelLocation]: IPersonnelLocation } = {
    DRIVER: { title: 'راننده', icon: 'bus_alert' },
    SUPERVISOR: { title: 'سرپرست', icon: 'manage_accounts' },
    PERSONNEL: { title: 'پرسنل', icon: 'account_circle' },
};

export const PersonnelLocationList: PersonnelLocation[] = Object.keys(PersonnelLocationInfo) as PersonnelLocation[];
