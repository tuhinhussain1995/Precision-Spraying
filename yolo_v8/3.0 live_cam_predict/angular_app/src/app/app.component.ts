import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  constructor(private http: HttpClient,
    private router: Router
  ) { 
    this.router.navigateByUrl('/image');
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
}
