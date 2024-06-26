import { Component, OnDestroy, OnInit, ViewChild, AfterViewInit  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatTabGroup } from '@angular/material/tabs';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { IntroductionDialogComponent } from './introduction-dialog/introduction-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit  {

  isLiveStreaming: boolean = false;
  leftScreenWidth: string = "calc(100% - 20px)";

  totalRows: number = 19;
  totalColumns: number = 10;
  rowsArray: number[] = Array.from({ length: this.totalRows }, (_, i) => i);
  columnsArray: number[] = Array.from({ length: this.totalColumns }, (_, i) => i);
  boxValues: number[][] = Array.from({ length: this.totalRows }, () => Array(this.totalColumns).fill(null));

  @ViewChild(MatTabGroup) tabGroup !: MatTabGroup;

  selectedTabIndex: number = 0;

  constructor(private http: HttpClient,
    private router: Router,
    public dialog: MatDialog
  ) { 
    this.router.navigateByUrl('/live-stream'); 
    this.isLiveStreaming = true;
    this.leftScreenWidth = "72%";
    this.updateAreaAfteTab();
  }

  ngOnInit() {
    
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.tabGroup) {
        this.tabGroup.selectedIndex = 1;
      }
    });
  }

  ngOnDestroy() {
    
  }

  openDialog() {
    this.dialog.open(IntroductionDialogComponent, {
      height: '67%',
      width: '60%',
      backdropClass: 'backdropBackground'
    });
  }

  tabChanged(event: MatTabChangeEvent) {
    this.selectedTabIndex = event.index;
    switch(event.index) {
      case 0:
        this.router.navigateByUrl('/image');
        this.isLiveStreaming = false;
        this.leftScreenWidth = "calc(100% - 20px)";
        this.updateAreaAfteTab();
        break;
      case 1:
        this.router.navigateByUrl('/live-stream');
        this.isLiveStreaming = true;
        this.leftScreenWidth = "72%";
        this.updateAreaAfteTab();
        break;
      default:
        break;
    }
  }

  updateArea(event: { totalRows: number, totalColumns: number }) {
    this.totalRows = event.totalRows;
    this.totalColumns = event.totalColumns;

    this.rowsArray = Array.from({ length: this.totalRows }, (_, i) => i);
    this.columnsArray = Array.from({ length: this.totalColumns }, (_, i) => i);
    this.boxValues = Array.from({ length: this.totalRows }, () => Array(this.totalColumns).fill(null));
  }

  updateAreaAfteTab(){
    this.rowsArray = Array.from({ length: this.totalRows }, (_, i) => i);
    this.columnsArray = Array.from({ length: this.totalColumns }, (_, i) => i);
    this.boxValues = Array.from({ length: this.totalRows }, () => Array(this.totalColumns).fill(null));
  }

  updateRandomBox(randomRow: number, randomCol: number, randomValue: number) {
    this.boxValues[randomRow][randomCol] = randomValue;
  }

  getBoxColor(value: number): string {
    const colors = ['#6495ED', '#FFA500', '#FF4500', '#FF0000'];
    
    if (value > 4) {
      return colors[colors.length - 1];
    }

    if (value < 1) {
      return '#FFFFFF';
    }
    
    const index = Math.min(value - 1, colors.length - 1);
    return colors[index];
  }
}
