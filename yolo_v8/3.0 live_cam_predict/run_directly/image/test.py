from ultralytics import YOLO
import cv2
import os
import shutil

# Navigate to the directory
directory = "C:/Users/tuhin/Desktop/Precision-Spraying/yolo_v8/3.0 live_cam_predict/run_directly/image/runs/detect"

# List all directories in the specified directory
directories = [d for d in os.listdir(directory) if os.path.isdir(os.path.join(directory, d))]

# Iterate over each directory and delete it
for d in directories:
    shutil.rmtree(os.path.join(directory, d))

model = YOLO('best.pt')
results = model.predict('pest_snail.jpg', save=True)

class_names = []
object_locations = []

img = cv2.imread('pest_snail.jpg')

for result in results:
    boxes = result.boxes.cpu().numpy()
    for i, box in enumerate(boxes):
        r = box.xyxy[0].astype(int)
        crop = img[r[1]:r[3], r[0]:r[2]]
        cv2.imwrite("cropped_image.jpg", crop)

        object_locations.append(r)

        # Draw bounding box on original image in red color with a thicker line
        cv2.rectangle(img, (r[0], r[1]), (r[2], r[3]), (0, 0, 255), 3)  # BGR color format

    for box in result.boxes:
        class_id = int(box.data[0][-1])
        class_names.append(model.names[class_id])

# Save image with bounding boxes
cv2.imwrite("output.jpg", img)

print("Classes Detected: ", class_names)
print("Objects Locations: ", object_locations)
