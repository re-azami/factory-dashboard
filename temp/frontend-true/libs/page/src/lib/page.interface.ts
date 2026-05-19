import { NgxHelperCalendar } from '@webilix/ngx-helper/calendar';
import { NgxHelperParam } from '@webilix/ngx-helper/param';

import { Access, App, UserGroup } from '@lib/shared';

export type PageMenuChild =
    | 'DIVIDER'
    | {
          readonly title: string;
          readonly action: string[] | (() => void);
          readonly access?: {
              readonly group?: UserGroup | UserGroup[];
              readonly admin?: App;
              readonly app?: App;
              readonly access?: Access | Access[];
          };
      };

export interface IPageMenu {
    readonly id?: string;
    readonly title: string;
    readonly icon: string;
    readonly children: PageMenuChild[];
}

export interface IPageBlock {
    title: string;
    value: string | number;
    english?: boolean;
    ltr?: boolean;
    color?: 'primary' | 'accent' | 'warn';
}

//#region CARD
export interface IPageCardButton {
    title: string;
    icon: string;
    action: () => void;
    color?: 'primary' | 'accent' | 'warn';
    showIcon?: boolean;
}

export interface IPageCardOption {
    index?: number;
    icon: string;
    options: ({ id: string; title: string } | 'DIVIDER')[];
    action: (id: string) => void;
}
//#endregion

//#region TITLE
interface IPageTitleToolbar {
    readonly route: string[];
    readonly params?: NgxHelperParam[];
    readonly calendar?: {
        readonly types: NgxHelperCalendar[];
        readonly minDate?: Date;
        readonly maxDate?: Date;
    };
}

export interface IPageTitleAction {
    readonly type?: 'ACTION';
    readonly title: string;
    readonly icon: string;
    readonly color?: 'primary' | 'accent' | 'warn';
    readonly action: string[] | (() => void);
    readonly access?: {
        readonly group?: UserGroup | UserGroup[];
        readonly admin?: App;
        readonly app?: App;
        readonly access?: Access | Access[];
    };
    readonly hideOn?: () => boolean;
}

export interface IPageTitleActionCreate extends Omit<IPageTitleAction, 'type' | 'icon' | 'color'> {
    readonly type: 'CREATE';
}

export interface IPageTitleActionDelete extends Omit<IPageTitleAction, 'type' | 'icon' | 'color' | 'action'> {
    readonly type: 'DELETE';
    readonly action: () => void;
}

export interface IPageTitleActionReturn extends Omit<IPageTitleAction, 'type' | 'title' | 'icon' | 'action' | 'color'> {
    readonly type: 'RETURN';
    readonly action: string[];
}

export interface IPageTitleActionMenu extends Omit<IPageTitleAction, 'type' | 'action'> {
    readonly type: 'MENU';
    readonly action: (id: string) => string[] | void;
    readonly menu: (
        | 'DIVIDER'
        | {
              readonly id: string;
              readonly title: string;
              readonly description?: string;
              readonly access?: {
                  readonly group?: UserGroup | UserGroup[];
                  readonly admin?: App;
                  readonly app?: App;
                  readonly access?: Access | Access[];
              };
              readonly deactiveOn?: () => boolean;
          }
    )[];
}

export type PageTitleAction =
    | IPageTitleAction
    | IPageTitleActionCreate
    | IPageTitleActionDelete
    | IPageTitleActionReturn
    | IPageTitleActionMenu;

export interface IPageTitle {
    readonly title: string;
    readonly description?: string;
    readonly toolbar?: IPageTitleToolbar;
    readonly actions?: PageTitleAction[];
}
//#endregion
