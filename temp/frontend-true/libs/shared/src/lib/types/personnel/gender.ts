export type PersonnelGender = 'MALE' | 'FEMALE';

interface IPersonnelGender {
    title: string;
    color: string;
    icon: string;
}

export const PersonnelGenderInfo: { [key in PersonnelGender]: IPersonnelGender } = {
    MALE: { title: 'مرد', color: 'rgb(29, 91, 116)', icon: 'face_6' },
    FEMALE: { title: 'زن', color: 'rgb(255, 49, 27)', icon: 'face_3' },
};

export const PersonnelGenderList: PersonnelGender[] = Object.keys(PersonnelGenderInfo) as PersonnelGender[];
