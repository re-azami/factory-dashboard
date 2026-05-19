export interface IKitchenDashboardServingRs
    extends Array<{
        readonly title: string;
        readonly from: Date;
        readonly to: Date;
        readonly serving: {
            readonly breakfast: number;
            readonly lunch: number;
            readonly dinner: number;
        };
    }> {}
