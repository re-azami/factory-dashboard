export type LoadStatus = 'FUTURE' | 'ACTIVE' | 'DONE';

interface ILoadStatus {
    title: string;
    icon: string;
    color: string;
}

export const LoadStatusInfo: { [key in LoadStatus]: ILoadStatus } = {
    FUTURE: { title: 'آتی', icon: 'history_toggle_off', color: '#ff6600' },
    ACTIVE: { title: 'فعال', icon: 'local_shipping', color: '#0068b3' },
    DONE: { title: 'پایان', icon: 'done_all', color: '#1da756' },
};

export const LoadStatusList: LoadStatus[] = Object.keys(LoadStatusInfo) as LoadStatus[];
