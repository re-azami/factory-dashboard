export interface ICoordinate {
    latitude: number;
    longitude: number;
}

export const AppCoordinates: { MAP: ICoordinate; SITE: ICoordinate } = {
    MAP: { latitude: 29.446521, longitude: 55.682251 },
    SITE: { latitude: 29.212785, longitude: 55.498552 },
};
