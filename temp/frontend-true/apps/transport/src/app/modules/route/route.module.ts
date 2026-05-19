import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NgxFormModule } from '@webilix/ngx-form';
import { NgxHelperMenuModule } from '@webilix/ngx-helper/menu';
import { NgxHelperPipeModule } from '@webilix/ngx-helper/pipe';

import { ListModule } from '@lib/list';
import { MaterialModule } from '@lib/modules';
import { PageModule } from '@lib/page';

import { TooltipCenterComponent, TooltipPathComponent } from '../../components';

import { RouteRoutingModule } from './route.routing';
import { RouteComponent } from './route.component';
import { RouteStationComponent } from './station/route-station.component';
import { RouteCreateComponent } from './create/route-create.component';
import { RouteUpdateComponent } from './update/route-update.component';
import { RouteCopyComponent } from './copy/route-copy.component';
import { RouteReverseComponent } from './reverse/route-reverse.component';
import { RouteCalculateComponent } from './calculate/route-calculate.component';
import { RouteFinalComponent } from './final/route-final.component';
import { RouteColorComponent } from './color/route-color.component';

import { RouteMapCreateComponent } from './map/create/route-map-create.component';
import { RouteMapCreateOptionComponent } from './map/create/option/route-map-create-option.component';
import { RouteMapViewComponent } from './map/view/route-map-view.component';

import { RouteMapSaveComponent } from './map/save/route-map-save.component';
import { RouteMapSaveCenterComponent } from './map/save/center/route-map-save-center.component';
import { RouteMapSaveCreateComponent } from './map/save/create/route-map-save-create.component';
import { RouteMapSaveBoundaryComponent } from './map/save/boundary/route-map-save-boundary.component';

import { RouteMapAttachComponent } from './map/attach/route-map-attach.component';
import { RouteMapAttachCenterComponent } from './map/attach/center/route-map-attach-center.component';
import { RouteMapAttachCreateComponent } from './map/attach/create/route-map-attach-create.component';
import { RouteMapAttachBoundaryComponent } from './map/attach/boundary/route-map-attach-boundary.component';

import { RouteMapEditComponent } from './map/edit/route-map-edit.component';
import { RouteMapEditCenterComponent } from './map/edit/center/route-map-edit-center.component';
import { RouteMapEditCreateComponent } from './map/edit/create/route-map-edit-create.component';
import { RouteMapEditBoundaryComponent } from './map/edit/boundary/route-map-edit-boundary.component';

@NgModule({
    declarations: [
        RouteComponent,
        RouteStationComponent,
        RouteCreateComponent,
        RouteUpdateComponent,
        RouteCopyComponent,
        RouteReverseComponent,
        RouteCalculateComponent,
        RouteFinalComponent,
        RouteColorComponent,

        RouteMapCreateComponent,
        RouteMapCreateOptionComponent,
        RouteMapViewComponent,

        RouteMapSaveComponent,
        RouteMapSaveCenterComponent,
        RouteMapSaveCreateComponent,
        RouteMapSaveBoundaryComponent,

        RouteMapAttachComponent,
        RouteMapAttachCenterComponent,
        RouteMapAttachCreateComponent,
        RouteMapAttachBoundaryComponent,

        RouteMapEditComponent,
        RouteMapEditCenterComponent,
        RouteMapEditCreateComponent,
        RouteMapEditBoundaryComponent,
    ],
    imports: [
        CommonModule,
        RouterModule,
        RouteRoutingModule,

        NgxFormModule,
        NgxHelperMenuModule,
        NgxHelperPipeModule,

        ListModule,
        MaterialModule,
        PageModule,

        TooltipCenterComponent,
        TooltipPathComponent,
    ],
})
export class RouteModule {}
