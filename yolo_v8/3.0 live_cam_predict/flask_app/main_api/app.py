from flask import Flask, request, jsonify
from ultralytics import YOLO
import cv2
from PIL import Image
from io import BytesIO
import base64
import numpy as np

app = Flask(__name__)

# Configure YOLO model
model = YOLO('best.pt')

# Process image function
def process_image(base64_string):
    # Convert base64 string to bytes
    image_bytes = base64.b64decode(base64_string)
    
    # Convert bytes to PIL Image
    image = Image.open(BytesIO(image_bytes))

    # Process the image for object detection
    results = model.predict(image, save=False)

    # Initialize an empty list to store class names and object locations
    class_names = []
    object_locations = []

    # Convert PIL Image to OpenCV format
    img = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

    # Iterate through the results
    for result in results:
        # Iterate through each detected object in the result
        for box in result.boxes:
            # Extract class ID and class name
            class_id = int(box.data[0][-1])
            class_name = model.names[class_id]
            class_names.append(class_name)

            # Get bounding box coordinates
            bbox = [int(coord) for coord in box.xyxy[0]]
            object_locations.append(bbox)

            # Draw bounding box on the OpenCV image
            cv2.rectangle(img, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 0, 255), 3)

    # Convert the processed image to base64 string
    _, buffer = cv2.imencode('.jpg', img)
    img_bytes = base64.b64encode(buffer).decode('utf-8')

    return class_names, object_locations, img_bytes

# API endpoint for processing images
@app.route('/process_image', methods=['POST'])
def process_uploaded_image():
    if 'image' not in request.json:
        return jsonify({'error': 'No image provided'}), 400

    # Get base64 encoded image string from request
    image_base64 = request.json['image']

    # Process the image
    class_names, object_locations, img_bytes = process_image(image_base64)

    # Return the result
    return jsonify({'class_names': class_names, 'object_locations': object_locations, 'img_bytes': img_bytes})

if __name__ == '__main__':
    app.run(debug=True)
