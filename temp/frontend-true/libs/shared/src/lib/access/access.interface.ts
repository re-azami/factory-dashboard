import { App } from '../types';

export interface IAccess {
    app: App;
    title: string;
    actions?: string[];
    type?: 'DASHBOARD' | 'REPORT' | 'ROLE';
}
