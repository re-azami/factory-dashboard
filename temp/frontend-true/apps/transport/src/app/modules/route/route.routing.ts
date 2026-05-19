import { NgModule } from '@angular/core';
import { Routes, provideRouter } from '@angular/router';

import { TransportRouteResolver, TransportStationResolver, TransportStationsResolver } from '../../resolvers';

import { RouteComponent } from './route.component';
import { RouteMapCreateComponent } from './map/create/route-map-create.component';
import { RouteMapSaveComponent } from './map/save/route-map-save.component';
import { RouteMapViewComponent } from './map/view/route-map-view.component';
import { RouteMapAttachComponent } from './map/attach/route-map-attach.component';
import { RouteMapEditComponent } from './map/edit/route-map-edit.component';

const routes: Routes = [
    { path: '', resolve: { stations: TransportStationsResolver }, component: RouteComponent },
    {
        path: 'create/:stationId',
        data: { header: 'محاسبه' },
        resolve: { station: TransportStationResolver },
        component: RouteMapCreateComponent,
    },
    {
        path: 'save/:stationId',
        data: { header: 'ثبت مسیر' },
        resolve: { station: TransportStationResolver },
        component: RouteMapSaveComponent,
    },
    {
        path: 'attach/:routeId',
        data: { header: 'اضافه کردن مسیر' },
        resolve: { route: TransportRouteResolver },
        component: RouteMapAttachComponent,
    },
    {
        path: 'edit/:routeId/:pathIndex',
        data: { header: 'ویرایش مسیر' },
        resolve: { route: TransportRouteResolver },
        component: RouteMapEditComponent,
    },
    {
        path: 'map/:routeId',
        data: { header: 'مشاهده' },
        resolve: { route: TransportRouteResolver },
        component: RouteMapViewComponent,
    },
];

@NgModule({ providers: [provideRouter(routes)] })
export class RouteRoutingModule {}
