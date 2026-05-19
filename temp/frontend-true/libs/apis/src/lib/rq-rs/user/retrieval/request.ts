export interface IUserRetrievalRequestRq {
    readonly username: string;
    readonly mobile: string;
}

export interface IUserRetrievalRequestRs {
    readonly id: string;
    readonly username: string;
    readonly mobile: string;
}
