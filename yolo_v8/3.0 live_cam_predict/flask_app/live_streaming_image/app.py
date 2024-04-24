from flask import Flask, render_template, request, jsonify, Response
from ultralytics import YOLO
import cv2
import threading
import time
from PIL import Image
from io import BytesIO
import base64

app = Flask(__name__)

# Configure YOLO model
model = YOLO('best.pt')

# Global variables
process_running = False
stop_thread = False

# Process image from camera
def process_camera_image():
    global process_running
    global stop_thread

    camera = cv2.VideoCapture(0)  # Access the default camera (index 0)

    while not stop_thread:
        if process_running:
            ret, frame = camera.read()  # Read a frame from the camera

            if ret:
                # Convert BGR image to RGB
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

                # Convert RGB image to PIL Image format
                pil_image = Image.fromarray(frame_rgb)

                # Process the PIL image for object detection
                class_names, object_locations = process_image(pil_image)

                # Draw bounding boxes on the original frame
                for location in object_locations:
                    cv2.rectangle(frame, (location[0], location[1]), (location[2], location[3]), (0, 0, 255), 3)

                # Convert the frame back to PIL Image format
                processed_image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

                # Convert the processed image to bytes
                buffered = BytesIO()
                processed_image.save(buffered, format="JPEG")
                img_bytes = base64.b64encode(buffered.getvalue()).decode('utf-8')

                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + img_bytes + b'\r\n')

                time.sleep(1)  # Wait for 1 second before processing the next frame
            else:
                break

    camera.release()
    cv2.destroyAllWindows()
    print("Thread stopped.")

# Process uploaded image
def process_image(image):
    results = model.predict(image, save=False)

    class_names = []
    object_locations = []

    for result in results:
        for box in result.boxes:
            class_id = int(box.data[0][-1])
            class_names.append(model.names[class_id])

            # Get bounding box coordinates
            bbox = [int(coord) for coord in box.xyxy[0]]
            object_locations.append(bbox)

    return class_names, object_locations

# Route for starting and stopping the process
@app.route('/process_control', methods=['POST'])
def process_control():
    global process_running
    global stop_thread

    action = request.form['action']

    if action == 'start':
        if not process_running:
            process_running = True
            stop_thread = False
    elif action == 'stop':
        process_running = False
        stop_thread = True
    return jsonify({'success': True})

# Route for streaming video
@app.route('/stream_video')
def stream_video():
    return Response(process_camera_image(), mimetype='multipart/x-mixed-replace; boundary=frame')

# Route for retrieving processed image
@app.route('/get_processed_image')
def get_processed_image():
    class_names, object_locations, img_bytes = process_camera_image_once()
    return jsonify(class_names=class_names, object_locations=object_locations, img_bytes=img_bytes)

# Helper function to process a single frame for display
def process_camera_image_once():
    camera = cv2.VideoCapture(0)  # Access the default camera (index 0)
    ret, frame = camera.read()  # Read a frame from the camera
    if ret:
        # Convert BGR image to RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        # Convert RGB image to PIL Image format
        pil_image = Image.fromarray(frame_rgb)
        # Process the PIL image for object detection
        class_names, object_locations = process_image(pil_image)
        # Draw bounding boxes on the original frame
        for location in object_locations:
            cv2.rectangle(frame, (location[0], location[1]), (location[2], location[3]), (0, 0, 255), 3)
        # Convert the frame back to PIL Image format
        processed_image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        # Convert the processed image to bytes
        buffered = BytesIO()
        processed_image.save(buffered, format="JPEG")
        img_bytes = base64.b64encode(buffered.getvalue()).decode('utf-8')
        return class_names, object_locations, img_bytes
    return [], [], ""

# Route for homepage
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
