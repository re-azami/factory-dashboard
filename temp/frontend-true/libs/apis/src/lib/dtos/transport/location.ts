import { TransportPassenger } from '@lib/shared';

export interface ITransportLocationPassengerDTO {
    readonly id: string;
    readonly type: TransportPassenger;
    readonly code: string | null;
    readonly name: string;
}

export interface ITransportLocationDTO {
    readonly id: string;
    readonly date: Date;
    readonly title: string;
    readonly latitude: number;
    readonly longitude: number;
    readonly passengers: ITransportLocationPassengerDTO[];
    readonly status: 'ACTIVE' | 'DEACTIVE';
}
