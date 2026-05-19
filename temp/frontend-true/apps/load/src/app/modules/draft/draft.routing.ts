import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { UserAccessGuard } from '@lib/shared';

import { LoadActiveTransporterResolver, LoadDraftResolver } from '../../resolvers';

import { DraftDailyComponent } from './daily/draft-daily.component';
import { DraftActiveComponent } from './active/draft-active.component';
import { DraftFinishedComponent } from './finished/draft-finished.component';
import { DraftCanceledComponent } from './canceled/draft-canceled.component';
import { DraftUpdatedComponent } from './updated/draft-updated.component';
import { DraftInfoComponent } from './info/draft-info.component';
import { DraftUpdateComponent } from './update/draft-update.component';
import { DraftBulkCancelComponent } from './bulk-cancel/draft-bulk-cancel.component';

const routes: Routes = [
    {
        path: 'daily',
        data: {
            userAccess: [
                'LOAD_DRAFT_DAILY',
                'LOAD_ROLE_TRAFFIC',
                'LOAD_ROLE_TRAFFIC_MINE',
                'LOAD_ROLE_WEIGHT',
                'LOAD_ROLE_LOADING',
                'LOAD_ROLE_LOADING_MINE',
                'LOAD_ROLE_DISCHARGE',
            ],
        },
        canActivate: [UserAccessGuard],
        component: DraftDailyComponent,
    },
    {
        path: 'active',
        data: {
            userAccess: [
                'LOAD_DRAFT_ACTIVE',
                'LOAD_ROLE_TRAFFIC',
                'LOAD_ROLE_TRAFFIC_MINE',
                'LOAD_ROLE_WEIGHT',
                'LOAD_ROLE_LOADING',
                'LOAD_ROLE_LOADING_MINE',
                'LOAD_ROLE_DISCHARGE',
            ],
        },
        canActivate: [UserAccessGuard],
        component: DraftActiveComponent,
    },
    {
        path: 'finished',
        data: { userAccess: ['LOAD_DRAFT_FINISHED'] },
        canActivate: [UserAccessGuard],
        component: DraftFinishedComponent,
    },
    {
        path: 'canceled',
        data: { userAccess: ['LOAD_DRAFT_CANCELED'] },
        canActivate: [UserAccessGuard],
        component: DraftCanceledComponent,
    },
    {
        path: 'updated',
        data: { userAccess: ['LOAD_DRAFT_UPDATED'] },
        canActivate: [UserAccessGuard],
        component: DraftUpdatedComponent,
    },
    {
        path: 'info/:ID',
        data: {
            userAccess: [
                'LOAD_DRAFT_ACTIVE',
                'LOAD_DRAFT_FINISHED',
                'LOAD_DRAFT_CANCELED',
                'LOAD_DRAFT_UPDATED',
                'LOAD_ROLE_TRAFFIC',
                'LOAD_ROLE_TRAFFIC_MINE',
                'LOAD_ROLE_WEIGHT',
                'LOAD_ROLE_LOADING',
                'LOAD_ROLE_LOADING_MINE',
                'LOAD_ROLE_DISCHARGE',
            ],
        },
        canActivate: [UserAccessGuard],
        resolve: { draft: LoadDraftResolver },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        component: DraftInfoComponent,
    },
    {
        path: 'update/:ID',
        data: { userAccess: 'LOAD_DRAFT_UPDATE' },
        canActivate: [UserAccessGuard],
        resolve: { draft: LoadDraftResolver, transporters: LoadActiveTransporterResolver },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        component: DraftUpdateComponent,
    },
    {
        path: 'bulk-cancel',
        data: { userAccess: 'LOAD_FLOW_CANCEL' },
        canActivate: [UserAccessGuard],
        component: DraftBulkCancelComponent,
    },
];

@NgModule({ providers: [provideRouter(routes)] })
export class DraftRoutingModule {}
