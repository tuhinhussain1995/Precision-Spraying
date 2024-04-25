import { Component, ViewChild, ElementRef, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-live-stream',
  templateUrl: './live-stream.component.html',
  styleUrls: ['./live-stream.component.scss']
})
export class LiveStreamComponent implements OnDestroy {
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  videoElement!: HTMLVideoElement;
  stream!: MediaStream | null;

  constructor() {}

  ngAfterViewInit() {
    this.videoElement = this.video.nativeElement;
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  startProcess() {
    this.startCamera();

    setTimeout(() => {
      this.takePicture();
    }, 1000);
  }

  startCamera() {
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: 'environment' },
      })
      .then(stream => {
        this.videoElement.srcObject = stream;
        this.stream = stream;
      })
      .catch(error => {
        console.error('Error accessing webcam:', error);
      });
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
      });
    }
  }

  takePicture() {
    const canvasElement = this.canvas.nativeElement;
    const context = canvasElement.getContext('2d');

    if (this.videoElement && context) {
      canvasElement.width = this.videoElement.videoWidth;
      canvasElement.height = this.videoElement.videoHeight;

      context.drawImage(this.videoElement, 0, 0, canvasElement.width, canvasElement.height);

      // Convert the canvas content to a base64 string
      const base64ImageData = canvasElement.toDataURL('image/png').split(',')[1]; // Extract base64 string after comma
      console.log('Base64 Image:', base64ImageData);
    } else {
      console.error('Video element or canvas context is not initialized.');
    }
  }
}
