import { NgModule } from '@angular/core';
import { NgxEchartsModule } from 'ngx-echarts';

import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { TooltipComponent, GridComponent } from 'echarts/components';
echarts.use([CanvasRenderer, TooltipComponent, GridComponent, BarChart, LineChart, PieChart]);

import { ChartService } from './chart.service';

@NgModule({
    imports: [NgxEchartsModule.forRoot({ echarts })],
    providers: [ChartService],
    exports: [NgxEchartsModule],
})
export class ChartModule {}
