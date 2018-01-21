import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Chart } from '../../models/chart.model';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  charts: Chart[];

  constructor(public navCtrl: NavController) {
    this.charts = [
      {
        id: 'chart-1',
        data: {
          type: 'bar',
          series: [
            {
              values: [1, 2, 3]
            }
          ]          
        },
        height: 400,
        width: '100%'
      },
      {
        id: 'chart-2',
        data: {
          type: 'scatter',
          series: [
            {
              values: [
                [1, 1],
                [2, 2],
                [3, 3],
                [4, 4]
              ]
            }
          ]
        },
        height: 400,
        width: '100%'
      }
    ];
  }

}
