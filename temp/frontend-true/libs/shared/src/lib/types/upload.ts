export type Upload =
    // EDUCATION
    | 'EDUCATION_MENTOR_CV'
    //LOAD
    | 'LOAD_LETTER'
    | 'LOAD_DRAFT'
    | 'LOAD_ATTACHMENT'
    // PERSONNEL
    | 'PERSONNEL_MEMBER'
    // SUPPORT
    | 'SUPPORT_TICKET_ATTACHMENT_USER'
    | 'SUPPORT_TICKET_ATTACHMENT';

interface IUpload {
    title: string;

    maxSize?: string; // {#}{B, KB, MB, GB, TB}
    mimes?: 'IMAGE' | string[] | ('IMAGE' | string)[];
}

export const UploadInfo: { [key in Upload]: IUpload } = {
    EDUCATION_MENTOR_CV: { title: 'فایل رزومه مدرس‌', mimes: ['application/pdf'] },

    LOAD_LETTER: { title: 'نامه ترخیص', mimes: ['IMAGE', 'application/pdf'] },
    LOAD_DRAFT: { title: 'فایل ضمیمه حواله' },
    LOAD_ATTACHMENT: { title: 'فایل ضمیمه' },

    PERSONNEL_MEMBER: { title: 'عکس پرسنلی', mimes: 'IMAGE' },

    SUPPORT_TICKET_ATTACHMENT_USER: { title: 'فایل ضمیمه درخواست پشتیبانی' },
    SUPPORT_TICKET_ATTACHMENT: { title: 'فایل ضمیمه درخواست پشتیبانی' },
};

export const UploadList: Upload[] = Object.keys(UploadInfo) as Upload[];
