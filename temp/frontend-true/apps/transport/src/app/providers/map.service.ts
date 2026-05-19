import { Injectable } from '@angular/core';
import { Feature, Map, View } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { LineString, Point } from 'ol/geom';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { EventsKey } from 'ol/events';
import { FeatureLike } from 'ol/Feature';
import BaseLayer from 'ol/layer/Base';
import interactionDoubleClickZoom from 'ol/interaction/DoubleClickZoom';

import { Helper } from '@webilix/helper-library';

import { AppCoordinates } from '../app.coordinate';

@Injectable({ providedIn: 'root' })
export class TransportMapService {
    initMap(): Map {
        const coordinate: Coordinate = [AppCoordinates.MAP.longitude, AppCoordinates.MAP.latitude];
        const map: Map = new Map({
            view: new View({ center: coordinate, zoom: 14, projection: 'EPSG:4326' }),
            layers: [new TileLayer({ source: new OSM() })],
            target: 'map',
        });

        [...map.getInteractions().getArray()].forEach((interaction) => {
            if (interaction instanceof interactionDoubleClickZoom) map.removeInteraction(interaction);
        });

        return map;
    }

    initClick(map: Map, reset: () => void, check: (latitude: number, longitude: number) => void): EventsKey {
        return map.on('click', (event) => {
            reset();

            map.forEachFeatureAtPixel(event.pixel, (feature: FeatureLike) => {
                if (!(feature instanceof Feature)) return;

                try {
                    const coordinates = (feature as Feature<Point>).getGeometry()?.getCoordinates();
                    if (!coordinates) return;

                    const latitude: number = coordinates[1];
                    const longitude: number = coordinates[0];
                    check(latitude, longitude);
                } catch (e) {}
            });
        });
    }

    resetMap(map: Map): void {
        [...map.getLayers().getArray()].forEach((layer: BaseLayer) => {
            if (!(layer instanceof TileLayer)) map.removeLayer(layer);
        });
    }

    setView(map: Map, latitude: number, longitude: number): void {
        const center: Coordinate = [longitude, latitude];
        map.getView().animate({ center, duration: 1000 });
    }

    setLocationLayer(map: Map, latitude: number, longitude: number, passenger: number, color?: string): void {
        const coordinate: Coordinate = [longitude, latitude];
        const feature: Feature<Point> = new Feature(new Point(coordinate));
        const layer = new VectorLayer({
            source: new VectorSource<Feature<Point>>({ features: [feature] }),
            style: {
                // CIRCLE
                'circle-fill-color': color ? Helper.COLOR.getGradient(color, '#FFF', 5)[1] : 'rgb(29, 91, 116)',
                'circle-radius': color ? 9 : 12,
                'circle-stroke-color': '#FFF',
                'circle-stroke-width': 1,
                // TEXT
                'text-value': passenger.toString(),
                'text-fill-color': '#FFF',
                'text-font': `600 ${color ? 11 : 15}px Arial`,
            },
        });
        map.addLayer(layer);
    }

    setParkingLayer(map: Map, latitude: number, longitude: number, vehicle?: number): void {
        const coordinate: Coordinate = [longitude, latitude];
        const feature: Feature<Point> = new Feature(new Point(coordinate));

        const circle = new VectorLayer({
            source: new VectorSource<Feature<Point>>({ features: [feature] }),
            style: { 'circle-fill-color': '#FFF', 'circle-radius': 9, 'circle-displacement': [0, 16] },
        });
        map.addLayer(circle);

        const icon = new VectorLayer({
            source: new VectorSource<Feature<Point>>({ features: [feature] }),
            style: {
                // ICON
                'icon-src': '/assets/pin/parking.png',
                'icon-width': 31,
                'icon-height': 31,
                'icon-color': 'rgb(29, 91, 116)',
                'icon-displacement': [0, 13],
                // TEXT
                ...(vehicle
                    ? {
                          'text-value': vehicle.toString(),
                          'text-offset-y': 10,
                          'text-fill-color': 'rgb(29, 91, 116)',
                          'text-font': '600 13px Arial',
                          'text-stroke-color': '#FFF',
                          'text-stroke-width': 3,
                      }
                    : {}),
            },
        });
        map.addLayer(icon);
    }

    setDestinationLayer(map: Map, latitude: number, longitude: number, vehicle?: number): void {
        const coordinate: Coordinate = [longitude, latitude];
        const feature: Feature<Point> = new Feature(new Point(coordinate));

        const circle = new VectorLayer({
            source: new VectorSource<Feature<Point>>({ features: [feature] }),
            style: { 'circle-fill-color': '#FFF', 'circle-radius': 9, 'circle-displacement': [0, 16] },
        });
        map.addLayer(circle);

        const icon = new VectorLayer({
            source: new VectorSource<Feature<Point>>({ features: [feature] }),
            style: {
                // ICON
                'icon-src': '/assets/pin/destination.png',
                'icon-width': 31,
                'icon-height': 31,
                'icon-color': 'rgb(29, 91, 116)',
                'icon-displacement': [0, 13],
                // TEXT
                ...(vehicle
                    ? {
                          'text-value': vehicle.toString(),
                          'text-offset-y': 10,
                          'text-fill-color': 'rgb(29, 91, 116)',
                          'text-font': '600 13px Arial',
                          'text-stroke-color': '#FFF',
                          'text-stroke-width': 3,
                      }
                    : {}),
            },
        });
        map.addLayer(icon);
    }

    setCenterLayer(map: Map, index: number, latitude: number, longitude: number, color: string): void {
        const coordinate: Coordinate = [longitude, latitude];
        const feature: Feature<Point> = new Feature(new Point(coordinate));

        const circle = new VectorLayer({
            source: new VectorSource<Feature<Point>>({ features: [feature] }),
            style: { 'circle-fill-color': '#FFF', 'circle-radius': 13 },
        });
        map.addLayer(circle);

        const icon = new VectorLayer({
            source: new VectorSource<Feature<Point>>({ features: [feature] }),
            style: {
                // ICON
                'icon-src': '/assets/pin/station.png',
                'icon-width': 25,
                'icon-height': 25,
                'icon-color': color,
                // TEXT
                'text-value': (index + 1).toString(),
                'text-offset-y': 20,
                'text-fill-color': color,
                'text-font': '600 15px Arial',
                'text-stroke-color': '#FFF',
                'text-stroke-width': 3,
            },
        });
        map.addLayer(icon);
    }

    setEmptyCenterLayer(map: Map, latitude: number, longitude: number): void {
        const coordinate: Coordinate = [longitude, latitude];
        const feature: Feature<Point> = new Feature(new Point(coordinate));

        const circle = new VectorLayer({
            source: new VectorSource<Feature<Point>>({ features: [feature] }),
            style: { 'circle-fill-color': '#F00', 'circle-radius': 13 },
        });
        map.addLayer(circle);

        const icon = new VectorLayer({
            source: new VectorSource<Feature<Point>>({ features: [feature] }),
            style: {
                'text-value': '?',
                'text-fill-color': '#FFF',
                'text-font': '400 15px Arial',
                'text-stroke-color': '#FFF',
                'text-stroke-width': 1,
            },
        });
        map.addLayer(icon);
    }

    setLineLayer(map: Map, from: Coordinate, to: Coordinate, text: string, color: string): void {
        const feature: Feature<LineString> = new Feature<LineString>({ geometry: new LineString([from, to]) });
        const layer: VectorLayer = new VectorLayer({
            source: new VectorSource({ features: [feature] }),
            style: {
                // TEXT
                'text-value': text,
                'text-fill-color': color,
                'text-font': '600 13px Arial',
                'text-stroke-color': '#FFF',
                'text-stroke-width': 3,
                // STROKE
                'stroke-color': color,
                'stroke-width': 2,
            },
        });
        map.addLayer(layer);
    }
}
