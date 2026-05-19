import { IApiInfo } from '../api.interface';

export type ApiLogTypes =
    | 'LogDatabase'
    | 'LogMonthly'
    | 'LogApp'
    | 'LogResponse'
    | 'LogException'
    | 'LogContainer'
    // SMS
    | 'LogSmsType'
    | 'LogSmsList'
    // VERSION
    | 'LogVersionList'
    | 'LogVersionApp';

export const ApiLogTypesInfo: { [key in ApiLogTypes]: IApiInfo } = {
    LogDatabase: { method: 'GET', path: '/log/database' },
    LogMonthly: { method: 'GET', path: '/log/monthly', params: { date: true } },
    LogApp: { method: 'GET', path: '/log/app', params: { app: true, from: true, to: true } },
    LogResponse: { method: 'GET', path: '/log/response', params: { app: false, method: false, page: false } },
    LogException: { method: 'GET', path: '/log/exception', params: { app: false, method: false, page: false } },
    LogContainer: { method: 'GET', path: '/log/container', params: { page: false } },

    LogSmsType: { method: 'GET', path: '/log/sms/type' },
    LogSmsList: { method: 'GET', path: '/log/sms/list', params: { type: false, status: false, page: false } },

    LogVersionList: { method: 'GET', path: '/log/version/list', params: { app: false, user: false, page: false } },
    LogVersionApp: { method: 'GET', path: '/log/version/app', params: { app: true } },
};
