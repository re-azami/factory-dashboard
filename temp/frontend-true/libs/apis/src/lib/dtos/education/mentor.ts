export interface IEducationMentorDTO {
    readonly id: string;
    readonly date: Date;
    readonly name: { readonly first: string; readonly last: string };
    readonly mobile: string;
    readonly nationalCode: string;
    readonly introducer: string;
    readonly cv: string;
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
