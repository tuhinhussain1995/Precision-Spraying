from ultralytics import YOLO

model = YOLO("best.pt")

results = model.predict(source=0, imgsz=320, conf=0.7, show=True)

print(results)