import { IApiInfo } from '../api.interface';

export type ApiUserTypes =
    | 'UserInfo'
    | 'UserSignin'
    | 'UserSignout'
    | 'UserUpdate'
    | 'UserPassword'
    | 'UserRetrievalRequest'
    | 'UserRetrievalResend'
    | 'UserRetrievalConfirm'
    // ALERT
    | 'UserAlertActive'
    | 'UserAlertList'
    // PERSON
    | 'UserPersonList'
    | 'UserPersonFull'
    | 'UserPersonInfo'
    | 'UserPersonCreate'
    | 'UserPersonAccess'
    | 'UserPersonPassword'
    | 'UserPersonCode'
    | 'UserPersonStatus'
    // ADMIN
    | 'UserAdminList'
    | 'UserAdminCreate'
    | 'UserAdminUpdate'
    | 'UserAdminDelete';

export const ApiUserTypesInfo: { [key in ApiUserTypes]: IApiInfo } = {
    UserInfo: { method: 'GET', path: '/user' },
    UserSignin: { method: 'POST', path: '/user/signin' },
    UserSignout: { method: 'POST', path: '/user/signout' },
    UserUpdate: { method: 'PUT', path: '/user' },
    UserPassword: { method: 'PATCH', path: '/user/password' },
    UserRetrievalRequest: { method: 'POST', path: '/user/retrieval/request' },
    UserRetrievalResend: { method: 'POST', path: '/user/retrieval/resend' },
    UserRetrievalConfirm: { method: 'POST', path: '/user/retrieval/confirm' },

    UserAlertActive: { method: 'GET', path: '/user/alert/active' },
    UserAlertList: { method: 'GET', path: '/user/alert', params: { type: false, app: false, page: false } },

    UserPersonList: { method: 'GET', path: '/user/person', params: { app: false, query: false, page: false } },
    UserPersonFull: { method: 'GET', path: '/user/person/full' },
    UserPersonInfo: { method: 'GET', path: '/user/person/:ID' },
    UserPersonCreate: { method: 'POST', path: '/user/person' },
    UserPersonAccess: { method: 'PATCH', path: '/user/person/:ID/access' },
    UserPersonPassword: { method: 'PATCH', path: '/user/person/:ID/password' },
    UserPersonCode: { method: 'PATCH', path: '/user/person/:ID/code' },
    UserPersonStatus: { method: 'PATCH', path: '/user/person/:ID/status' },

    UserAdminList: { method: 'GET', path: '/user/admin', params: { app: false, query: false, page: false } },
    UserAdminCreate: { method: 'POST', path: '/user/admin' },
    UserAdminUpdate: { method: 'PUT', path: '/user/admin/:ID' },
    UserAdminDelete: { method: 'DELETE', path: '/user/admin/:ID' },
};
