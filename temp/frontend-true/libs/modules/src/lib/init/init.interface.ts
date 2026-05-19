import { App } from '@lib/shared';

export interface IInitConfig {
    app: 'ADMIN' | App;
    apiVersion: string;
    appVersion: string;
}
