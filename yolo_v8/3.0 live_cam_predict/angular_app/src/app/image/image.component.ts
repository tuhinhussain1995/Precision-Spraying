import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrl: './image.component.scss'
})
export class ImageComponent {

  uploadedImage: string = "";
  imageUrl: string = "";
  response: any;
  responseReceived: boolean = false;

  screenHeight: any = "";

  videoProcessed: boolean = false;
  base64Video: string = "";
  videoProcessing: boolean = false;
  imageProcessing: boolean = false;

  constructor(private http: HttpClient) { 
    this.screenHeight = (window.innerHeight - 120) + 'px'; 
    window.addEventListener('resize', () => {
      this.screenHeight = (window.innerHeight - 120) + 'px';
    });
  }

  onFileSelected(event: any): void {
    this.imageProcessing = true;
    this.responseReceived = false;

    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      if (reader.result) {
        this.uploadedImage = reader.result.toString();
        const base64String = reader.result.toString().split(',')[1];
        this.callApi(base64String);
      } else {
        console.error('Failed to read the file.');
      }
    };

    reader.readAsDataURL(file);
  }

  callApi(base64String: string): void {
    const apiUrl = 'http://localhost:5000/process_image';

    this.http.post(apiUrl, { image: base64String })
      .subscribe((res: any) => {
        this.response = res;
        this.responseReceived = true;
        this.imageProcessing = false;
        this.imageUrl = 'data:image/jpeg;base64,' + res.img_bytes; // Assuming the image is JPEG format
      }, (error) => {
        console.error('API Error:', error);
        this.imageProcessing = false;
      });
  }

  onFileSelectedForVideo(event: any) {
    this.videoProcessing = true;
    this.videoProcessed = false;

    const file: File = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('video', file);

      this.http.post<any>('http://localhost:5000/process_video', formData)
        .subscribe(
          response => {
            this.base64Video = response.base64_video;
            this.videoProcessed = true;
            this.videoProcessing = false;
          },
          error => {
            console.error('Error processing video:', error);
            this.videoProcessing = false;
          }
        );
    }
  }

  getVideoUrl(): string {
    return 'data:video/mp4;base64,' + this.base64Video;
  }

}
