import { LoadAction } from '@lib/shared';

export interface ILoadLogDataDTO {
    readonly date: Date;
    readonly action: LoadAction;
    readonly user: {
        readonly id: string;
        readonly name: string;
    } | null;
    readonly changes: {
        readonly title: string;
        readonly initial: string;
        readonly changed: string;
    }[];
    readonly description: string;
}
