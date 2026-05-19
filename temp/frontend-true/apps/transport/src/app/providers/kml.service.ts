import { Injectable } from '@angular/core';

import { Helper } from '@webilix/helper-library';

export interface IKmlCoordinates {
    title: string;
    latitude: number;
    longitude: number;
    description?: string[];
}

@Injectable({ providedIn: 'root' })
export class TransportKmlService {
    download(title: string, coordinates: IKmlCoordinates[]): void {
        const content: string = this.create(coordinates);

        const download = document.createElement('a');
        download.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
        download.setAttribute('download', Helper.STRING.getFileName(title, 'kml'));
        download.style.display = 'none';
        document.body.appendChild(download);
        download.click();

        document.body.removeChild(download);
    }

    private create(coordinates: IKmlCoordinates[]): string {
        const xml: XMLDocument = document.implementation.createDocument('', '', null);
        const kml = xml.createElement('kml');
        const doc = xml.createElement('Document');
        coordinates.forEach((c) => doc.appendChild(this.createPoint(xml, c)));

        kml.setAttribute('xmlns', 'http://www.opengis.net/kml/2.2');
        kml.appendChild(doc);
        xml.appendChild(kml);

        return '<?xml version="1.0" encoding="UTF-8"?>' + new XMLSerializer().serializeToString(xml);
    }

    private createPoint(xml: XMLDocument, coordinates: IKmlCoordinates): HTMLElement {
        const placemark = xml.createElement('Placemark');

        const name = xml.createElement('name');
        name.innerHTML = coordinates.title;
        placemark.appendChild(name);

        const description = xml.createElement('description');
        description.innerHTML = (coordinates.description || []).join('<br />');
        placemark.appendChild(description);

        const coordinatesNode = xml.createElement('coordinates');
        coordinatesNode.innerHTML = `${coordinates.longitude},${coordinates.latitude}`;

        const point = xml.createElement('Point');
        point.appendChild(coordinatesNode);
        placemark.appendChild(point);

        return placemark;
    }
}
