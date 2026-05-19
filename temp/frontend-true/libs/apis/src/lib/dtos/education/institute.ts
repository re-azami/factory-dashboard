export interface IEducationInstituteDTO {
    readonly id: string;
    readonly date: Date;
    readonly title: string;
    readonly ceo: { readonly name: string; readonly mobile: string };
    readonly introducer: { readonly name: string; readonly mobile: string };
    readonly study: number;
    readonly duration: number;
    readonly participant: number;
    readonly hour: number;
    readonly expense: {
        readonly educator: number;
        readonly extra: number;
        readonly total: number;
    };
    readonly status: 'ACTIVE' | 'DEACTIVE';
}
