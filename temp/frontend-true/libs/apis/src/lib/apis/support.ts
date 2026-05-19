import { IApiInfo } from '../api.interface';

export type ApiSupportTypes =
    // TICKET USER
    | 'SupportTicketUserList'
    | 'SupportTicketUserInfo'
    | 'SupportTicketUserCreate'
    | 'SupportTicketUserReply'
    | 'SupportTicketUserDelete'
    // TICKET
    | 'SupportTicketList'
    | 'SupportTicketInfo'
    | 'SupportTicketReply'
    | 'SupportTicketClose'
    | 'SupportTicketDashboard'
    // NOTIFICATION USER
    | 'SupportNotificationUserList'
    | 'SupportNotificationUserView'
    // NOTIFICATION
    | 'SupportNotificationList'
    | 'SupportNotificationCreate'
    | 'SupportNotificationUpdate'
    | 'SupportNotificationDelete'
    | 'SupportNotificationApp';

export const ApiSupportTypesInfo: { [key in ApiSupportTypes]: IApiInfo } = {
    SupportTicketUserList: { method: 'GET', path: '/support/ticket-user', params: { app: true, page: false } },
    SupportTicketUserInfo: { method: 'GET', path: '/support/ticket-user/:ID', params: { app: true } },
    SupportTicketUserCreate: { method: 'POST', path: '/support/ticket-user' },
    SupportTicketUserReply: { method: 'POST', path: '/support/ticket-user/:ID/reply', params: { app: true } },
    SupportTicketUserDelete: { method: 'DELETE', path: '/support/ticket-user/:ID', params: { app: true } },

    SupportTicketList: { method: 'GET', path: '/support/ticket', params: { app: false, status: false, page: false } },
    SupportTicketInfo: { method: 'GET', path: '/support/ticket/:ID' },
    SupportTicketReply: { method: 'POST', path: '/support/ticket/:ID/reply' },
    SupportTicketClose: { method: 'PATCH', path: '/support/ticket/:ID/close' },
    SupportTicketDashboard: { method: 'GET', path: '/support/ticket/dashboard' },

    SupportNotificationUserList: { method: 'GET', path: '/support/notification-user', params: { app: true } },
    SupportNotificationUserView: { method: 'PATCH', path: '/support/notification-user/:ID/view', params: { app: true } },

    SupportNotificationList: { method: 'GET', path: '/support/notification', params: { app: false, page: false } },
    SupportNotificationCreate: { method: 'POST', path: '/support/notification' },
    SupportNotificationUpdate: { method: 'PUT', path: '/support/notification/:ID' },
    SupportNotificationDelete: { method: 'DELETE', path: '/support/notification/:ID' },
    SupportNotificationApp: { method: 'PATCH', path: '/support/notification/:ID/app' },
};
