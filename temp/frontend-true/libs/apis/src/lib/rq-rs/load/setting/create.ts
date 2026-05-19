import { LoadCargo } from '@lib/shared';

import { ILoadSettingDTO } from '../../../dtos';

export interface ILoadSettingCreateRq {
    readonly cargo: LoadCargo;
    readonly approximate: boolean;
    readonly expire: number;
    readonly cancel: number;
    readonly block: boolean;
    readonly draftParty: boolean;
    readonly steps: {
        readonly step: string;
        readonly status: 'ACTIVE' | 'DEACTIVE';
        readonly delay: number;
    }[];
}

export interface ILoadSettingCreateRs extends ILoadSettingDTO {}
