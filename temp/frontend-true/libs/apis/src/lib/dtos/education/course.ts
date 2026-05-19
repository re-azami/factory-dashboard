export interface IEducationCourseDTO {
    readonly id: string;
    readonly date: Date;
    readonly code: string;
    readonly title: string;
    readonly description: string;
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
