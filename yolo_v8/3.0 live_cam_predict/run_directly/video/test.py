import os
import shutil
from ultralytics import YOLO

model = YOLO('best.pt')

# Navigate to the directory
directory = "C:/Users/tuhin/Desktop/Precision-Spraying/yolo_v8/3.0 live_cam_predict/run_directly/video/runs/detect"

# List all directories in the specified directory
directories = [d for d in os.listdir(directory) if os.path.isdir(os.path.join(directory, d))]

# Iterate over each directory and delete it
for d in directories:
    shutil.rmtree(os.path.join(directory, d))

results = model.predict(task='detect', mode='predict', model='best.pt', conf=0.25, source='video.mp4', save=True)

frame_no = 0
class_name = ""
object_location = ""

for result in results:
    boxes = result.boxes.cpu().numpy()
    frame_no += 1
    for i, box in enumerate(boxes):
        r = box.xyxy[0].astype(int)
        object_location = r

    for box in result.boxes:
        class_id = int(box.data[0][-1])
        class_name = model.names[class_id]

    if(class_name != ''):
        print("Frame: {:<8} Class: {:<20} Object Location: {}".format(str(frame_no), class_name, object_location))

    class_name = ""
    object_location = ""