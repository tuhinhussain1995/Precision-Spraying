import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImageComponent } from './image/image.component';
import { VideoComponent } from './video/video.component';
import { LiveStreamComponent } from './live-stream/live-stream.component';

const routes: Routes = [
  { path: 'image', component: ImageComponent },
  { path: 'video', component: VideoComponent },
  { path: 'live-stream', component: LiveStreamComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
