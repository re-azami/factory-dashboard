import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { IPageTitle } from '../interfaces/page-title';

@Injectable({ providedIn: 'root' })
export class PageService {
    private _pageTitle?: IPageTitle;
    get pageTitle(): IPageTitle | undefined {
        return this._pageTitle;
    }

    private pageTitleChanged: Subject<IPageTitle | undefined> = new Subject<IPageTitle | undefined>();
    get onPageTitleChanged(): Observable<IPageTitle | undefined> {
        return this.pageTitleChanged.asObservable();
    }

    setPageTitle(title?: IPageTitle): void {
        this._pageTitle = title;
        this.pageTitleChanged.next(title);
    }
}
