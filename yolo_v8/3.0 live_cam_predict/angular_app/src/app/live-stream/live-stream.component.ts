import { Component, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-live-stream',
  templateUrl: './live-stream.component.html',
  styleUrls: ['./live-stream.component.scss']
})
export class LiveStreamComponent implements OnDestroy {
  imageUrl: string = "";
  response: any;
  responseReceived: boolean = false;

  onProcess: boolean = false;
  
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  videoElement!: HTMLVideoElement;
  stream!: MediaStream | null;

  intervalId: any;

  constructor(private http: HttpClient) {}

  ngAfterViewInit() {
    this.videoElement = this.video.nativeElement;
  }

  ngOnDestroy() {
    this.stopCamera();
    this.onProcess = false;
    clearInterval(this.intervalId);
  }

  startProcess() {
    this.onProcess = true;
    this.startCamera();

    setTimeout(() => {
      this.startInterval();
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
    this.onProcess = false;
    clearInterval(this.intervalId);

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
      
      this.callApi(base64ImageData);
    } else {
      console.error('Video element or canvas context is not initialized.');
    }
  }

  callApi(base64String: string): void {
    const apiUrl = 'http://localhost:5000/process_image';

    this.http.post(apiUrl, { image: base64String })
      .subscribe((res: any) => {
        this.response = res;
        this.responseReceived = true;

        this.imageUrl = 'data:image/jpeg;base64,' + res.img_bytes; // Assuming the image is JPEG format
      }, (error) => {
        console.error('API Error:', error);
      });
  }

  startInterval() {
    this.intervalId = setInterval(() => {
      this.takePicture();

      if (!this.onProcess) {
        this.stopCamera();
      }
    }, 1000);
  }
}
