export interface IEducationLocationDTO {
    readonly id: string;
    readonly date: Date;
    readonly title: string;
    readonly availability: boolean;
    readonly description: string;
    readonly status: 'ACTIVE' | 'DEACTIVE';
}
