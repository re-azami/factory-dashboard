export interface ILoadOwnerDTO {
    readonly id: string;
    readonly create: Date;
    readonly name: { readonly first: string; readonly last: string };
    readonly mobile: string;
    readonly nationalCode: string;
    readonly address: string;
    readonly account: {
        readonly name: string;
        readonly sheba: string;
        readonly number: string;
        readonly card: string;
    };
    readonly status: 'ACTIVE' | 'DEACTIVE';
}
