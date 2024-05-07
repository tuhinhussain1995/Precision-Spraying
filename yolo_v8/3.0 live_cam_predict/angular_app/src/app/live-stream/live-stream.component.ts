import { Component, ViewChild, ElementRef, OnDestroy, AfterViewChecked, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogConfig  } from '@angular/material/dialog';
import { IntroductionDialogComponent } from '../introduction-dialog/introduction-dialog.component';
import { DashboardDialogComponent } from '../dashboard-dialog/dashboard-dialog.component';

interface CountedItem {
  [key: string]: number;
}
@Component({
  selector: 'app-live-stream',
  templateUrl: './live-stream.component.html',
  styleUrls: ['./live-stream.component.scss']
})
export class LiveStreamComponent implements OnDestroy, AfterViewChecked, OnInit  {
  imageUrl: string = "";
  response: any;
  responseReceived: boolean = false;
  uploadedImage: string = "";

  onProcess: boolean = false;

  current_frame_no: number = 0;
  current_area_no: string = "";

  consoleValue: any = [];
  sprayingResult: any = [];

  finalHeatmap: any = [];
  tempHeatmapData: any = [];
  
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

  dotVisible: boolean = false;
  blinkInterval: any;

  resetWholeProcess: boolean = false;

  @Input() totalRows !: number;
  @Input() totalColumns !: number;
  @Output("updateRandomBox") updateRandomBox: EventEmitter<any> = new EventEmitter();
  @Output() areaApplied: EventEmitter<{ totalRows: number, totalColumns: number }> = new EventEmitter();

  currentProcessingRow: number = 1;
  currentProcessingColumn: number = 1;
  totalColumnCompleted: number = 0;

  isFullScreen: boolean = false;

  pieChart: string = "";
  barChart: string = "";
  lineChart: string = "";
  heatmapChart: string = "";

  @ViewChild('scrollContainer') private scrollContainer !: ElementRef;
  @ViewChild('scrollContainer1') private scrollContainer1 !: ElementRef;

  constructor(private http: HttpClient,
    public dialog: MatDialog,
  ) {
    this.screenHeight = (window.innerHeight - 120) + 'px'; 
    window.addEventListener('resize', () => {
      this.screenHeight = (window.innerHeight - 120) + 'px';
    });

    this.detection_started_time = new Date();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.videoElement = this.video.nativeElement;
  }

  ngAfterViewChecked() {        
    //this.scrollToBottom();        
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
    this.stopBlinking();
  }

  openDialog() {
    this.dialog.open(IntroductionDialogComponent, {
      height: '69%',
      width: '60%',
      backdropClass: 'backdropBackground'
    });
  }

  openDashboardDialog(){
    let result = this.countedDetectedClasses;

    let heatmapData: any = this.finalHeatmap;
    let keys: string[] = [];
    let values: number[] = [];

    result.forEach(item => {
        let key = Object.keys(item)[0];
        let value = item[key];
        keys.push(key); 
        values.push(value); 
    });

    this.http.post<any>('http://localhost:5000/generate_pie_chart', { keys, values, heatmapData })
      .subscribe(response => {
        this.pieChart = response.pieChart;
        this.barChart = response.barChart;
        this.lineChart = response.lineChart;
        this.heatmapChart = response.heatmapChart;

        const dialogConfig = new MatDialogConfig();

        dialogConfig.height = '69%';
        dialogConfig.width = '60%';
        dialogConfig.backdropClass = 'backdropBackground';

        // Pass your data here
        dialogConfig.data = {
          pieChart: this.pieChart,
          barChart: this.barChart,
          lineChart: this.lineChart,
          heatmapChart: this.heatmapChart
        };

        this.dialog.open(DashboardDialogComponent, dialogConfig);
      });
  }

  triggerUpdate(randomRow: number, randomCol: number, randomValue: number) {
    this.updateRandomBox.emit({ randomRow, randomCol, randomValue });

    console.log(randomValue)
  }

  startProcess() {
    if(this.currentProcessingColumn > this.totalColumns){
      window.alert('The Detection Process is already Completed');
      return
    }

    this.resetWholeProcess = true;
    this.onProcess = true;
    this.startCamera();
    this.startBlinking();

    setTimeout(() => {
      this.startInterval();
    }, 1000);
  }

  resetWholeProcessNow(){
    window.location.reload();
  }

  applyArea(){
    this.areaApplied.emit({ totalRows: this.totalRows, totalColumns: this.totalColumns });
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
    
    this.currentProcessingColumn = this.currentProcessingColumn + 1;
    this.totalColumnCompleted = this.totalColumnCompleted + 1;

    if(this.currentProcessingColumn % 2 === 0){
      this.currentProcessingRow = this.totalRows;
    }
    else{
      this.currentProcessingRow = 1;
    }

    clearInterval(this.intervalId);
    this.detection_end_time = new Date();
    this.stopBlinking();

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

        this.current_area_no = "(" + this.currentProcessingColumn + "," + this.currentProcessingRow + ")";
        this.current_frame_no = this.current_frame_no + 1;
        this.total_area_covered = (1*this.current_frame_no) + " Square Meters";

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

        this.triggerUpdate(this.currentProcessingRow-1, this.currentProcessingColumn-1, this.response.class_names.length);

        if(this.currentProcessingColumn % 2 === 0){
          this.currentProcessingRow = this.currentProcessingRow - 1;
        }
        else{
          this.currentProcessingRow = this.currentProcessingRow + 1;
        }

        if(this.totalRows < this.currentProcessingRow || 1 > this.currentProcessingRow){
          this.finalHeatmap.push(this.tempHeatmapData);
          this.tempHeatmapData = []
        }
        else{
          this.tempHeatmapData.push(this.response.class_names.length)
        }

        this.consoleValue.push(consoleValue);

        this.scrollToBottom();
      }, (error) => {
        console.error('API Error:', error);
      });
  }

  startInterval() {
    this.intervalId = setInterval(() => {
      
      if (!this.onProcess) {
        this.stopCamera();
        return
      }

      if(this.totalRows < this.currentProcessingRow || 1 > this.currentProcessingRow){
        this.stopCamera();
        return
      }

      this.takePicture();
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

  startBlinking(): void {
    this.blinkInterval = setInterval(() => {
      this.dotVisible = !this.dotVisible;
    }, 1000);
  }

  stopBlinking(): void {
    clearInterval(this.blinkInterval);
    this.dotVisible = false;
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }

    this.isFullScreen = !this.isFullScreen;
  }
}
