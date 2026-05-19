export type SupportTicket = 'PENDING' | 'ANSWERED';

interface ISupportTicket {
    title: string;
    icon: string;
    color: 'primary' | 'accent' | 'warn';
}

export const SupportTicketInfo: { [key in SupportTicket]: ISupportTicket } = {
    PENDING: { title: 'در انتظار پاسخ', icon: 'pending', color: 'accent' },
    ANSWERED: { title: 'پاسخ داده شده', icon: 'task_alt', color: 'primary' },
};

export const SupportTicketList: SupportTicket[] = Object.keys(SupportTicketInfo) as SupportTicket[];
