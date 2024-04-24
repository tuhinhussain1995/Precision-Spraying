import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  constructor(private http: HttpClient,
    private router: Router
  ) { }

  isActive(path: string): boolean {
    return this.router.url === path;
  }
}
