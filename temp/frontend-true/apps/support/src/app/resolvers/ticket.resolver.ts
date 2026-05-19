import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { ApiService, ISupportTicketDTO, ISupportTicketInfoRs } from '@lib/apis';

export const SupportTicketResolver: ResolveFn<ISupportTicketDTO> = (route): Promise<ISupportTicketDTO> => {
    const router = inject(Router);
    const apiService = inject(ApiService);

    return new Promise<ISupportTicketDTO>((resolve, reject) => {
        const ID: string = route.paramMap.get('ticketId') || '';
        apiService.request<ISupportTicketInfoRs>(
            'SupportTicketInfo',
            { ids: { ID }, silent: true },
            (response) => resolve(response),
            () => {
                router.navigate(['/ticket']);
                reject();
            },
        );
    });
};
