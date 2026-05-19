import { IApiInfo } from '../api.interface';

export type ApiLoadTypes =
    // ACTIVE
    | 'LoadActiveParty'
    | 'LoadActiveShipment'
    | 'LoadActiveTransporter'
    | 'LoadActiveOwner'
    | 'LoadActiveCargo'
    // PARTY
    | 'LoadPartyList'
    | 'LoadPartyInfo'
    | 'LoadPartyCreate'
    | 'LoadPartyUpdate'
    | 'LoadPartyDelete'
    | 'LoadPartyStatus'
    // SHIPMENT
    | 'LoadShipmentList'
    | 'LoadShipmentCreate'
    | 'LoadShipmentUpdate'
    | 'LoadShipmentDelete'
    | 'LoadShipmentStatus'
    // MISC
    | 'LoadMiscList'
    | 'LoadMiscCreate'
    | 'LoadMiscUpdate'
    | 'LoadMiscDelete'
    | 'LoadMiscStatus'
    // TRANSPORTER
    | 'LoadTransporterList'
    | 'LoadTransporterInfo'
    | 'LoadTransporterCreate'
    | 'LoadTransporterUpdate'
    | 'LoadTransporterDelete'
    | 'LoadTransporterStatus'
    // CARGO
    | 'LoadCargoList'
    | 'LoadCargoInfo'
    | 'LoadCargoCreate'
    | 'LoadCargoUpdate'
    | 'LoadCargoUpdatePayment'
    | 'LoadCargoStatus'
    | 'LoadCargoDelete'
    | 'LoadCargoDraft'
    | 'LoadCargoSettingCreate'
    | 'LoadCargoSettingDelete'
    | 'LoadCargoActivationList'
    | 'LoadCargoActivationCreate'
    | 'LoadCargoActivationDelete'
    | 'LoadCargoDeactivation'
    | 'LoadCargoLetterUpload'
    | 'LoadCargoLetterDelete'
    | 'LoadCargoTruckList'
    | 'LoadCargoTruckCreate'
    | 'LoadCargoTruckDelete'
    | 'LoadCargoGroupList'
    | 'LoadCargoGroupCreate'
    | 'LoadCargoGroupUpdate'
    | 'LoadCargoGroupDelete'
    // OWNER
    | 'LoadOwnerList'
    | 'LoadOwnerInfo'
    | 'LoadOwnerCreate'
    | 'LoadOwnerUpdate'
    | 'LoadOwnerDelete'
    | 'LoadOwnerStatus'
    // TRUCK
    | 'LoadTruckList'
    | 'LoadTruckInfo'
    | 'LoadTruckCreate'
    | 'LoadTruckUpdate'
    | 'LoadTruckUpdatePlate'
    | 'LoadTruckUpdateOwner'
    | 'LoadTruckUpdateDriver'
    | 'LoadTruckDelete'
    | 'LoadTruckStatus'
    | 'LoadTruckDraft'
    | 'LoadTruckCargo'
    | 'LoadTruckPlate'
    // ATTACHMENT
    | 'LoadAttachmentList'
    | 'LoadAttachmentCreate'
    | 'LoadAttachmentUpdate'
    | 'LoadAttachmentDelete'
    // CHECKOUT
    | 'LoadCheckoutList'
    | 'LoadCheckoutCreate'
    | 'LoadCheckoutDelete'
    | 'LoadCheckoutPayment'
    | 'LoadCheckoutCargo'
    | 'LoadCheckoutDownload'
    // SETTING
    | 'LoadSettingInfo'
    | 'LoadSettingCreate'
    // REPRT
    | 'LoadReportActive'
    | 'LoadReportDraft'
    | 'LoadReportPartyInfo'
    | 'LoadReportPartyDraft'
    | 'LoadReportShipmentInfo'
    | 'LoadReportShipmentDraft'
    | 'LoadReportTransporterInfo'
    | 'LoadReportTransporterDraft'
    | 'LoadReportCargoInfo'
    | 'LoadReportCargoDraft'
    | 'LoadReportCargoMonth'
    | 'LoadReportCargoChart'
    | 'LoadReportCargoAttachment'
    | 'LoadReportOwnerInfo'
    | 'LoadReportOwnerDraft'
    | 'LoadReportTruckInfo'
    | 'LoadReportTruckDraft'
    | 'LoadReportDailyTransporter'
    // EXPORT
    | 'LoadExportDraft'
    | 'LoadExportGroup'
    | 'LoadExportProceedingsTransporterList'
    | 'LoadExportProceedingsTransporter'
    | 'LoadExportProceedingsLoad'
    // LOG
    | 'LoadLogData'
    // DRAFT
    | 'LoadDraftCode'
    | 'LoadDraftInfo'
    | 'LoadDraftLog'
    | 'LoadDraftDaily'
    | 'LoadDraftActive'
    | 'LoadDraftFinished'
    | 'LoadDraftCanceled'
    | 'LoadDraftUpdated'
    | 'LoadDraftDownload'
    | 'LoadDraftAttachmentCreate'
    | 'LoadDraftAttachmentDelete'
    | 'LoadDraftUpdateCargo'
    | 'LoadDraftUpdatePlate'
    | 'LoadDraftUpdateTransporter'
    | 'LoadDraftUpdateWeight'
    | 'LoadDraftUpdateFinish'
    // DASHBOARD
    | 'LoadDashboardCargoType'
    | 'LoadDashboardFlow'
    | 'LoadDashboardCargo'
    | 'LoadDashboardChart'

    // FLOW
    | 'LoadFlowWeightPlate'
    | 'LoadFlowWeight'
    | 'LoadFlowPlate'
    | 'LoadFlowList'
    | 'LoadFlowCancel'
    | 'LoadFlowBulkCancel'
    // FLOW OUT
    | 'LoadFlowOutCreate'
    | 'LoadFlowOutWeightEmpty'
    | 'LoadFlowOutLoading'
    | 'LoadFlowOutWeightFull'
    | 'LoadFlowOutExit'
    // FLOW IN
    | 'LoadFlowInCreate'
    | 'LoadFlowInEnterMine'
    | 'LoadFlowInLoadingMine'
    | 'LoadFlowInExitMine'
    | 'LoadFlowInEnter'
    | 'LoadFlowInWeightFull'
    | 'LoadFlowInDischarge'
    | 'LoadFlowInWeightEmpty'
    | 'LoadFlowInExit'
    // FLOW BUY
    | 'LoadFlowBuyCreate'
    | 'LoadFlowBuyWeightFull'
    | 'LoadFlowBuyDischarge'
    | 'LoadFlowBuyWeightEmpty'
    | 'LoadFlowBuyExit'
    // FLOW SITE
    | 'LoadFlowSitePlate'
    | 'LoadFlowSiteWeight';

export const ApiLoadTypesInfo: { [key in ApiLoadTypes]: IApiInfo } = {
    LoadActiveParty: { method: 'GET', path: '/load/active/party', params: { cargo: false } },
    LoadActiveShipment: { method: 'GET', path: '/load/active/shipment' },
    LoadActiveTransporter: { method: 'GET', path: '/load/active/transporter' },
    LoadActiveOwner: { method: 'GET', path: '/load/active/owner' },
    LoadActiveCargo: { method: 'GET', path: '/load/active/cargo', params: { type: false } },

    LoadPartyList: {
        method: 'GET',
        path: '/load/party',
        params: { status: false, cargo: false, query: false, page: false },
    },
    LoadPartyInfo: { method: 'GET', path: '/load/party/:ID' },
    LoadPartyCreate: { method: 'POST', path: '/load/party' },
    LoadPartyUpdate: { method: 'PUT', path: '/load/party/:ID' },
    LoadPartyDelete: { method: 'DELETE', path: '/load/party/:ID' },
    LoadPartyStatus: { method: 'PATCH', path: '/load/party/:ID/status' },

    LoadShipmentList: { method: 'GET', path: '/load/shipment', params: { status: false, query: false, page: false } },
    LoadShipmentCreate: { method: 'POST', path: '/load/shipment' },
    LoadShipmentUpdate: { method: 'PUT', path: '/load/shipment/:ID' },
    LoadShipmentDelete: { method: 'DELETE', path: '/load/shipment/:ID' },
    LoadShipmentStatus: { method: 'PATCH', path: '/load/shipment/:ID/status' },

    LoadMiscList: { method: 'GET', path: '/load/misc', params: { status: false, query: false, page: false } },
    LoadMiscCreate: { method: 'POST', path: '/load/misc' },
    LoadMiscUpdate: { method: 'PUT', path: '/load/misc/:ID' },
    LoadMiscDelete: { method: 'DELETE', path: '/load/misc/:ID' },
    LoadMiscStatus: { method: 'PATCH', path: '/load/misc/:ID/status' },

    LoadTransporterList: { method: 'GET', path: '/load/transporter', params: { status: false, query: false, page: false } },
    LoadTransporterInfo: { method: 'GET', path: '/load/transporter/:ID' },
    LoadTransporterCreate: { method: 'POST', path: '/load/transporter' },
    LoadTransporterUpdate: { method: 'PUT', path: '/load/transporter/:ID' },
    LoadTransporterDelete: { method: 'DELETE', path: '/load/transporter/:ID' },
    LoadTransporterStatus: { method: 'PATCH', path: '/load/transporter/:ID/status' },

    LoadCargoList: {
        method: 'GET',
        path: '/load/cargo',
        params: { status: false, cargo: false, party: false, shipment: false, query: false, page: false },
    },
    LoadCargoInfo: { method: 'GET', path: '/load/cargo/:ID' },
    LoadCargoCreate: { method: 'POST', path: '/load/cargo' },
    LoadCargoUpdate: { method: 'PUT', path: '/load/cargo/:ID' },
    LoadCargoUpdatePayment: { method: 'PATCH', path: '/load/cargo/:ID/payment' },
    LoadCargoStatus: { method: 'PATCH', path: '/load/cargo/:ID/status' },
    LoadCargoDelete: { method: 'DELETE', path: '/load/cargo/:ID' },
    LoadCargoDraft: { method: 'GET', path: '/load/cargo/:ID/draft' },
    LoadCargoSettingCreate: { method: 'POST', path: '/load/cargo/:ID/setting' },
    LoadCargoSettingDelete: { method: 'DELETE', path: '/load/cargo/:ID/setting' },
    LoadCargoActivationList: { method: 'GET', path: '/load/cargo/:ID/activation' },
    LoadCargoActivationCreate: { method: 'POST', path: '/load/cargo/:ID/activation' },
    LoadCargoActivationDelete: { method: 'DELETE', path: '/load/cargo/:ID/activation' },
    LoadCargoDeactivation: { method: 'POST', path: '/load/cargo/:ID/deactivation' },
    LoadCargoLetterUpload: { method: 'POST', path: '/load/cargo/:ID/letter' },
    LoadCargoLetterDelete: { method: 'DELETE', path: '/load/cargo/:ID/letter' },
    LoadCargoTruckList: { method: 'GET', path: '/load/cargo/:ID/truck' },
    LoadCargoTruckCreate: { method: 'POST', path: '/load/cargo/:ID/truck' },
    LoadCargoTruckDelete: { method: 'DELETE', path: '/load/cargo/:ID/truck/:TRUCKID' },
    LoadCargoGroupList: { method: 'GET', path: '/load/cargo/:ID/group' },
    LoadCargoGroupCreate: { method: 'POST', path: '/load/cargo/:ID/group' },
    LoadCargoGroupUpdate: { method: 'PUT', path: '/load/cargo/:ID/group/:GROUPID' },
    LoadCargoGroupDelete: { method: 'DELETE', path: '/load/cargo/:ID/group/:GROUPID' },

    LoadOwnerList: { method: 'GET', path: '/load/owner', params: { status: false, query: false, page: false } },
    LoadOwnerInfo: { method: 'GET', path: '/load/owner/:ID' },
    LoadOwnerCreate: { method: 'POST', path: '/load/owner' },
    LoadOwnerUpdate: { method: 'PUT', path: '/load/owner/:ID' },
    LoadOwnerDelete: { method: 'DELETE', path: '/load/owner/:ID' },
    LoadOwnerStatus: { method: 'PATCH', path: '/load/owner/:ID/status' },

    LoadTruckList: { method: 'GET', path: '/load/truck', params: { status: false, owner: false, page: false } },
    LoadTruckInfo: { method: 'GET', path: '/load/truck/:ID' },
    LoadTruckCreate: { method: 'POST', path: '/load/truck' },
    LoadTruckUpdate: { method: 'PUT', path: '/load/truck/:ID' },
    LoadTruckUpdatePlate: { method: 'PATCH', path: '/load/truck/:ID/plate' },
    LoadTruckUpdateOwner: { method: 'PATCH', path: '/load/truck/:ID/owner' },
    LoadTruckUpdateDriver: { method: 'PATCH', path: '/load/truck/:ID/driver' },
    LoadTruckDelete: { method: 'DELETE', path: '/load/truck/:ID' },
    LoadTruckStatus: { method: 'PATCH', path: '/load/truck/:ID/status' },
    LoadTruckDraft: { method: 'GET', path: '/load/truck/:ID/draft' },
    LoadTruckCargo: { method: 'GET', path: '/load/truck/:ID/cargo' },
    LoadTruckPlate: { method: 'GET', path: '/load/truck/plate', params: { plate: true } },

    LoadAttachmentList: { method: 'GET', path: '/load/attachment', params: { attachment: true, data: true, page: false } },
    LoadAttachmentCreate: { method: 'POST', path: '/load/attachment' },
    LoadAttachmentUpdate: { method: 'PUT', path: '/load/attachment/:ID' },
    LoadAttachmentDelete: { method: 'DELETE', path: '/load/attachment/:ID', params: { attachment: true, data: true } },

    LoadCheckoutList: { method: 'GET', path: '/load/checkout', params: { page: false } },
    LoadCheckoutCreate: { method: 'POST', path: '/load/checkout' },
    LoadCheckoutDelete: { method: 'DELETE', path: '/load/checkout/:ID' },
    LoadCheckoutPayment: { method: 'PATCH', path: '/load/checkout/:ID/payment' },
    LoadCheckoutCargo: { method: 'GET', path: '/load/checkout/:ID/cargo' },
    LoadCheckoutDownload: { method: 'POST', path: '/load/checkout/:ID/download' },

    LoadSettingInfo: { method: 'GET', path: '/load/setting', params: { cargo: true } },
    LoadSettingCreate: { method: 'POST', path: '/load/setting' },

    LoadReportActive: { method: 'GET', path: '/load/report/active' },
    LoadReportDraft: { method: 'GET', path: '/load/report/draft', params: { from: true, to: true } },
    LoadReportPartyInfo: { method: 'GET', path: '/load/report/party/:ID/info' },
    LoadReportPartyDraft: { method: 'GET', path: '/load/report/party/:ID/draft', params: { from: true, to: true } },
    LoadReportShipmentInfo: { method: 'GET', path: '/load/report/shipment/:ID/info' },
    LoadReportShipmentDraft: { method: 'GET', path: '/load/report/shipment/:ID/draft', params: { from: true, to: true } },
    LoadReportTransporterInfo: { method: 'GET', path: '/load/report/transporter/:ID/info' },
    LoadReportTransporterDraft: {
        method: 'GET',
        path: '/load/report/transporter/:ID/draft',
        params: { from: true, to: true },
    },
    LoadReportCargoInfo: { method: 'GET', path: '/load/report/cargo/:ID/info' },
    LoadReportCargoDraft: { method: 'GET', path: '/load/report/cargo/:ID/draft', params: { from: true, to: true } },
    LoadReportCargoMonth: { method: 'GET', path: '/load/report/cargo/:ID/month' },
    LoadReportCargoChart: { method: 'GET', path: '/load/report/cargo/:ID/chart', params: { from: true, to: true } },
    LoadReportCargoAttachment: { method: 'GET', path: '/load/report/cargo/:ID/attachment' },
    LoadReportOwnerInfo: { method: 'GET', path: '/load/report/owner/:ID/info' },
    LoadReportOwnerDraft: { method: 'GET', path: '/load/report/owner/:ID/draft', params: { from: true, to: true } },
    LoadReportTruckInfo: { method: 'GET', path: '/load/report/truck/:ID/info' },
    LoadReportTruckDraft: { method: 'GET', path: '/load/report/truck/:ID/draft', params: { from: true, to: true } },
    LoadReportDailyTransporter: { method: 'GET', path: '/load/report/daily-transporter', params: { from: true, to: true } },

    LoadExportDraft: { method: 'POST', path: '/load/export/draft' },
    LoadExportGroup: { method: 'POST', path: '/load/export/group' },
    LoadExportProceedingsTransporterList: {
        method: 'GET',
        path: '/load/export/proceedings/transporter',
        params: { date: true },
    },
    LoadExportProceedingsTransporter: { method: 'POST', path: '/load/export/proceedings/transporter' },
    LoadExportProceedingsLoad: { method: 'POST', path: '/load/export/proceedings/load' },

    LoadLogData: { method: 'GET', path: '/load/log/data/:ID', params: { type: true } },

    LoadDraftCode: { method: 'GET', path: '/load/draft/code', params: { code: true } },
    LoadDraftInfo: { method: 'GET', path: '/load/draft/:ID' },
    LoadDraftLog: { method: 'GET', path: '/load/draft/:ID/log' },
    LoadDraftDaily: { method: 'GET', path: '/load/draft/daily' },
    LoadDraftActive: { method: 'GET', path: '/load/draft/active' },
    LoadDraftFinished: {
        method: 'GET',
        path: '/load/draft/finished',
        params: { type: false, plate: false, date: false, page: false },
    },
    LoadDraftCanceled: {
        method: 'GET',
        path: '/load/draft/canceled',
        params: { type: false, plate: false, date: false, page: false },
    },
    LoadDraftUpdated: {
        method: 'GET',
        path: '/load/draft/updated',
        params: { type: false, plate: false, date: false, page: false },
    },
    LoadDraftDownload: { method: 'GET', path: '/load/draft/download', params: { draft: true, page: true } },
    LoadDraftAttachmentCreate: { method: 'POST', path: '/load/draft/:ID/attachment' },
    LoadDraftAttachmentDelete: { method: 'DELETE', path: '/load/draft/:ID/attachment/:ATTACHMENTID' },
    LoadDraftUpdateCargo: { method: 'PATCH', path: '/load/draft/:ID/cargo' },
    LoadDraftUpdatePlate: { method: 'PATCH', path: '/load/draft/:ID/plate' },
    LoadDraftUpdateTransporter: { method: 'PATCH', path: '/load/draft/:ID/transporter' },
    LoadDraftUpdateWeight: { method: 'PATCH', path: '/load/draft/:ID/weight' },
    LoadDraftUpdateFinish: { method: 'PATCH', path: '/load/draft/:ID/finish' },

    LoadDashboardCargoType: { method: 'GET', path: '/load/dashboard/cargo-type', params: { period: true } },
    LoadDashboardFlow: { method: 'GET', path: '/load/dashboard/flow' },
    LoadDashboardCargo: { method: 'GET', path: '/load/dashboard/cargo' },
    LoadDashboardChart: { method: 'GET', path: '/load/dashboard/chart' },

    LoadFlowWeightPlate: { method: 'POST', path: '/load/flow/weight-plate' },
    LoadFlowWeight: { method: 'POST', path: '/load/flow/weight' },
    LoadFlowPlate: { method: 'GET', path: '/load/flow/plate', params: { plate: true } },
    LoadFlowList: { method: 'GET', path: '/load/flow', params: { flow: true } },
    LoadFlowCancel: { method: 'PATCH', path: '/load/flow/:ID/cancel' },
    LoadFlowBulkCancel: { method: 'PATCH', path: '/load/flow/bulk-cancel' },

    LoadFlowOutCreate: { method: 'POST', path: '/load/flow/out' },
    LoadFlowOutWeightEmpty: { method: 'PATCH', path: '/load/flow/out/:ID/weight-empty' },
    LoadFlowOutLoading: { method: 'PATCH', path: '/load/flow/out/:ID/loading' },
    LoadFlowOutWeightFull: { method: 'PATCH', path: '/load/flow/out/:ID/weight-full' },
    LoadFlowOutExit: { method: 'PATCH', path: '/load/flow/out/:ID/exit' },

    LoadFlowInCreate: { method: 'POST', path: '/load/flow/in' },
    LoadFlowInEnterMine: { method: 'PATCH', path: '/load/flow/in/:ID/enter-mine' },
    LoadFlowInLoadingMine: { method: 'PATCH', path: '/load/flow/in/:ID/loading-mine' },
    LoadFlowInExitMine: { method: 'PATCH', path: '/load/flow/in/:ID/exit-mine' },
    LoadFlowInEnter: { method: 'PATCH', path: '/load/flow/in/:ID/enter' },
    LoadFlowInWeightFull: { method: 'PATCH', path: '/load/flow/in/:ID/weight-full' },
    LoadFlowInDischarge: { method: 'PATCH', path: '/load/flow/in/:ID/discharge' },
    LoadFlowInWeightEmpty: { method: 'PATCH', path: '/load/flow/in/:ID/weight-empty' },
    LoadFlowInExit: { method: 'PATCH', path: '/load/flow/in/:ID/exit' },

    LoadFlowBuyCreate: { method: 'POST', path: '/load/flow/buy' },
    LoadFlowBuyWeightFull: { method: 'PATCH', path: '/load/flow/buy/:ID/weight-full' },
    LoadFlowBuyDischarge: { method: 'PATCH', path: '/load/flow/buy/:ID/discharge' },
    LoadFlowBuyWeightEmpty: { method: 'PATCH', path: '/load/flow/buy/:ID/weight-empty' },
    LoadFlowBuyExit: { method: 'PATCH', path: '/load/flow/buy/:ID/exit' },

    LoadFlowSitePlate: { method: 'GET', path: '/load/flow/site/plate', params: { plate: true } },
    LoadFlowSiteWeight: { method: 'POST', path: '/load/flow/site/weight' },
};
