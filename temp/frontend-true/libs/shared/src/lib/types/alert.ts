import { App } from './apps';

export type Alert = 'LOAD_DONE' | 'LOAD_ACTIVE';

export interface IAlert {
    title: string;
    app: App;
}

export const AlertInfo: { [key in Alert]: IAlert } = {
    LOAD_DONE: { title: 'پایان بار اتوماتیک', app: 'LOAD' },
    LOAD_ACTIVE: { title: 'فعال سازی اتوماتیک بار', app: 'LOAD' },
};

export const AlertList: Alert[] = Object.keys(AlertInfo) as Alert[];
