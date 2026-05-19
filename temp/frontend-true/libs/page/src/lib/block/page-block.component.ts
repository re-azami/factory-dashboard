import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IPageBlock } from '@lib/page';
import { Helper } from '@webilix/helper-library';

@Component({
    selector: 'page-block',
    templateUrl: './page-block.component.html',
    styleUrl: './page-block.component.scss',
    standalone: false,
})
export class PageBlockComponent implements OnChanges {
    @Input({ required: true }) blocks!: IPageBlock[];
    @Input({ required: false }) column: number = 2;
    @Input({ required: false }) border: boolean = true;

    public columns: string = '';
    public values: (string | null)[] = [];

    ngOnChanges(changes: SimpleChanges): void {
        this.columns = [...Array(this.column)].fill('1fr').join(' ');
        this.values = this.blocks.map((b) => {
            const value = b.value;

            // EMPTY
            if (Helper.IS.empty(value)) return null;

            // STRING
            if (typeof value === 'string' && value.trim && !!value.trim()) return value.trim();

            // NUMBER
            if (typeof value === 'number') return Helper.NUMBER.format(value);

            return null;
        });
    }
}
