import { Injectable } from '@angular/core';

import { Helper } from '@webilix/helper-library';

@Injectable({ providedIn: 'root' })
export class DownloadService {
    csv(name: string, content: string[][]): void {
        const lines: string[] = content.map((c) => c.join(','));

        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(lines.join('\n')));
        element.setAttribute('download', Helper.STRING.getFileName(name, 'csv'));

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();
        document.body.removeChild(element);
    }
}
