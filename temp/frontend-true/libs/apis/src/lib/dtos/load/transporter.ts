export interface ILoadTransporterDTO {
    readonly id: string;
    readonly create: Date;
    readonly title: string;
    readonly code: string;
    readonly status: 'ACTIVE' | 'DEACTIVE';
}
