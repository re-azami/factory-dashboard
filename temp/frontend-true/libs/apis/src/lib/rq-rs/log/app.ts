export interface ILogAppRs
    extends Array<{
        readonly id: string;
        readonly name: string;
        readonly response: number;
        readonly exception: number;
    }> {}
