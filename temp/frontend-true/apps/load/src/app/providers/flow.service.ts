import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { ILoadTruckDTO } from '@lib/apis';

@Injectable({ providedIn: 'root' })
export class LoadFlowService {
    private truckWeighted: Subject<ILoadTruckDTO> = new Subject<ILoadTruckDTO>();
    get onTruckWeighted(): Observable<ILoadTruckDTO> {
        return this.truckWeighted.asObservable();
    }

    setTruckWeighted(truck: ILoadTruckDTO): void {
        this.truckWeighted.next(truck);
    }
}
