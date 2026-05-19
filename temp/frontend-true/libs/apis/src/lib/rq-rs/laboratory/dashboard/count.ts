export interface ILaboratoryDashboardCountRs {
    readonly crusher: {
        readonly day: number;
        readonly result: number;
    };
    readonly khatka: {
        readonly day: number;
        readonly result: number;
    };
    readonly blaine: number;
    readonly davis: number;
    readonly solid: number;
    readonly load: number;
}
