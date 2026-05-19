import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { NgxHelperMenu } from '@webilix/ngx-helper/menu';

import { IList, ListAction } from './list.interface';
import { UserService } from '@lib/providers';

export interface IListSetting {
    hasIcon: boolean;
    icons: { icon: string; color: string }[];
    deactives: number[];
    titleIndex: number;
    descriptionIndex: number | undefined;
    hasContent: boolean;
}

@Injectable()
export class ListService {
    constructor(private readonly router: Router, private readonly userService: UserService) {}

    getListSetting<T>(list: IList<T>, data: T[]): IListSetting {
        const hasIcon: boolean = !!list.icon;
        const icons: { icon: string; color: string }[] = hasIcon
            ? data.map((i: T) => {
                  const value = list.icon!(i);
                  const icon: string = typeof value === 'string' ? value : value.icon;
                  const color: string = typeof value === 'string' ? 'primary' : value.color;
                  return { icon, color };
              })
            : [];

        const deactives: number[] = [];
        data.forEach((i: T, index: number) => {
            if (list.isDeactive?.(i)) deactives.push(index);
        });

        let titleIndex: number = list.columns.findIndex((l) => l.isTitle);
        if (titleIndex === -1) titleIndex = 0;

        let descriptionIndex: number | undefined = list.columns.findIndex((l) => l.isDescription);
        if (descriptionIndex === -1) descriptionIndex = undefined;

        const hasContent = !!list.columns.find((_, i) => i !== titleIndex && i !== descriptionIndex);

        return { hasIcon, icons, deactives, titleIndex, descriptionIndex, hasContent };
    }

    getMenu<T>(list: IList<T>, item: T): NgxHelperMenu[] {
        if (!list.actions) return [];

        const getMenuItem = (action: ListAction<T>, item: T): NgxHelperMenu => {
            let icon: string = '';
            let title: string = '';
            let color: 'primary' | 'accent' | 'warn' | undefined;
            if (action === 'DIVIDER') return { icon, title, click: () => {} };

            switch (action.type) {
                case 'UPDATE':
                    icon = 'edit';
                    title = 'ویرایش';
                    break;
                case 'DELETE':
                    icon = 'delete';
                    title = 'حذف';
                    color = 'warn';
                    break;
                case 'STATUS':
                    const isActive: boolean = action.isActive(item);
                    icon = isActive ? 'disabled_by_default' : 'check_box';
                    title = isActive ? 'غیرفعال کردن' : 'فعال کردن';
                    color = isActive ? 'warn' : 'primary';
                    break;
                case 'LOG':
                    icon = 'published_with_changes';
                    title = 'گزارش تغییرات';
                    break;
                default:
                    icon = action.icon;
                    title = action.title;
                    color = action.color;
                    break;
            }

            const click: () => void = () => {
                let click;
                switch (action.type) {
                    case 'UPDATE':
                        click = action.action(item);
                        break;
                    case 'DELETE':
                        click = action.action(item);
                        break;
                    case 'STATUS':
                        click = action.action(item, !action.isActive(item));
                        break;
                    default:
                        click = action.action(item);
                        break;
                }

                if (click) this.router.navigate(click);
            };

            const disableOn = () => !!action.disableOn && action.disableOn(item);
            return { icon, title, click, color, disableOn };
        };

        const menu: NgxHelperMenu[] = [];
        list.actions
            .filter((a) => a === 'DIVIDER' || !a.access || this.userService.hasAccess(a.access))
            .filter((a) => a === 'DIVIDER' || !a.hideOn || !a.hideOn(item))
            .forEach((a) => {
                if (a === 'DIVIDER') menu.push('DIVIDER');
                else menu.push(getMenuItem(a, item));
            });
        return menu;
    }
}
