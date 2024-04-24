import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ImageComponent } from './image/image.component';
import { VideoComponent } from './video/video.component';
import { LiveStreamComponent } from './live-stream/live-stream.component';

@NgModule({
  declarations: [
    AppComponent,
    ImageComponent,
    VideoComponent,
    LiveStreamComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
