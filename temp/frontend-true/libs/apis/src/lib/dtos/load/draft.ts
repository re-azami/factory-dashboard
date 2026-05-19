import { LoadCargo } from '@lib/shared';

export interface ILoadDraftDTO {
    readonly id: string;
    readonly date: {
        readonly create: Date;
        readonly update: Date;
        readonly finish: Date;
    };
    readonly status: 'ACTIVE' | 'FINISHED' | 'CANCELED';
    readonly step: string;
    readonly code: string;
    readonly cargo: {
        readonly id: string;
        readonly title: string;
        readonly type: LoadCargo;
        readonly party: {
            readonly id: string;
            readonly title: string;
        };
        readonly shipment: {
            readonly id: string;
            readonly title: string;
        };
    };
    readonly plate: string;
    readonly truck: {
        readonly id: string;
        readonly type: string;
        readonly owner: {
            readonly id: string;
            readonly name: string;
        };
        readonly driver: {
            readonly name: string;
            readonly mobile: string;
        };
    };
    readonly transporter: {
        readonly id: string;
        readonly title: string;
    } | null;
    readonly weight: {
        readonly empty: number;
        readonly full: number;
        readonly net: number;
    };
    readonly payment: {
        readonly price: number;
        readonly value: number;
        readonly checkout: {
            readonly id: string;
            readonly code: string;
            readonly status: 'PAID' | 'UNPAID';
        };
    };
    readonly attachments: {
        readonly id: string;
        readonly create: Date;
        readonly title: string;
        readonly file: {
            readonly path: string;
            readonly mime: string;
            readonly size: number;
        };
        readonly user: {
            readonly id: string;
            readonly name: string;
        };
    }[];
}

export interface ILoadDraftOutDTO extends ILoadDraftDTO {
    readonly bitaDraft: string;
    readonly bitaBill: string;
}

export interface ILoadDraftInDTO extends ILoadDraftDTO {
    readonly inWeightEmpty: number;
    readonly inWeightFull: number;
    readonly inWeightNet: number;
}

export interface ILoadDraftBuyDTO extends ILoadDraftDTO {
    readonly billNumber: string;
    readonly billWeight: number;
}

export interface ILoadDraftSiteDTO extends ILoadDraftDTO {}

export interface ILoadDraftFlowDTO
    extends Pick<
        ILoadDraftDTO,
        'id' | 'date' | 'status' | 'step' | 'code' | 'cargo' | 'plate' | 'truck' | 'transporter' | 'weight'
    > {
    readonly cancelDescription: string;
    readonly previousStep: {
        readonly date: Date;
        readonly step: string;
    } | null;
    readonly delay: number | null;
    readonly steps: string[];
}

export interface ILoadDraftLogDTO {
    readonly date: Date;
    readonly step: string;
    readonly user: {
        readonly id: string;
        readonly name: string;
    };
    readonly description: string;
    readonly changes: {
        readonly title: string;
        readonly initial: string;
        readonly changed: string;
    }[];
}
