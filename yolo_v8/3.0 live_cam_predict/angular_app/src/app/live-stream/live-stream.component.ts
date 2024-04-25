import { Component, ViewChild, ElementRef, OnDestroy, AfterViewChecked } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface CountedItem {
  [key: string]: number;
}
@Component({
  selector: 'app-live-stream',
  templateUrl: './live-stream.component.html',
  styleUrls: ['./live-stream.component.scss']
})
export class LiveStreamComponent implements OnDestroy, AfterViewChecked {
  imageUrl: string = "";
  response: any;
  responseReceived: boolean = false;
  uploadedImage: string = "";

  onProcess: boolean = false;

  current_frame_no: number = 0;
  current_area_no: number = 0;

  consoleValue: any = [];
  sprayingResult: any = [];
  
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  videoElement!: HTMLVideoElement;
  stream!: MediaStream | null;

  intervalId: any;
  screenHeight: any = "";

  detection_started_time: any = "";
  total_area_covered: any = "";
  detection_end_time: any = "";
  countedDetectedClasses: any[] = [];

  chatgptConsultant: boolean = false;

  @ViewChild('scrollContainer') private scrollContainer !: ElementRef;
  @ViewChild('scrollContainer1') private scrollContainer1 !: ElementRef;

  constructor(private http: HttpClient) {
    this.screenHeight = (window.innerHeight - 120) + 'px'; 
    window.addEventListener('resize', () => {
      this.screenHeight = (window.innerHeight - 120) + 'px';
    });

    this.detection_started_time = new Date();
  }

  ngAfterViewInit() {
    this.videoElement = this.video.nativeElement;
  }

  ngAfterViewChecked() {        
    this.scrollToBottom();        
  } 

  scrollToBottom(): void {
      try {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        this.scrollContainer1.nativeElement.scrollTop = this.scrollContainer1.nativeElement.scrollHeight;
      } catch(err) { }                 
  }

  ngOnDestroy() {
    this.stopCamera();
    this.onProcess = false;
    clearInterval(this.intervalId);
  }

  startProcess() {
    this.onProcess = true;
    this.startCamera();
    this.chatgptConsultant = false;

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
    this.detection_end_time = new Date();
    this.chatgptConsultant = true;

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
        this.current_frame_no = this.current_frame_no + 1;
        this.total_area_covered = (1*this.current_area_no) + " Square Meters";

        var consoleValue = {
          current_frame_no: this.current_frame_no, 
          current_area_no: this.current_area_no,
          class_names: this.response.class_names, 
          object_locations: this.response.object_locations,
          color: "",
        }

        if(this.response.class_names.length > 0){
          var counter = 0;
          var suspectDetected: boolean = false;

          for (let item of this.response.class_names) {
            this.addToCountedDetectedClasses(item);

            var sprayingResultValue = {
              current_frame_no: this.current_frame_no, 
              current_area_no: this.current_area_no,
              class_names: item, 
              object_locations: this.response.object_locations[counter],
              color: "",
              need_to_spray_chemical: false,
              chemical_group_name: "",
              chemical_name: ""
            }

            if(item.split("_")[0] == "pest"){
              sprayingResultValue.color = "red";
              sprayingResultValue.need_to_spray_chemical = true;
              sprayingResultValue.chemical_group_name = "Cyfluthrin";
              sprayingResultValue.chemical_name = "Apply Pest Control Chemical";
              suspectDetected = true;

              consoleValue.color = "red";
            }
            else if(item.split("_")[0] == "weed"){
              sprayingResultValue.color = "red";
              sprayingResultValue.need_to_spray_chemical = true;
              sprayingResultValue.chemical_group_name = "Glyphosate";
              sprayingResultValue.chemical_name = "Apply Weed Control Chemical"
              suspectDetected = true;

              consoleValue.color = "red";
            }
            else if(item.split("_")[0] == "disease"){
              sprayingResultValue.color = "red";
              sprayingResultValue.need_to_spray_chemical = true;
              sprayingResultValue.chemical_group_name = "Sulphur fungicides";
              sprayingResultValue.chemical_name = "Apply Disease Control Chemical"
              suspectDetected = true;

              consoleValue.color = "red";
            }
            else{
              sprayingResultValue.color = "green";
              sprayingResultValue.need_to_spray_chemical = false;
              sprayingResultValue.chemical_name = ""

              if(!suspectDetected){
                consoleValue.color = "green";
              }
            }

            this.sprayingResult.push(sprayingResultValue);
            counter = counter + 1;
          }
        }

        this.consoleValue.push(consoleValue);

        this.scrollToBottom();
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

  addToCountedDetectedClasses(itemName: string): void {
    const index = this.countedDetectedClasses.findIndex(item => item[itemName] !== undefined);

    if (index !== -1) {
        this.countedDetectedClasses[index][itemName]++;
    } else {
        const newItem: CountedItem = {};
        newItem[itemName] = 1;
        this.countedDetectedClasses.push(newItem);
    }
  }

  getKey(item: CountedItem): string {
    return Object.keys(item)[0];
  }
}
