import { Component, NgZone, AfterViewInit, OnDestroy } from '@angular/core';
import { Chart } from '../../models/chart.model';

declare var zingchart: any;
/**
 * Generated class for the ZingchartComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'zingchart',
  inputs: ['chart'],
  templateUrl: 'zingchart.html'
})
export class ZingchartComponent implements AfterViewInit, OnDestroy {
  chart: Chart;

  constructor(private zone: NgZone) {
  }

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => zingchart.render(this.chart));
  }

  ngOnDestroy() {
    zingchart.exec(this.chart.id, 'destroy');
  }

}
