import { NgModule } from '@angular/core';
import { Route, Routes, provideRouter } from '@angular/router';

import { LoadFlow, LoadFlowInfo, LoadFlowList, UserAccessGuard } from '@lib/shared';

import { FlowComponent } from './flow.component';

const routes: Routes = LoadFlowList.map(
    (flow: LoadFlow) =>
        ({
            path: flow,
            data: { flow, userAccess: LoadFlowInfo[flow].role },
            canActivate: [UserAccessGuard],
            component: FlowComponent,
        } as Route),
);

@NgModule({ providers: [provideRouter(routes)] })
export class FlowRoutingModule {}
