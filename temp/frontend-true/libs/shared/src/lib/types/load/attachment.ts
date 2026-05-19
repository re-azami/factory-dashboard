import { Access } from '@lib/shared';

export type LoadAttachment = 'PARTY' | 'TRANSPORTER' | 'CARGO' | 'OWNER' | 'TRUCK';

interface ILoadAttachment {
    title: string;
    icon: string;
    page: { title: string; route: string[] };
    access: Access;
}

export const LoadAttachmentInfo: { [key in LoadAttachment]: ILoadAttachment } = {
    PARTY: {
        title: 'طرف حساب',
        icon: 'diversity_3',
        page: { title: 'مدیریت طرف حساب‌ها', route: ['/party'] },
        access: 'LOAD_PARTY',
    },
    TRANSPORTER: {
        title: 'باربری',
        icon: 'portrait',
        page: { title: 'مدیریت باربری‌ها‌', route: ['/transporter'] },
        access: 'LOAD_TRANSPORTER',
    },
    CARGO: { title: 'بار', icon: 'terrain', page: { title: 'مدیریت بارها', route: ['/cargo'] }, access: 'LOAD_CARGO' },
    OWNER: { title: 'مالک', icon: 'badge', page: { title: 'مدیریت مالک‌ها', route: ['/owner'] }, access: 'LOAD_OWNER' },
    TRUCK: {
        title: 'ناوگان',
        icon: 'local_shipping',
        page: { title: 'مدیریت ناوگان', route: ['/truck'] },
        access: 'LOAD_TRUCK',
    },
};

export const LoadAttachmentList: LoadAttachment[] = Object.keys(LoadAttachmentInfo) as LoadAttachment[];
