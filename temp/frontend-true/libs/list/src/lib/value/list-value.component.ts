import { Component, HostBinding, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

import { Helper } from '@webilix/helper-library';

import { ListColumn } from '../list.interface';

@Component({
    selector: 'list-value',
    templateUrl: './list-value.component.html',
    styleUrl: './list-value.component.scss',
    standalone: false
})
export class ListValueComponent<T> implements OnChanges {
    @HostBinding('style.font-size') fontSize: string = 'auto';
    @HostBinding('style.white-space') whiteSpace: string = 'inherit';

    @Input({ required: true }) column!: ListColumn<T>;
    @Input({ required: true }) item!: T;
    @Input({ required: false }) deactive?: boolean = false;
    @Input({ required: false }) type?: 'TITLE' | 'DESCRIPTION';

    public value: any = undefined;
    public description?: string;
    public descriptionEn: boolean = false;
    public isEn: boolean = false;
    public action?: string[] | (() => void);
    public copy?: string;

    constructor(private readonly router: Router) {}

    ngOnChanges(changes: SimpleChanges): void {
        this.fontSize = this.type === 'DESCRIPTION' ? '12px' : 'auto';
        this.whiteSpace = this.type ? 'nowrap' : 'inherit';

        const description = this.column.description ? this.column.description(this.item) : undefined;

        this.value = this.getValue();
        this.description = description ? (typeof description === 'string' ? description : description.en) : undefined;
        this.descriptionEn = !!description && typeof description !== 'string';
        this.isEn =
            ('english' in this.column &&
                (typeof this.column.english === 'boolean' ? !!this.column.english : !!this.column.english?.(this.item))) ||
            ['MOBILE', 'NATIONAL-CODE'].includes(this.column.type || '');
        this.action = this.column.action ? this.column.action(this.item) : undefined;
        if (Array.isArray(this.action) && this.action.length === 0) this.action = undefined;
        this.copy = !this.column.action && this.column.copy ? this.column.copy(this.item) : undefined;
    }

    getValue(): any {
        const value: any =
            typeof this.column.value === 'function' ? this.column.value(this.item) : this.item[this.column.value];
        if (value === undefined) return undefined;

        switch (this.column.type) {
            case 'DATE':
                return Helper.IS.date(value) ? value : undefined;

            case 'DURATION':
                return Helper.IS.number(value) ? value : undefined;

            case 'FILE-SIZE':
                return Helper.IS.number(value) ? value : undefined;

            case 'MOBILE':
                return Helper.IS.STRING.mobile(value) ? value : undefined;

            case 'NATIONAL-CODE':
                return Helper.IS.STRING.nationalCode(value) ? value : undefined;

            case 'NUMBER':
                return Helper.IS.number(value) ? value : undefined;

            case 'PLATE':
                return Helper.IS.plate(value) ? value : undefined;

            case 'PRICE':
                return Helper.IS.number(value) ? value : undefined;

            default:
                return Helper.IS.string(value) ? value.trim() || undefined : undefined;
        }
    }

    getColor(): string {
        return this.column.color
            ? typeof this.column.color === 'string'
                ? this.column.color
                : this.column.color(this.item)
            : 'var(--blackColor)';
    }

    click(): void {
        if (!this.action) return;

        if (typeof this.action === 'function') this.action();
        else this.router.navigate(this.action);
    }

    public copied: boolean = false;
    private copyTimeout: any;
    setCopied(): void {
        if (!this.copy) return;
        if (this.copyTimeout) clearTimeout(this.copyTimeout);

        this.copied = true;
        this.copyTimeout = setTimeout(() => {
            this.copied = false;
            this.copyTimeout = undefined;
        }, 2000);
    }
}
