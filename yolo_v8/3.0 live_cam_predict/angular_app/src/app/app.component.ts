import { Component, OnDestroy, OnInit  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {

  totalRows: number = 22;
  totalColumns: number = 12;
  rowsArray: number[] = Array.from({ length: this.totalRows }, (_, i) => i);
  columnsArray: number[] = Array.from({ length: this.totalColumns }, (_, i) => i);
  boxValues: number[][] = Array.from({ length: this.totalRows }, () => Array(this.totalColumns).fill(null)); // Initialize an empty array for box values
  intervalId: any;

  constructor(private http: HttpClient,
    private router: Router
  ) { 
    this.router.navigateByUrl('/image'); 
  }

  ngOnInit() {
    this.intervalId = setInterval(() => {
      this.updateRandomBox();
    }, 1000); // Interval set to 1 second (1000 milliseconds)
  }

  ngOnDestroy() {
    clearInterval(this.intervalId); // Clear the interval when the component is destroyed
  }

  tabChanged(event: MatTabChangeEvent) {
    switch(event.index) {
      case 0:
        this.router.navigateByUrl('/image');
        break;
      case 1:
        this.router.navigateByUrl('/video');
        break;
      case 2:
        this.router.navigateByUrl('/live-stream');
        break;
      default:
        break;
    }
  }

  updateRandomBox() {
    const randomRow = Math.floor(Math.random() * this.totalRows);
    const randomCol = Math.floor(Math.random() * this.totalColumns);
    const randomValue = Math.floor(Math.random() * 10) + 1; // Random value between 1 and 10
    this.boxValues[randomRow][randomCol] = randomValue;
  }

  getBoxColor(value: number): string {
    const colors = ['#6495ED', '#7FFFD4', '#ADFF2F', '#97970e', '#FFD700', '#FFA500', '#FF6347', '#FF4500', '#FF0000', '#8B0000'];
    
    if (value > 10) {
      return colors[colors.length - 1];
    }
    
    const index = Math.min(value - 1, colors.length - 1);
    return colors[index];
  }
}
