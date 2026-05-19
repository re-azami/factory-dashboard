export interface ILoadFlowCreateRq {
    readonly cargo: string;
    readonly plate: string;
    readonly truck: string | null;
    readonly transporter: string;
    readonly description: string;
}
