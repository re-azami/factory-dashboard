export interface IPersonnelGroupDTO {
    readonly id: string;
    readonly title: string;
    readonly personnel: number;
    readonly status: 'ACTIVE' | 'DEACTIVE';
}
