import { Access } from '../../access';

export type LoadFlow = 'TRAFFIC' | 'TRAFFIC_MINE' | 'WEIGHT' | 'LOADING' | 'LOADING_MINE' | 'DISCHARGE';

interface ILoadFlow {
    title: string;
    role: Access;
}

export const LoadFlowInfo: { [key in LoadFlow]: ILoadFlow } = {
    TRAFFIC: { title: 'ورود و خروج', role: 'LOAD_ROLE_TRAFFIC' },
    TRAFFIC_MINE: { title: 'ورود و خروج معدن', role: 'LOAD_ROLE_TRAFFIC_MINE' },
    WEIGHT: { title: 'توزین', role: 'LOAD_ROLE_WEIGHT' },
    LOADING: { title: 'بارگیری', role: 'LOAD_ROLE_LOADING' },
    LOADING_MINE: { title: 'بارگیری معدن', role: 'LOAD_ROLE_LOADING_MINE' },
    DISCHARGE: { title: 'تخلیه', role: 'LOAD_ROLE_DISCHARGE' },
};

export const LoadFlowList: LoadFlow[] = Object.keys(LoadFlowInfo) as LoadFlow[];
