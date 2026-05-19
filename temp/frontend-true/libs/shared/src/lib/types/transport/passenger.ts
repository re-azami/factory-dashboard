export type TransportPassenger = 'STAFF' | 'MALE' | 'FEMALE';

interface ITransportPassenger {
    title: string;
    icon: string;
}

export const TransportPassengerInfo: { [key in TransportPassenger]: ITransportPassenger } = {
    STAFF: { title: 'سرپرست', icon: 'engineering' },
    MALE: { title: 'مرد', icon: 'face_6' },
    FEMALE: { title: 'زن', icon: 'face_3' },
};

export const TransportPassengerList: TransportPassenger[] = Object.keys(TransportPassengerInfo) as TransportPassenger[];
