import { LoadCargo } from '@lib/shared';

export interface ILoadPartyDTO {
    readonly id: string;
    readonly create: Date;
    readonly title: string;
    readonly cargo: LoadCargo[];
    readonly status: 'ACTIVE' | 'DEACTIVE';
}
