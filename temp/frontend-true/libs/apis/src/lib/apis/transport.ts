import { IApiInfo } from '../api.interface';

export type ApiTransportTypes =
    // GROUP
    | 'TransportGroupList'
    | 'TransportGroupFull'
    | 'TransportGroupInfo'
    | 'TransportGroupCreate'
    | 'TransportGroupUpdate'
    | 'TransportGroupDelete'
    // LOCATION
    | 'TransportLocationList'
    | 'TransportLocationFull'
    | 'TransportLocationInfo'
    | 'TransportLocationCreate'
    | 'TransportLocationUpdate'
    | 'TransportLocationDelete'
    | 'TransportLocationStatus'
    | 'TransportLocationMap'
    | 'TransportLocationDashboard'
    // LOCATION PASSENGER
    | 'TransportLocationPassengerCreate'
    | 'TransportLocationPassengerUpdate'
    | 'TransportLocationPassengerDelete'
    | 'TransportLocationPassengerTransfer'
    // PARKING
    | 'TransportParkingList'
    | 'TransportParkingFull'
    | 'TransportParkingInfo'
    | 'TransportParkingCreate'
    | 'TransportParkingUpdate'
    | 'TransportParkingDelete'
    | 'TransportParkingStatus'
    | 'TransportParkingMap'
    | 'TransportParkingDashboard'
    // PARKING VEHICLE
    | 'TransportParkingVehicleCreate'
    | 'TransportParkingVehicleUpdate'
    | 'TransportParkingVehicleDelete'
    | 'TransportParkingVehicleTransfer'
    // STATION
    | 'TransportStationCalculate'
    | 'TransportStationList'
    | 'TransportStationFull'
    | 'TransportStationInfo'
    | 'TransportStationCreate'
    | 'TransportStationUpdate'
    | 'TransportStationDelete'
    | 'TransportStationDistance'
    | 'TransportStationCopy'
    // ROUTE
    | 'TransportRouteCalculate'
    | 'TransportRouteSave'
    | 'TransportRouteList'
    | 'TransportRouteInfo'
    | 'TransportRouteCreate'
    | 'TransportRouteUpdate'
    | 'TransportRouteDelete'
    | 'TransportRouteAttach'
    | 'TransportRouteEdit'
    | 'TransportRouteCopy'
    | 'TransportRouteReverse'
    | 'TransportRouteColor'
    | 'TransportRouteFinal'
    | 'TransportRouteDashboard'
    // IMPORT
    | 'TransportImportCreate'
    | 'TransportImportSave'
    // FINAL
    | 'TransportFinal';

export const ApiTransportTypesInfo: { [key in ApiTransportTypes]: IApiInfo } = {
    TransportGroupList: { method: 'GET', path: '/transport/group', params: { query: false, page: false } },
    TransportGroupFull: { method: 'GET', path: '/transport/group/full' },
    TransportGroupInfo: { method: 'GET', path: '/transport/group/:ID' },
    TransportGroupCreate: { method: 'POST', path: '/transport/group' },
    TransportGroupUpdate: { method: 'PUT', path: '/transport/group/:ID' },
    TransportGroupDelete: { method: 'DELETE', path: '/transport/group/:ID' },

    TransportLocationList: {
        method: 'GET',
        path: '/transport/location',
        params: { group: true, query: false, page: false },
    },
    TransportLocationFull: { method: 'GET', path: '/transport/location/full', params: { group: true } },
    TransportLocationInfo: { method: 'GET', path: '/transport/location/:ID', params: { group: true } },
    TransportLocationCreate: { method: 'POST', path: '/transport/location', params: { group: true } },
    TransportLocationUpdate: { method: 'PUT', path: '/transport/location/:ID', params: { group: true } },
    TransportLocationDelete: { method: 'DELETE', path: '/transport/location/:ID', params: { group: true } },
    TransportLocationStatus: { method: 'PATCH', path: '/transport/location/:ID/status', params: { group: true } },
    TransportLocationMap: { method: 'GET', path: '/transport/location/map', params: { group: true } },
    TransportLocationDashboard: { method: 'GET', path: '/transport/location/dashboard' },

    TransportLocationPassengerCreate: {
        method: 'POST',
        path: '/transport/location/:LOCATIONID/passenger',
        params: { group: true },
    },
    TransportLocationPassengerUpdate: {
        method: 'PUT',
        path: '/transport/location/:LOCATIONID/passenger/:ID',
        params: { group: true },
    },
    TransportLocationPassengerDelete: {
        method: 'DELETE',
        path: '/transport/location/:LOCATIONID/passenger/:ID',
        params: { group: true },
    },
    TransportLocationPassengerTransfer: {
        method: 'PATCH',
        path: '/transport/location/:LOCATIONID/passenger/:ID/transfer',
        params: { group: true },
    },

    TransportParkingList: { method: 'GET', path: '/transport/parking', params: { query: false, page: false } },
    TransportParkingFull: { method: 'GET', path: '/transport/parking/full' },
    TransportParkingInfo: { method: 'GET', path: '/transport/parking/:ID' },
    TransportParkingCreate: { method: 'POST', path: '/transport/parking' },
    TransportParkingUpdate: { method: 'PUT', path: '/transport/parking/:ID' },
    TransportParkingDelete: { method: 'DELETE', path: '/transport/parking/:ID' },
    TransportParkingStatus: { method: 'PATCH', path: '/transport/parking/:ID/status' },
    TransportParkingMap: { method: 'GET', path: '/transport/parking/map' },
    TransportParkingDashboard: { method: 'GET', path: '/transport/parking/dashboard' },

    TransportParkingVehicleCreate: { method: 'POST', path: '/transport/parking/:PARKINGID/vehicle' },
    TransportParkingVehicleUpdate: { method: 'PUT', path: '/transport/parking/:PARKINGID/vehicle/:ID' },
    TransportParkingVehicleDelete: { method: 'DELETE', path: '/transport/parking/:PARKINGID/vehicle/:ID' },
    TransportParkingVehicleTransfer: { method: 'PATCH', path: '/transport/parking/:PARKINGID/vehicle/:ID/transfer' },

    TransportStationCalculate: { method: 'POST', path: '/transport/station/calculate' },
    TransportStationList: { method: 'GET', path: '/transport/station', params: { query: false, page: false } },
    TransportStationFull: { method: 'GET', path: '/transport/station/full' },
    TransportStationInfo: { method: 'GET', path: '/transport/station/:ID' },
    TransportStationCreate: { method: 'POST', path: '/transport/station' },
    TransportStationUpdate: { method: 'PUT', path: '/transport/station/:ID' },
    TransportStationDelete: { method: 'DELETE', path: '/transport/station/:ID' },
    TransportStationDistance: { method: 'PATCH', path: '/transport/station/:ID/distance' },
    TransportStationCopy: { method: 'PATCH', path: '/transport/station/:ID/copy' },

    TransportRouteCalculate: { method: 'POST', path: '/transport/route/calculate' },
    TransportRouteSave: { method: 'POST', path: '/transport/route/save' },
    TransportRouteList: { method: 'GET', path: '/transport/route', params: { query: false, page: false } },
    TransportRouteInfo: { method: 'GET', path: '/transport/route/:ID' },
    TransportRouteCreate: { method: 'POST', path: '/transport/route' },
    TransportRouteUpdate: { method: 'PUT', path: '/transport/route/:ID' },
    TransportRouteDelete: { method: 'DELETE', path: '/transport/route/:ID' },
    TransportRouteAttach: { method: 'PATCH', path: '/transport/route/:ID/attach' },
    TransportRouteEdit: { method: 'PATCH', path: '/transport/route/:ID/edit' },
    TransportRouteCopy: { method: 'PATCH', path: '/transport/route/:ID/copy' },
    TransportRouteReverse: { method: 'PATCH', path: '/transport/route/:ID/reverse' },
    TransportRouteColor: { method: 'PATCH', path: '/transport/route/:ID/color' },
    TransportRouteFinal: { method: 'PATCH', path: '/transport/route/:ID/final' },
    TransportRouteDashboard: { method: 'GET', path: '/transport/route/dashboard' },

    TransportImportCreate: { method: 'POST', path: '/transport/import' },
    TransportImportSave: { method: 'PATCH', path: '/transport/import' },

    TransportFinal: { method: 'GET', path: '/transport/final' },
};
