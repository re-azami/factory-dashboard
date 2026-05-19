export interface ISettingLaboratoryDTO {
    readonly jump: {
        readonly active: boolean;
        readonly key: string;
    };
    readonly dailyDate: 'TITLE' | 'NUMBER';
    readonly crusher: string[];
    readonly khatka: string[];
}
