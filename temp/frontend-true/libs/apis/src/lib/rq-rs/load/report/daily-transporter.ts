import { LoadCargo } from '@lib/shared';

export interface ILoadReportDailyTransporterRs
    extends Array<{
        readonly transporter: {
            readonly id: string;
            readonly title: string;
        };
        readonly cargos: {
            readonly id: string;
            readonly title: string;
            readonly type: LoadCargo;
            readonly party: { readonly id: string; readonly title: string };
            readonly shipment: { readonly id: string; readonly title: string };
            readonly count: number;
            readonly weight: number;
        }[];
    }> {}
