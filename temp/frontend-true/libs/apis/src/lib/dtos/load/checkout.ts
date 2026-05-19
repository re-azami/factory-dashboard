export interface ILoadCheckoutDTO {
    readonly id: string;
    readonly date: {
        readonly create: Date;
        readonly from: Date;
        readonly to: Date;
        readonly payment: Date;
    };
    readonly code: string;
    readonly count: {
        readonly cargo: number;
        readonly owner: number;
        readonly draft: number;
    };
    readonly weight: number;
    readonly price: number;
    readonly paid: boolean;
}
