import { Injectable } from '@angular/core';

import { Helper } from '@webilix/helper-library';

import { ChartTooltipData } from './chart.type';

@Injectable()
export class ChartService {
    get primaryColor(): string {
        return 'rgb(29, 91, 116)';
    }

    get secondaryColor(): string {
        return 'rgb(142, 173, 186)';
    }

    get accentColor(): string {
        return 'rgb(228, 190, 146)';
    }

    get warnColor(): string {
        return 'rgb(255, 49, 27)';
    }

    get backgroundColor(): string {
        return 'rgb(232, 239, 241)';
    }

    get darkColor(): string {
        return 'rgb(17, 64, 87)';
    }

    tooltipPosition(height: number = 275) {
        return (
            point: [number, number],
            _1: any,
            _2: any,
            _3: any,
            size: { contentSize: [number, number]; viewSize: [number, number] },
        ) => {
            const x: number = point[0] - size.contentSize[0] / 2;
            const maxX: number = window.innerWidth - size.contentSize[0] - 24;
            const y: number = point[1];
            const maxY: number = height / 2;
            return [x < 0 ? 0 : x > maxX ? maxX : x, y < maxY ? y : y - size.contentSize[1] - 24];
        };
    }

    tooltip(header: string, data: ChartTooltipData[], color?: string): string {
        color = color || this.primaryColor;

        const styles = {
            header: `font-weight: 600; padding-bottom: 0.75rem; margin-bottom: 0.25rem; font-size: 12px; color: ${color}; border-bottom: 1px solid ${color}; ; max-width: 200px; overflow: hidden; text-overflow: ellipsis;`,
            divider: `width: 100%; height: 1px; background-color: ${this.secondaryColor}; margin: 0.25rem 0;`,
            item: `display: flex; align-items: center; column-gap: 0.5rem; padding: 0.25rem 0; font-size: 11px;`,
            iColor: `width: 10px; height: 10px; border-radius: 2px;`,
            iTitle: `flex:1;`,
            iValue: `font-weight: 600; text-align: left;`,
            iPercent: `font-weight: 600; text-align: left; width: 35px;`,
        };

        data = data.filter((d, i, a) => d !== 'DIVIDER' || (i !== 0 && a[i - 1] !== 'DIVIDER'));
        while (data[data.length - 1] === 'DIVIDER') data.splice(data.length - 1);

        const items: string[] = data
            .map((d) => {
                if (d === 'DIVIDER') return d;

                const value: string = typeof d.value === 'string' ? d.value : Helper.NUMBER.format(+d.value.toFixed(2));
                return { ...d, value };
            })
            .map((d) =>
                d === 'DIVIDER'
                    ? `<div style="${styles.divider}"></div>`
                    : `<div style="${styles.item}">` +
                      (d.color ? `<div style="background-color: ${d.color}; ${styles.iColor}"></div>` : '') +
                      `<div style="${styles.iTitle}">${d.title}:</div>` +
                      `<div style="${styles.iValue}">` +
                      `${d.prefix || ''}${d.value}${d.suffix || ''}` +
                      `</div>` +
                      (d.percent !== undefined
                          ? `<div style="${styles.iPercent}">${Helper.NUMBER.format(+d.percent.toFixed(2))}%</div>`
                          : '') +
                      `</div>`,
            );

        return `<div style="${styles.header}">${header}</div>` + items.join('');
    }

    getShade(count: number, index: number, color: string): string {
        const r: number = parseInt(color.substring(1, 3), 16);
        const rChange: number = (255 - r) / count;
        const R: string = Math.floor(r + index * rChange)
            .toString(16)
            .padStart(2, '0');

        const g: number = parseInt(color.substring(3, 5), 16);
        const gChange: number = (255 - g) / count;
        const G: string = Math.floor(g + index * gChange)
            .toString(16)
            .padStart(2, '0');

        const b: number = parseInt(color.substring(5, 7), 16);
        const bChange: number = (255 - b) / count;
        const B: string = Math.floor(b + index * bChange)
            .toString(16)
            .padStart(2, '0');

        return `#${R}${G}${B}`.toUpperCase();
    }
}
