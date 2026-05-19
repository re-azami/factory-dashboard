export type SupportRequest = 'FRATURE' | 'CHANGE' | 'BUG' | 'HELP' | 'OTHER';

interface ISupportRequest {
    title: string;
}

export const SupportRequestInfo: { [key in SupportRequest]: ISupportRequest } = {
    FRATURE: { title: 'امکانات جدید' },
    CHANGE: { title: 'تغییر امکانات' },
    BUG: { title: 'گزارش اشکال' },
    HELP: { title: 'راهنمایی' },
    OTHER: { title: 'سایر موارد' },
};

export const SupportRequestList: SupportRequest[] = Object.keys(SupportRequestInfo) as SupportRequest[];
