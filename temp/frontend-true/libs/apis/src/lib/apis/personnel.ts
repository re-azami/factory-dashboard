import { IApiInfo } from '../api.interface';

export type ApiPersonnelTypes =
    // GROUP
    | 'PersonnelGroupList'
    | 'PersonnelGroupFull'
    | 'PersonnelGroupCreate'
    | 'PersonnelGroupUpdate'
    | 'PersonnelGroupDelete'
    | 'PersonnelGroupStatus'
    | 'PersonnelGroupOrder'
    // MEMBER
    | 'PersonnelMemberList'
    | 'PersonnelMemberInfo'
    | 'PersonnelMemberCode'
    | 'PersonnelMemberSearch'
    | 'PersonnelMemberCreate'
    | 'PersonnelMemberUpdate'
    | 'PersonnelMemberDelete'
    | 'PersonnelMemberImage'
    | 'PersonnelMemberLog'
    // EMPLOYEMENT
    | 'PersonnelMemberEmployementDate'
    | 'PersonnelMemberEmployementActive'
    | 'PersonnelMemberEmployementDeactive'
    | 'PersonnelMemberEmployementDelete'
    // MEMBER UPDATE
    | 'PersonnelMemberUpdateCode'
    | 'PersonnelMemberUpdateDepartment'
    | 'PersonnelMemberUpdatePosition'
    | 'PersonnelMemberUpdateEducation'
    // LOCATION
    | 'PersonnelLocationList'
    | 'PersonnelLocationCreate'
    | 'PersonnelLocationDelete'
    // DASHBOARD
    | 'PersonnelDashboardCount'
    // REPORT
    | 'PersonnelReportMember'
    // EXPORT
    | 'PersonnelExportMember';

export const ApiPersonnelTypesInfo: { [key in ApiPersonnelTypes]: IApiInfo } = {
    PersonnelGroupList: { method: 'GET', path: '/personnel/group', params: { type: true } },
    PersonnelGroupFull: { method: 'GET', path: '/personnel/group/full' },
    PersonnelGroupCreate: { method: 'POST', path: '/personnel/group' },
    PersonnelGroupUpdate: { method: 'PUT', path: '/personnel/group/:ID' },
    PersonnelGroupDelete: { method: 'DELETE', path: '/personnel/group/:ID' },
    PersonnelGroupStatus: { method: 'PATCH', path: '/personnel/group/:ID/status' },
    PersonnelGroupOrder: { method: 'PATCH', path: '/personnel/group/order' },

    PersonnelMemberList: {
        method: 'GET',
        path: '/personnel/member',
        params: { status: false, department: false, position: false, query: false, page: false },
    },
    PersonnelMemberInfo: { method: 'GET', path: '/personnel/member/:ID' },
    PersonnelMemberCode: { method: 'GET', path: '/personnel/member/code', params: { code: true } },
    PersonnelMemberSearch: { method: 'GET', path: '/personnel/member/search', params: { query: true } },
    PersonnelMemberCreate: { method: 'POST', path: '/personnel/member' },
    PersonnelMemberUpdate: { method: 'PUT', path: '/personnel/member/:ID' },
    PersonnelMemberDelete: { method: 'DELETE', path: '/personnel/member/:ID' },
    PersonnelMemberImage: { method: 'PATCH', path: '/personnel/member/:ID/image' },
    PersonnelMemberLog: { method: 'GET', path: '/personnel/member/:ID/log' },

    PersonnelMemberEmployementDate: { method: 'POST', path: '/personnel/member/:MEMBERID/employement/date' },
    PersonnelMemberEmployementActive: { method: 'POST', path: '/personnel/member/:MEMBERID/employement/active' },
    PersonnelMemberEmployementDeactive: { method: 'POST', path: '/personnel/member/:MEMBERID/employement/deactive' },
    PersonnelMemberEmployementDelete: { method: 'DELETE', path: '/personnel/member/:MEMBERID/employement/:ID' },

    PersonnelMemberUpdateCode: { method: 'PATCH', path: '/personnel/member/:ID/code' },
    PersonnelMemberUpdateDepartment: { method: 'PATCH', path: '/personnel/member/:ID/department' },
    PersonnelMemberUpdatePosition: { method: 'PATCH', path: '/personnel/member/:ID/position' },
    PersonnelMemberUpdateEducation: { method: 'PATCH', path: '/personnel/member/:ID/education' },

    PersonnelLocationList: { method: 'GET', path: '/personnel/location' },
    PersonnelLocationCreate: { method: 'PATCH', path: '/personnel/location/:MEMBERID' },
    PersonnelLocationDelete: { method: 'DELETE', path: '/personnel/location/:MEMBERID' },

    PersonnelDashboardCount: { method: 'GET', path: '/personnel/dashboard/count' },

    PersonnelReportMember: { method: 'GET', path: '/personnel/report/member' },

    PersonnelExportMember: { method: 'POST', path: '/personnel/export/member' },
};
