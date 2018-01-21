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
          title: {
            text: "Bar Chart"
          },
          series: [
            {
              values: [1, 2, 3]
            }
          ]          
        },
        height: '100%',
        width: '100%'
      },
      {
        id: 'chart-2',
        data: {
          type: 'scatter',
          title: {
            text: "Scatter Chart"
          },
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
        height: '100%',
        width: '100%'
      },
      {
        id: 'chart-3',
        data: {
          type: 'pie',
          title: {
            text: "Pie Chart"
          },
          series: [
            {values: [36]},
            {values: [11]},
            {values: [16]},
            {values: [20]},
            {values: [17]}
          ]
        },
        height: '100%',
        width: '100%'
      },
      {
        id: 'chart-4',
        data: {
          type: 'line',
          title: {
            text: "Line Chart"
          },
          series: [
            { values: [20, 40, 25, 50, 15, 45, 33, 34] },
            { values: [5, 30, 21, 18, 59, 50, 28, 33] },
            { values: [30, 5, 18, 21, 33, 41, 29, 15] }
          ]
        },
        height: '100%',
        width: '100%'
      }
    ];
  }

}
