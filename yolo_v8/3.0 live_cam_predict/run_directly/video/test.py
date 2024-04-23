from ultralytics import YOLO
import cv2

model = YOLO('best.pt')
results = model.predict('pest_snail.jpg')

class_name = ""
object_location = ""

img = cv2.imread('pest_snail.jpg')

for result in results:
    boxes = result.boxes.cpu().numpy()
    for i, box in enumerate(boxes):
        r = box.xyxy[0].astype(int)
        crop = img[r[1]:r[3], r[0]:r[2]]
        cv2.imwrite(str(i) + ".jpg", crop)

        object_location = r

    for box in result.boxes:
        class_id = int(box.data[0][-1])
        class_name = model.names[class_id]

print("Class Detected: ", class_name)
print("Object Location: ", object_location)