export type TransportVehicle = 'BUS' | 'VAN' | 'TAXI';

interface ITransportVehicle {
    title: string;
    icon: string;
    capacity: number;
}

export const TransportVehicleInfo: { [key in TransportVehicle]: ITransportVehicle } = {
    BUS: { title: 'اتوبوس', icon: 'directions_bus_filled', capacity: 32 },
    VAN: { title: 'ون', icon: 'airport_shuttle', capacity: 19 },
    TAXI: { title: 'تاکسی', icon: 'local_taxi', capacity: 4 },
};

export const TransportVehicleList: TransportVehicle[] = Object.keys(TransportVehicleInfo) as TransportVehicle[];
