export interface ILoadTruckDTO {
    readonly id: string;
    readonly create: Date;
    readonly owner: {
        readonly id: string;
        readonly name: string;
        readonly status: 'ACTIVE' | 'DEACTIVE';
    };
    readonly plate: string;
    readonly type: string;
    readonly vin: string;
    readonly driver: {
        readonly name: { readonly first: string; readonly last: string };
        readonly mobile: string;
        readonly nationalCode: string;
    };
    readonly weight: {
        readonly date: Date;
        readonly weight: number;
    } | null;
    readonly status: 'ACTIVE' | 'DEACTIVE';
}
