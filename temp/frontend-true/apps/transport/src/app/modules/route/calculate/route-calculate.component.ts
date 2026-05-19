import { Component, Inject, OnInit } from '@angular/core';

import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { ITransportRouteDTO, ITransportRoutePathDTO } from '@lib/apis';

@Component({
    host: { selector: 'route-calculate' },
    templateUrl: './route-calculate.component.html',
    styleUrl: './route-calculate.component.scss',
    standalone: false
})
export class RouteCalculateComponent implements OnInit {
    public path: ITransportRoutePathDTO = this.data.route.paths[this.data.pathIndex];
    public center: number = 0;
    public times: number[] = [];

    constructor(@Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { route: ITransportRouteDTO; pathIndex: number }) {}

    ngOnInit(): void {
        this.select(0);
    }

    select(center: number): void {
        this.center = center;
        this.times = [];

        this.times = this.path.centers.map((_, index: number) =>
            index <= this.center ? 0 : this.path.centers[this.center].time.total - this.path.centers[index].time.total,
        );
        this.times.push(this.path.centers[this.center].time.total - this.path.time);
    }
}
