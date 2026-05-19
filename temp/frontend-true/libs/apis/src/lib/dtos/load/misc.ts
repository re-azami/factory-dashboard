export interface ILoadMiscDTO {
    readonly id: string;
    readonly create: Date;
    readonly title: string;
    readonly unit: string;
    readonly description: string;
    readonly status: 'ACTIVE' | 'DEACTIVE';
}
