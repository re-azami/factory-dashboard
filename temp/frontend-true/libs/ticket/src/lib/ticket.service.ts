import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { ConfigService, VersionService } from '@lib/providers';
import { App } from '@lib/shared';

@Injectable()
export class TicketService {
    get app(): App | undefined {
        const app = this.versionService.app;
        if (app === undefined || app === 'ADMIN' || app === 'SUPPORT' || !this.configService.hasApp(app)) {
            this.router.navigate(['/dashboard']);
            return;
        }

        return app;
    }

    constructor(
        private readonly router: Router,
        private readonly configService: ConfigService,
        private readonly versionService: VersionService,
    ) {}
}
