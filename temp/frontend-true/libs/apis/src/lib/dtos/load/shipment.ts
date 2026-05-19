export interface ILoadShipmentDTO {
    readonly id: string;
    readonly create: Date;
    readonly title: string;
    readonly status: 'ACTIVE' | 'DEACTIVE';
}
