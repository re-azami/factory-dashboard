import { App } from '@lib/shared';

export interface ILogMonthlyRs
    extends Array<{
        readonly title: string;
        readonly from: Date;
        readonly to: Date;
        readonly apps: {
            readonly app: App;
            readonly response: number;
            readonly exception: number;
        }[];
    }> {}
