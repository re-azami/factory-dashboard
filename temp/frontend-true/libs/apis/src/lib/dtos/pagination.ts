export interface IPaginationDTO {
    readonly count: number;
    readonly limit: number;
    readonly page: {
        readonly current: number;
        readonly total: number;
    };
}
