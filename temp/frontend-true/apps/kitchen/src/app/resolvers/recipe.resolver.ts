import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, IKitchenRecipeDTO, IKitchenRecipeInfoRs } from '@lib/apis';

export const KitchenRecipeResolver: ResolveFn<IKitchenRecipeDTO> = (route): Promise<IKitchenRecipeDTO> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<IKitchenRecipeDTO>((resolve, reject) => {
        const ID: string = route.paramMap.get('ID') || '';

        apiService.request<IKitchenRecipeInfoRs>(
            'KitchenRecipeInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/recipe']);
                reject();
            },
        );
    });
};
