import { TransportVehicle } from '@lib/shared';

export interface ITransportParkingVehicleDTO {
    readonly id: string;
    readonly type: TransportVehicle;
    readonly title: string;
    readonly capacity: number;
}

export interface ITransportParkingDTO {
    readonly id: string;
    readonly date: Date;
    readonly title: string;
    readonly latitude: number;
    readonly longitude: number;
    readonly vehicles: ITransportParkingVehicleDTO[];
    readonly status: 'ACTIVE' | 'DEACTIVE';
}
