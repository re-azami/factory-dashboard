import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { ApiService, ILoadActivePartyRs, IOptionDTO } from '@lib/apis';
import { LoadCargo, LoadCargoList } from '@lib/shared';

export const LoadActivePartyResolver: ResolveFn<IOptionDTO[]> = (route): Promise<IOptionDTO[]> => {
    const apiService = inject(ApiService);

    return new Promise<IOptionDTO[]>((resolve) => {
        let cargo: string = route.paramMap.get('CARGO') || '';
        if (!LoadCargoList.includes(cargo as LoadCargo)) cargo = '';

        apiService.request<ILoadActivePartyRs>(
            'LoadActiveParty',
            { params: { cargo }, silent: true },
            (response) => resolve(response),
            () => resolve([]),
        );
    });
};
