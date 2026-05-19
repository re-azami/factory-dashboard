import { IApiInfo } from '../api.interface';

export type ApiLaboratoryTypes =
    // ACTIVE
    | 'LaboratoryActiveCargo'
    // CARGO
    | 'LaboratoryCargoList'
    | 'LaboratoryCargoInfo'
    | 'LaboratoryCargoCreate'
    | 'LaboratoryCargoUpdate'
    | 'LaboratoryCargoDelete'
    | 'LaboratoryCargoStatus'
    | 'LaboratoryCargoShare'
    | 'LaboratoryCargoMixedCreate'
    | 'LaboratoryCargoMixedUpdate'
    | 'LaboratoryCargoMoveInfo'
    | 'LaboratoryCargoMoveSave'
    // STANDARD
    | 'LaboratoryStandardCreate'
    | 'LaboratoryStandardCurrent'
    // CRUSHER
    | 'LaboratoryCrusherList'
    | 'LaboratoryCrusherInfo'
    | 'LaboratoryCrusherData'
    | 'LaboratoryCrusherCargo'
    | 'LaboratoryCrusherCreate'
    | 'LaboratoryCrusherUpdate'
    | 'LaboratoryCrusherDelete'
    | 'LaboratoryCrusherLog'
    | 'LaboratoryCrusherTestFe'
    | 'LaboratoryCrusherTestFeO'
    | 'LaboratoryCrusherTestGrind'
    | 'LaboratoryCrusherTestMoisture'
    | 'LaboratoryCrusherTestSulphur'
    | 'LaboratoryCrusherTestDelete'
    // KHATKA
    | 'LaboratoryKhatkaList'
    | 'LaboratoryKhatkaInfo'
    | 'LaboratoryKhatkaData'
    | 'LaboratoryKhatkaCargo'
    | 'LaboratoryKhatkaCreate'
    | 'LaboratoryKhatkaUpdate'
    | 'LaboratoryKhatkaDelete'
    | 'LaboratoryKhatkaLog'
    | 'LaboratoryKhatkaTestFe'
    | 'LaboratoryKhatkaTestFeO'
    | 'LaboratoryKhatkaTestGrind'
    | 'LaboratoryKhatkaTestMoisture'
    | 'LaboratoryKhatkaTestSulphur'
    | 'LaboratoryKhatkaTestDelete'
    // BLAINE
    | 'LaboratoryBlaineList'
    | 'LaboratoryBlaineCreate'
    | 'LaboratoryBlaineUpdate'
    | 'LaboratoryBlaineDelete'
    | 'LaboratoryBlaineLog'
    // DAVIS
    | 'LaboratoryDavisList'
    | 'LaboratoryDavisInfo'
    | 'LaboratoryDavisCreate'
    | 'LaboratoryDavisUpdate'
    | 'LaboratoryDavisDelete'
    | 'LaboratoryDavisLog'
    // SOLID
    | 'LaboratorySolidList'
    | 'LaboratorySolidInfo'
    | 'LaboratorySolidCreate'
    | 'LaboratorySolidUpdate'
    | 'LaboratorySolidDelete'
    | 'LaboratorySolidLog'
    | 'LaboratorySolidTestCreate'
    | 'LaboratorySolidTestUpdate'
    | 'LaboratorySolidTestDelete'
    // LOAD
    | 'LaboratoryLoadList'
    | 'LaboratoryLoadInfo'
    | 'LaboratoryLoadData'
    | 'LaboratoryLoadCargo'
    | 'LaboratoryLoadUpdate'
    | 'LaboratoryLoadClear'
    | 'LaboratoryLoadLog'
    // MISC
    | 'LaboratoryMiscList'
    | 'LaboratoryMiscInfo'
    | 'LaboratoryMiscCreate'
    | 'LaboratoryMiscUpdate'
    | 'LaboratoryMiscDelete'
    // SUPPLEMENTARY
    | 'LaboratorySupplementaryList'
    | 'LaboratorySupplementaryInfo'
    | 'LaboratorySupplementaryCreate'
    | 'LaboratorySupplementaryUpdate'
    | 'LaboratorySupplementaryDelete'
    | 'LaboratorySupplementaryDownload'
    | 'LaboratorySupplementaryTestList'
    | 'LaboratorySupplementaryTestInfo'
    | 'LaboratorySupplementaryTestCreate'
    | 'LaboratorySupplementaryTestUpdate'
    | 'LaboratorySupplementaryTestDelete'
    // DASHBOARD
    | 'LaboratoryDashboardCount'
    | 'LaboratoryDashboardDaily'
    // DAILY
    | 'LaboratoryDailyCrusher'
    | 'LaboratoryDailyKhatka'
    | 'LaboratoryDailyBlaine'
    | 'LaboratoryDailyDavis'
    | 'LaboratoryDailySolid'
    | 'LaboratoryDailyLoad'
    | 'LaboratoryDailyDownload'
    // REPORT
    | 'LaboratoryReportAverage'
    | 'LaboratoryReportCrusherLocation'
    | 'LaboratoryReportCrusher'
    | 'LaboratoryReportKhatkaLocation'
    | 'LaboratoryReportKhatka'
    | 'LaboratoryReportLoad'
    // EXPORT
    | 'LaboratoryExportCrusherCargo'
    | 'LaboratoryExportCrusherLocation'
    | 'LaboratoryExportKhatkaCargo'
    | 'LaboratoryExportKhatkaLocation'
    | 'LaboratoryExportLoad';

export const ApiLaboratoryTypesInfo: { [key in ApiLaboratoryTypes]: IApiInfo } = {
    LaboratoryActiveCargo: { method: 'GET', path: '/laboratory/active/cargo' },

    LaboratoryCargoList: { method: 'GET', path: '/laboratory/cargo', params: { status: false, query: false, page: false } },
    LaboratoryCargoInfo: { method: 'GET', path: '/laboratory/cargo/:ID' },
    LaboratoryCargoCreate: { method: 'POST', path: '/laboratory/cargo' },
    LaboratoryCargoUpdate: { method: 'PUT', path: '/laboratory/cargo/:ID' },
    LaboratoryCargoDelete: { method: 'DELETE', path: '/laboratory/cargo/:ID' },
    LaboratoryCargoStatus: { method: 'PATCH', path: '/laboratory/cargo/:ID/status' },
    LaboratoryCargoShare: { method: 'POST', path: '/laboratory/cargo/share' },
    LaboratoryCargoMixedCreate: { method: 'POST', path: '/laboratory/cargo/mixed' },
    LaboratoryCargoMixedUpdate: { method: 'PUT', path: '/laboratory/cargo/:ID/mixed' },
    LaboratoryCargoMoveInfo: { method: 'GET', path: '/laboratory/cargo/:ID/move' },
    LaboratoryCargoMoveSave: { method: 'POST', path: '/laboratory/cargo/:ID/move' },

    LaboratoryStandardCreate: { method: 'POST', path: '/laboratory/standard' },
    LaboratoryStandardCurrent: { method: 'GET', path: '/laboratory/standard' },

    LaboratoryCrusherList: {
        method: 'GET',
        path: '/laboratory/crusher',
        params: { line: false, cargo: false, date: false, page: false },
    },
    LaboratoryCrusherInfo: { method: 'GET', path: '/laboratory/crusher/:ID' },
    LaboratoryCrusherData: { method: 'GET', path: '/laboratory/crusher/data' },
    LaboratoryCrusherCargo: {
        method: 'GET',
        path: '/laboratory/crusher/cargo',
        params: { party: false, shipment: false, page: false },
    },
    LaboratoryCrusherCreate: { method: 'POST', path: '/laboratory/crusher' },
    LaboratoryCrusherUpdate: { method: 'PUT', path: '/laboratory/crusher/:ID' },
    LaboratoryCrusherDelete: { method: 'DELETE', path: '/laboratory/crusher/:ID' },
    LaboratoryCrusherLog: { method: 'GET', path: '/laboratory/crusher/:ID/log' },
    LaboratoryCrusherTestFe: { method: 'PATCH', path: '/laboratory/crusher/:ID/fe' },
    LaboratoryCrusherTestFeO: { method: 'PATCH', path: '/laboratory/crusher/:ID/feo' },
    LaboratoryCrusherTestGrind: { method: 'PATCH', path: '/laboratory/crusher/:ID/grind' },
    LaboratoryCrusherTestMoisture: { method: 'PATCH', path: '/laboratory/crusher/:ID/moisture' },
    LaboratoryCrusherTestSulphur: { method: 'PATCH', path: '/laboratory/crusher/:ID/sulphur' },
    LaboratoryCrusherTestDelete: { method: 'DELETE', path: '/laboratory/crusher/:ID/:TEST/:RESULT' },

    LaboratoryKhatkaList: {
        method: 'GET',
        path: '/laboratory/khatka',
        params: { line: false, cargo: false, date: false, page: false },
    },
    LaboratoryKhatkaInfo: { method: 'GET', path: '/laboratory/khatka/:ID' },
    LaboratoryKhatkaData: { method: 'GET', path: '/laboratory/khatka/data' },
    LaboratoryKhatkaCargo: {
        method: 'GET',
        path: '/laboratory/khatka/cargo',
        params: { party: false, shipment: false, page: false },
    },
    LaboratoryKhatkaCreate: { method: 'POST', path: '/laboratory/khatka' },
    LaboratoryKhatkaUpdate: { method: 'PUT', path: '/laboratory/khatka/:ID' },
    LaboratoryKhatkaDelete: { method: 'DELETE', path: '/laboratory/khatka/:ID' },
    LaboratoryKhatkaLog: { method: 'GET', path: '/laboratory/khatka/:ID/log' },
    LaboratoryKhatkaTestFe: { method: 'PATCH', path: '/laboratory/khatka/:ID/fe' },
    LaboratoryKhatkaTestFeO: { method: 'PATCH', path: '/laboratory/khatka/:ID/feo' },
    LaboratoryKhatkaTestGrind: { method: 'PATCH', path: '/laboratory/khatka/:ID/grind' },
    LaboratoryKhatkaTestMoisture: { method: 'PATCH', path: '/laboratory/khatka/:ID/moisture' },
    LaboratoryKhatkaTestSulphur: { method: 'PATCH', path: '/laboratory/khatka/:ID/sulphur' },
    LaboratoryKhatkaTestDelete: { method: 'DELETE', path: '/laboratory/khatka/:ID/:TEST/:RESULT' },

    LaboratoryBlaineList: { method: 'GET', path: '/laboratory/blaine', params: { line: false, cargo: false, page: false } },
    LaboratoryBlaineCreate: { method: 'POST', path: '/laboratory/blaine' },
    LaboratoryBlaineUpdate: { method: 'PUT', path: '/laboratory/blaine/:ID' },
    LaboratoryBlaineDelete: { method: 'DELETE', path: '/laboratory/blaine/:ID' },
    LaboratoryBlaineLog: { method: 'GET', path: '/laboratory/blaine/:ID/log' },

    LaboratoryDavisList: { method: 'GET', path: '/laboratory/davis', params: { line: false, cargo: false, page: false } },
    LaboratoryDavisInfo: { method: 'GET', path: '/laboratory/davis/:ID' },
    LaboratoryDavisCreate: { method: 'POST', path: '/laboratory/davis' },
    LaboratoryDavisUpdate: { method: 'PUT', path: '/laboratory/davis/:ID' },
    LaboratoryDavisDelete: { method: 'DELETE', path: '/laboratory/davis/:ID' },
    LaboratoryDavisLog: { method: 'GET', path: '/laboratory/davis/:ID/log' },

    LaboratorySolidList: {
        method: 'GET',
        path: '/laboratory/solid',
        params: { line: false, cargo: false, date: false, page: false },
    },
    LaboratorySolidInfo: { method: 'GET', path: '/laboratory/solid/:ID' },
    LaboratorySolidCreate: { method: 'POST', path: '/laboratory/solid' },
    LaboratorySolidUpdate: { method: 'PUT', path: '/laboratory/solid/:ID' },
    LaboratorySolidDelete: { method: 'DELETE', path: '/laboratory/solid/:ID' },
    LaboratorySolidLog: { method: 'GET', path: '/laboratory/solid/:ID/log' },
    LaboratorySolidTestCreate: { method: 'POST', path: '/laboratory/solid/:ID/test' },
    LaboratorySolidTestUpdate: { method: 'PUT', path: '/laboratory/solid/:ID/test' },
    LaboratorySolidTestDelete: { method: 'DELETE', path: '/laboratory/solid/:ID/test/:TEST' },

    LaboratoryLoadList: {
        method: 'GET',
        path: '/laboratory/load',
        params: { party: false, shipment: false, date: false, page: false },
    },
    LaboratoryLoadInfo: { method: 'GET', path: '/laboratory/load/:ID' },
    LaboratoryLoadData: { method: 'GET', path: '/laboratory/load/data' },
    LaboratoryLoadCargo: {
        method: 'GET',
        path: '/laboratory/load/cargo',
        params: { party: false, shipment: false, page: false },
    },
    LaboratoryLoadUpdate: { method: 'PUT', path: '/laboratory/load/:ID' },
    LaboratoryLoadClear: { method: 'PATCH', path: '/laboratory/load/:ID/clear' },
    LaboratoryLoadLog: { method: 'GET', path: '/laboratory/load/:ID/log' },

    LaboratoryMiscList: { method: 'GET', path: '/laboratory/misc', params: { page: false } },
    LaboratoryMiscInfo: { method: 'GET', path: '/laboratory/misc/:ID' },
    LaboratoryMiscCreate: { method: 'POST', path: '/laboratory/misc' },
    LaboratoryMiscUpdate: { method: 'PUT', path: '/laboratory/misc/:ID' },
    LaboratoryMiscDelete: { method: 'DELETE', path: '/laboratory/misc/:ID' },

    LaboratorySupplementaryList: { method: 'GET', path: '/laboratory/supplementary', params: { page: false } },
    LaboratorySupplementaryInfo: { method: 'GET', path: '/laboratory/supplementary/:ID' },
    LaboratorySupplementaryCreate: { method: 'POST', path: '/laboratory/supplementary' },
    LaboratorySupplementaryUpdate: { method: 'PUT', path: '/laboratory/supplementary/:ID' },
    LaboratorySupplementaryDelete: { method: 'DELETE', path: '/laboratory/supplementary/:ID' },
    LaboratorySupplementaryDownload: { method: 'POST', path: '/laboratory/supplementary/download' },
    LaboratorySupplementaryTestList: { method: 'GET', path: '/laboratory/supplementary/:SUPPLEMENTARYID/test' },
    LaboratorySupplementaryTestInfo: { method: 'GET', path: '/laboratory/supplementary/:SUPPLEMENTARYID/test/:ID' },
    LaboratorySupplementaryTestCreate: { method: 'POST', path: '/laboratory/supplementary/:SUPPLEMENTARYID/test' },
    LaboratorySupplementaryTestUpdate: { method: 'PUT', path: '/laboratory/supplementary/:SUPPLEMENTARYID/test/:ID' },
    LaboratorySupplementaryTestDelete: { method: 'DELETE', path: '/laboratory/supplementary/:SUPPLEMENTARYID/test/:ID' },

    LaboratoryDashboardCount: { method: 'GET', path: '/laboratory/dashboard/count' },
    LaboratoryDashboardDaily: { method: 'GET', path: '/laboratory/dashboard/daily', params: { date: true } },

    LaboratoryDailyCrusher: { method: 'GET', path: '/laboratory/daily/crusher', params: { date: true } },
    LaboratoryDailyKhatka: { method: 'GET', path: '/laboratory/daily/khatka', params: { date: true } },
    LaboratoryDailyBlaine: { method: 'GET', path: '/laboratory/daily/blaine', params: { date: true } },
    LaboratoryDailyDavis: { method: 'GET', path: '/laboratory/daily/davis', params: { date: true } },
    LaboratoryDailySolid: { method: 'GET', path: '/laboratory/daily/solid', params: { date: true } },
    LaboratoryDailyLoad: { method: 'GET', path: '/laboratory/daily/load', params: { date: true } },
    LaboratoryDailyDownload: { method: 'POST', path: '/laboratory/daily/download', params: { type: false } },

    LaboratoryReportAverage: {
        method: 'GET',
        path: '/laboratory/report/average',
        params: { from: true, to: true, test: true },
    },
    LaboratoryReportCrusherLocation: {
        method: 'GET',
        path: '/laboratory/report/crusher/location',
        params: { from: true, to: true, crusher: true },
    },
    LaboratoryReportCrusher: { method: 'GET', path: '/laboratory/report/crusher/:CARGOID' },
    LaboratoryReportKhatkaLocation: {
        method: 'GET',
        path: '/laboratory/report/khatka/location',
        params: { from: true, to: true, khatka: true },
    },
    LaboratoryReportKhatka: { method: 'GET', path: '/laboratory/report/khatka/:CARGOID' },
    LaboratoryReportLoad: { method: 'GET', path: '/laboratory/report/load/:CARGOID' },

    LaboratoryExportCrusherCargo: { method: 'POST', path: '/laboratory/export/crusher/:CARGOID' },
    LaboratoryExportCrusherLocation: { method: 'POST', path: '/laboratory/export/crusher/location' },
    LaboratoryExportKhatkaCargo: { method: 'POST', path: '/laboratory/export/khatka/:CARGOID' },
    LaboratoryExportKhatkaLocation: { method: 'POST', path: '/laboratory/export/khatka/location' },
    LaboratoryExportLoad: { method: 'POST', path: '/laboratory/export/load/:CARGOID' },
};
