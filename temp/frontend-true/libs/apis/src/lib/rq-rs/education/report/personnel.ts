export interface IEducationReportPersonnelDTO {
    readonly id: string;
    readonly name: string;
    readonly code: string;
    readonly department: { readonly id: string; readonly title: string };
    readonly position: { readonly id: string; readonly title: string };
    readonly study: number;
    readonly duration: number;
}

export interface IEducationReportPersonnelRs {
    readonly study: number;
    readonly duration: number;
    readonly participant: number;
    readonly hour: number;
    readonly participants: IEducationReportPersonnelDTO[];
}
