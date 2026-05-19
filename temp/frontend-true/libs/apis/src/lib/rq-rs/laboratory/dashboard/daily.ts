export interface ILaboratoryDashboardDailyDTO {
    readonly date: string;
    readonly tests: {
        readonly crusher: number;
        readonly khatka: number;
        readonly blaine: number;
        readonly davis: number;
        readonly solid: number;
    };
    readonly results: {
        readonly fe: number;
        readonly feo: number;
        readonly grind: number;
        readonly moisture: number;
        readonly sulphur: number;
    };
}

export interface ILaboratoryDashboardDailyRs {
    readonly month: string;
    readonly dates: ILaboratoryDashboardDailyDTO[];
}
