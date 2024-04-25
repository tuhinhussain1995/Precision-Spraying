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
  uploadedImage: string = "";

  onProcess: boolean = false;

  current_frame_no: number = 0;
  current_area_no: number = 0;
  consoleValue: any = [];
  
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  videoElement!: HTMLVideoElement;
  stream!: MediaStream | null;

  intervalId: any;

  screenHeight: any = "";

  constructor(private http: HttpClient) {
    this.screenHeight = (window.innerHeight - 120) + 'px'; 
    window.addEventListener('resize', () => {
      this.screenHeight = (window.innerHeight - 120) + 'px';
    });
  }

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

      this.uploadedImage = canvasElement.toDataURL('image/png'); 

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

        this.current_area_no = this.current_area_no + 1;
        this.current_frame_no = this.current_area_no + 1;

        var value = {
          current_frame_no: this.current_frame_no, 
          current_area_no: this.current_area_no,
          class_names: this.response.class_names, 
          object_locations: this.response.class_names
        }

        this.consoleValue.push(value)
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
