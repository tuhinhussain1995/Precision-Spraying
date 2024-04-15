from ultralytics import YOLO

model = YOLO("best.pt")

results = model.predict(source=0, imgsz=640, conf=0.6, show=True)

print(results)

