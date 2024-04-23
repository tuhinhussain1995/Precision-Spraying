from flask import Flask, render_template, request, redirect, url_for
from werkzeug.utils import secure_filename
from ultralytics import YOLO
import cv2
import os

app = Flask(__name__)

# Configure YOLO model
model = YOLO('best.pt')

# Define upload folder and allowed extensions
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Check if file extension is allowed
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Process uploaded image
def process_image(image_path):
    results = model.predict(image_path, save=False)

    class_names = []
    object_locations = []

    img = cv2.imread(image_path)

    for result in results:
        boxes = result.boxes.cpu().numpy()
        for box in boxes:
            r = box.xyxy[0].astype(int)
            object_locations.append(r)

            # Draw bounding box on original image in red color with a thicker line
            cv2.rectangle(img, (r[0], r[1]), (r[2], r[3]), (0, 0, 255), 3)  # BGR color format

        for box in result.boxes:
            class_id = int(box.data[0][-1])
            class_names.append(model.names[class_id])

    # Save image with bounding boxes
    output_image_path = 'static/output.png'
    cv2.imwrite(output_image_path, img)

    return class_names, object_locations

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        # Check if the post request has the file part
        if 'file' not in request.files:
            return redirect(request.url)

        file = request.files['file']

        # If user does not select file, browser also submit an empty part without filename
        if file.filename == '':
            return redirect(request.url)

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)

            # Process the uploaded image
            class_names, object_locations = process_image(file_path)

            return render_template('result.html', filename=filename, class_names=class_names, object_locations=object_locations)

    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
