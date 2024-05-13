import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dashboard-dialog',
  templateUrl: './dashboard-dialog.component.html',
  styleUrl: './dashboard-dialog.component.scss'
})
export class DashboardDialogComponent implements OnInit {

  pieChart: string = "";
  barChart: string = "";
  lineChart: string = "";
  heatmapChart: string = "";

  pieChart_desc: string = ""
  barChart_desc: string = ""
  lineChart_desc: string = ""
  heatmapChart_desc: string = ""

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.pieChart = this.data.pieChart;
    this.barChart = this.data.barChart;
    this.lineChart = this.data.lineChart;
    this.heatmapChart = this.data.heatmapChart;

    this.pieChart_desc = this.data.pieChart_desc;
    this.barChart_desc = this.data.barChart_desc;
    this.lineChart_desc = this.data.lineChart_desc;
    this.heatmapChart_desc = this.data.heatmapChart_desc;

    console.log(this.data)
  }

}
