import { Component, HostBinding, OnInit } from '@angular/core';

import { Feature, Map, View } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { Point } from 'ol/geom';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { FeatureLike } from 'ol/Feature';
import BaseLayer from 'ol/layer/Base';
import interactionDoubleClickZoom from 'ol/interaction/DoubleClickZoom';

import { Helper } from '@webilix/helper-library';
import { NgxHelperBottomSheetService, NgxHelperConfirmService, NgxHelperToastService } from '@webilix/ngx-helper';
import { NgxHelperMenu } from '@webilix/ngx-helper/menu';
import { INgxHelperParamValue, NgxHelperParam } from '@webilix/ngx-helper/param';

import { ApiService, IPersonnelLocationDeleteRs, IPersonnelLocationListRs, IPersonnelMemberLocationDTO } from '@lib/apis';
import { DownloadService } from '@lib/providers';
import { PersonnelGenderInfo, PersonnelLocationInfo } from '@lib/shared';

import { LocationCoordinates } from './location.coordinate';
import { ILocation } from './location.interface';

import { LocationPositionComponent } from './position/location-position.component';
import { LocationSelectComponent } from './select/location-select.component';
import { LocationSiteComponent } from './site/location-site.component';
import { LocationUpdateComponent } from './update/location-update.component';

@Component({
    host: { selector: 'location' },
    templateUrl: './location.component.html',
    styleUrl: './location.component.scss',
    standalone: false
})
export class LocationComponent implements OnInit {
    @HostBinding('className') className = 'page-fullscreen';

    public personnelGenderInfo = PersonnelGenderInfo;
    public personnelLocationInfo = PersonnelLocationInfo;

    public params: NgxHelperParam[] = [
        {
            name: 'status',
            type: 'MENU',
            options: [
                { title: 'استفاده از سرویس', value: 'TRANSPORT' },
                { title: 'ساکن در سایت', value: 'SITE' },
                { title: 'پرسنل دارای مکان', value: 'LOCATION' },
                { title: 'پرسنل بدون مکان', value: 'EMPTY' },
            ],
            icon: 'checklist_rtl',
        },
        {
            name: 'personnel',
            type: 'MENU',
            options: [
                { title: 'راننده', value: 'DRIVER', icon: PersonnelLocationInfo['DRIVER'].icon },
                { title: 'سرپرست', value: 'SUPERVISOR', icon: PersonnelLocationInfo['SUPERVISOR'].icon },
                { title: 'مرد', value: 'MALE', icon: PersonnelGenderInfo['MALE'].icon },
                { title: 'زن', value: 'FEMALE', icon: PersonnelGenderInfo['FEMALE'].icon },
            ],
            icon: 'account_circle',
        },
        { name: 'query', type: 'SEARCH' },
    ];
    public paramsValue?: INgxHelperParamValue;

    public loading: boolean = true;
    public members: IPersonnelMemberLocationDTO[] = [];
    public list: IPersonnelMemberLocationDTO[] = [];
    public locations: ILocation[] = [];
    public selected?: ILocation;
    public count: { location: number; personnel: number } = { location: 0, personnel: 0 };

    public map!: Map;

    constructor(
        private readonly ngxHelperBottomSheetService: NgxHelperBottomSheetService,
        private readonly ngxHelperConfirmService: NgxHelperConfirmService,
        private readonly ngxHelperToastService: NgxHelperToastService,
        private readonly apiService: ApiService,
        private readonly downloadService: DownloadService,
    ) {}

    ngOnInit(): void {
        this.initMap();

        this.apiService.request<IPersonnelLocationListRs>('PersonnelLocationList', (response) => {
            this.loading = false;
            this.members = response;
            this.setLocations();
        });
    }

    setLocations(): void {
        this.locations = [];
        this.count.personnel = 0;
        let hasSite: boolean = false;

        this.members
            .filter((member: IPersonnelMemberLocationDTO) => !!member.location)
            .forEach((member: IPersonnelMemberLocationDTO) => {
                const latitude: number = member.location?.latitude || 0;
                const longitude: number = member.location?.longitude || 0;

                const isSite: boolean =
                    latitude === LocationCoordinates.SITE.latitude && longitude === LocationCoordinates.SITE.longitude;
                if (isSite) hasSite = true;
                if (member.location?.status === 'DRIVER' || (!isSite && member.location?.transport)) this.count.personnel++;

                const location = this.locations.find((l) => l.latitude === latitude && l.longitude === longitude);
                if (location) location.members.push(member);
                else
                    this.locations.push({
                        index: isSite ? -1 : this.locations.length - (hasSite ? 1 : 0),
                        latitude,
                        longitude,
                        members: [member],
                    });
            });

        this.count.location = this.locations.reduce(
            (sum: number, l) => sum + (l.index === -1 || !l.members.find((m) => m.location?.transport) ? 0 : 1),
            0,
        );
    }

    downloadLocations(): void {
        if (this.locations.length === 0) return;

        const content: string[][] = [];
        content.push(['طول جغرافیایی', 'عرض جغرافیایی', 'کد پرسنلی', 'نام و نام خانوادگی', 'نوع مسافر']);

        this.locations.forEach((location: ILocation) => {
            content.push([]);
            location.members.forEach((member: IPersonnelMemberLocationDTO) => {
                if (member.location?.status !== 'DRIVER' && !member.location?.transport) return;

                content.push([
                    location.longitude.toString(),
                    location.latitude.toString(),
                    member.code,
                    `${member.name.first} ${member.name.last}`,
                    member.location.status === 'PERSONNEL' ? member.gender : member.location.status,
                ]);
            });
        });

        this.downloadService.csv('لیست مکان‌های پرسنل', content);
    }

    setList(value?: INgxHelperParamValue): void {
        this.paramsValue = value || this.paramsValue;

        const status: string = this.paramsValue?.params?.['status']?.param || '';
        const personnel: string = this.paramsValue?.params?.['personnel']?.param || '';
        const query: string = this.paramsValue?.params?.['query']?.param || '';

        this.list = this.members.filter((member: IPersonnelMemberLocationDTO) => {
            switch (status) {
                case 'TRANSPORT':
                    if (!member.location?.transport) return false;
                    break;
                case 'SITE':
                    if (
                        member.location?.latitude !== LocationCoordinates.SITE.latitude ||
                        member.location.longitude !== LocationCoordinates.SITE.longitude
                    )
                        return false;
                    break;
                case 'LOCATION':
                    if (!member.location) return false;
                    break;
                case 'EMPTY':
                    if (member.location) return false;
                    break;
            }

            switch (personnel) {
                case 'DRIVER':
                    if (member.location?.status !== 'DRIVER') return false;
                    break;
                case 'SUPERVISOR':
                    if (member.location?.status !== 'SUPERVISOR') return false;
                    break;
                case 'MALE':
                    if (member.gender !== 'MALE') return false;
                    break;
                case 'FEMALE':
                    if (member.gender !== 'FEMALE') return false;
                    break;
            }

            if (
                query &&
                member.code.indexOf(Helper.NUMBER.toEN(query)) === -1 &&
                `${member.name.first} ${member.name.last}`.indexOf(query) === -1
            )
                return false;

            return true;
        });

        this.setMap();
    }

    selectMember(member: IPersonnelMemberLocationDTO): void {
        if (!member.location) return;

        const location = this.locations.find((l) => l.members.find((m) => m.code === member.code));
        if (!location) return;

        this.selected = location;
        const center: Coordinate = [location.longitude, location.latitude];
        this.map.getView().animate({ center, duration: 1000 });
    }

    getMenu(member: IPersonnelMemberLocationDTO): NgxHelperMenu[] {
        return [
            { icon: 'location_on', click: () => this.position(member), title: 'ثبت مکان جدید' },
            {
                icon: 'group_work',
                click: () => this.select(member),
                title: 'انتقال به مکان موجود',
                hideOn: () =>
                    (!member.location && this.locations.length < 1) || (!!member.location && this.locations.length < 2),
            },
            { icon: 'factory', click: () => this.site(member), title: 'ساکن در سایت' },
            'DIVIDER',
            { icon: 'update', click: () => this.update(member), title: 'ویرایش تنظیمات', hideOn: () => !member.location },
            {
                icon: 'location_off',
                click: () => this.delete(member),
                title: 'حذف مکان ',
                color: 'warn',
                hideOn: () => !member.location,
            },
        ];
    }

    updateMember(member: IPersonnelMemberLocationDTO) {
        const index: number = this.members.findIndex((m) => m.code === member.code);
        if (index === -1) return;

        this.members.splice(index, 1, member);
        this.setLocations();
        this.setList();
    }

    position(member: IPersonnelMemberLocationDTO): void {
        this.ngxHelperBottomSheetService.open<IPersonnelMemberLocationDTO>(
            LocationPositionComponent,
            'ثبت مکان جدید',
            { data: { member } },
            (response) => {
                this.selected = undefined;
                this.updateMember(response);
                this.ngxHelperToastService.success('مکان پرسنل با موفقیت ثبت شد.');
            },
        );
    }

    select(member: IPersonnelMemberLocationDTO): void {
        this.ngxHelperBottomSheetService.open<IPersonnelMemberLocationDTO>(
            LocationSelectComponent,
            'انتقال به مکان موجود',
            { data: { member, locations: this.locations } },
            (response) => {
                this.selected = undefined;
                this.updateMember(response);
                this.ngxHelperToastService.success('مکان پرسنل با موفقیت ثبت شد.');
            },
        );
    }

    site(member: IPersonnelMemberLocationDTO): void {
        this.ngxHelperBottomSheetService.open<IPersonnelMemberLocationDTO>(
            LocationSiteComponent,
            'ساکن در سایت',
            { data: { member } },
            (response) => {
                this.selected = undefined;
                this.updateMember(response);
                this.ngxHelperToastService.success('مکان پرسنل با موفقیت ثبت شد.');
            },
        );
    }

    update(member: IPersonnelMemberLocationDTO): void {
        if (!member.location) return;

        this.ngxHelperBottomSheetService.open<IPersonnelMemberLocationDTO>(
            LocationUpdateComponent,
            'ویرایش تنظیمات',
            { data: { member } },
            (response) => {
                this.selected = undefined;
                this.updateMember(response);
                this.ngxHelperToastService.success('تنظیمات مکان پرسنل با موفقیت ثبت شد.');
            },
        );
    }

    delete(member: IPersonnelMemberLocationDTO): void {
        if (!member.location) return;

        const item: string = 'مکان پرسنل';
        const title: string = `${member.name.first} ${member.name.last}`;
        const message: string = 'امکان بازیابی اطلاعات حذف شده وجود ندارد.';

        this.ngxHelperConfirmService.delete(item, { title, message }, () => {
            const MEMBERID: string = member.id;
            this.apiService.request<IPersonnelLocationDeleteRs>(
                'PersonnelLocationDelete',
                { ids: { MEMBERID } },
                (response) => {
                    this.selected = undefined;
                    this.updateMember(response);
                    this.ngxHelperToastService.success('مکان پرسنل با موفقیت حذف شد.');
                },
            );
        });
    }

    //#region MAP
    initMap(): void {
        const coordinate: Coordinate = [LocationCoordinates.MAP.longitude, LocationCoordinates.MAP.latitude];
        this.map = new Map({
            view: new View({ center: coordinate, zoom: 14, projection: 'EPSG:4326' }),
            layers: [new TileLayer({ source: new OSM() })],
            target: 'map',
        });

        [...this.map.getInteractions().getArray()].forEach((interaction) => {
            if (interaction instanceof interactionDoubleClickZoom) this.map.removeInteraction(interaction);
        });

        // CLICK
        this.map.on('click', (event) => {
            this.selected = undefined;

            this.map.forEachFeatureAtPixel(event.pixel, (feature: FeatureLike) => {
                if (!(feature instanceof Feature)) return;

                try {
                    const coordinates = (feature as Feature<Point>).getGeometry()?.getCoordinates();
                    if (!coordinates) return;

                    const latitude: number = coordinates[1];
                    const longitude: number = coordinates[0];
                    this.selected = this.locations.find((l) => l.latitude === latitude && l.longitude === longitude);
                } catch (e) {}
            });
        });
    }

    setMap(): void {
        // RESET MAP
        [...this.map.getLayers().getArray()].forEach((layer: BaseLayer) => {
            if (!(layer instanceof TileLayer)) this.map.removeLayer(layer);
        });

        this.locations.forEach((location) => {
            const coordinate: Coordinate = [location.longitude, location.latitude];
            const feature: Feature<Point> = new Feature(new Point(coordinate));

            const isSite: boolean = location.index === -1;
            const count: number = isSite
                ? 0
                : location.members.reduce((sum: number, m) => sum + (m.location?.transport ? 1 : 0), 0);
            const transport: boolean = count !== 0;

            const circle = new VectorLayer({
                source: new VectorSource<Feature<Point>>({ features: [feature] }),
                style: {
                    // CIRCLE
                    'circle-fill-color': transport ? 'rgb(29, 91, 116)' : 'rgb(200, 200, 200)',
                    'circle-radius': transport ? 12 : 10,
                    'circle-stroke-color': transport ? '#FFF' : 'rgb(29, 91, 116)',
                    'circle-stroke-width': transport ? 1 : 3,
                    // TEXT
                    'text-value': isSite ? '' : (location.index + 1).toString(),
                    'text-fill-color': transport ? '#FFF' : 'rgb(29, 91, 116)',
                    'text-font': `600 12px Arial`,
                    'text-stroke-color': transport ? 'rgb(29, 91, 116)' : 'rgb(200, 200, 200)',
                    'text-stroke-width': 2,
                    'text-offset-y': 1,
                },
            });
            this.map.addLayer(circle);

            if (isSite) {
                this.map.addLayer(
                    new VectorLayer({
                        source: new VectorSource<Feature<Point>>({ features: [feature] }),
                        style: {
                            // TEXT
                            'text-value': `سایت (${location.members.length} نفر)`,
                            'text-offset-y': 20,
                            'text-fill-color': 'rgb(29, 91, 116)',
                            'text-font': '600 11px Yekan',
                            'text-stroke-color': '#FFF',
                            'text-stroke-width': 3,
                        },
                    }),
                );
            }
        });
    }
    //#endregion
}
