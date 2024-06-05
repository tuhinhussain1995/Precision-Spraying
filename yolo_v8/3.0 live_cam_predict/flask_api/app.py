from flask import Flask, request, jsonify, send_file
from flask_restful import Api, Resource
from flask_cors import CORS
from ultralytics import YOLO
import matplotlib.pyplot as plt
import cv2
from PIL import Image
from io import BytesIO
import base64
import numpy as np
import os
import shutil
import seaborn as sns
from moviepy.editor import VideoFileClip

app = Flask(__name__)
api = Api(app)
CORS(app)  # Enable CORS for all routes

# Configure YOLO model
model = YOLO('best_latest.pt')

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

@app.route('/process_video', methods=['POST'])
def process_uploaded_video():
    if 'video' not in request.files:
        return jsonify({'error': 'No video provided'}), 400

    # Navigate to the directory
    directory = os.path.abspath("./runs/detect")

    # List all directories in the specified directory
    directories = [d for d in os.listdir(directory) if os.path.isdir(os.path.join(directory, d))]

    # Iterate over each directory and delete it
    for d in directories:
        shutil.rmtree(os.path.join(directory, d))

    # Receive video file
    video_file = request.files['video']

    # Save video file to a temporary location
    video_path = 'processed_video.avi'
    video_file.save(video_path)

    # Process the video using YOLO
    results = model.predict(task='detect', mode='predict', model='best_latest.pt', conf=0.25, source=video_path, save=True)

    # Return path to processed video
    processed_video_path = os.path.abspath("./runs/detect/predict/processed_video.avi")

    output_path = os.path.abspath("./runs/detect/predict/processed_video.mp4")

    convert_video(processed_video_path, output_path)

    base64_video = ""

    try:
        # Read the video file
        with open(output_path, 'rb') as f:
            video_data = f.read()

        # Convert the video data to base64
        base64_video = base64.b64encode(video_data).decode('utf-8')

    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    # Return processed video
    return jsonify({'base64_video': base64_video})

def convert_video(input_path, output_path, output_format='mp4'):
    # Load the video clip
    video_clip = VideoFileClip(input_path)
    
    # Set output format and save the video clip
    video_clip.write_videofile(output_path, codec='libx264', audio_codec='aac', fps=24, preset='ultrafast')
    
    # Close the video clip
    video_clip.close()

@app.route('/generate_charts', methods=['POST'])
def generate_pie_chart():
    data = request.json  # Assuming the data is sent in JSON format
    keys = data['keys']
    values = data['values']
    heatmapData = data['heatmapData']
    
    # Set the font size for all plots
    plt.rcParams.update({'font.size': 18})

    # Generate pie chart with seaborn
    plt.figure(figsize=(8, 8))
    colors = sns.color_palette('pastel', len(keys))
    plt.pie(values, labels=keys, autopct='%1.1f%%', colors=colors, textprops={'fontsize': 18})
    plt.axis('equal')
    plt.title('Pie Chart', fontsize=20)
    
    # Convert pie chart to base64
    buffer = BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)
    pieChart = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close()

    # Generate bar chart
    plt.figure(figsize=(10, 6))
    sns.barplot(x=keys, y=values, palette='viridis')
    plt.xlabel('Categories', fontsize=16)
    plt.ylabel('Counts', fontsize=16)
    plt.title('Bar Chart', fontsize=18)
    
    # Convert bar chart to base64
    buffer = BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)
    barChart = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close()

    value1 = []
    value2 = []

    for idx, row in enumerate(heatmapData):
        for idy, val in enumerate(row):
            value1.append(idx * len(row) + idy + 1)
            value2.append(val)

    max_value = max(value2)
    min_value = min(value2)

    # Generate line graph
    plt.figure(figsize=(8, 6))
    plt.plot(value1, value2, marker='o', color='skyblue', linestyle='-')
    plt.xlabel('X Axis', fontsize=16)
    plt.ylabel('Y Axis', fontsize=16)
    plt.title('Line Graph', fontsize=18)
    
    # Convert line graph to base64
    buffer = BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)
    lineChart = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close()

    # Generate heatmap
    heatmap_data = np.array(heatmapData)
    max_heatmap_value = heatmap_data.max()
    min_heatmap_value = heatmap_data.min()
    
    plt.figure(figsize=(8, 6))
    sns_plot = sns.heatmap(heatmap_data, annot=True, cmap='viridis', annot_kws={'size': 12})

    # Set x and y axis labels
    sns_plot.set_xlabel('X Axis', fontsize=16, labelpad=10)  # Adjust fontsize and labelpad as needed
    sns_plot.set_ylabel('Y Axis', fontsize=16, labelpad=10)  # Adjust fontsize and labelpad as needed
    plt.title('Heatmap', fontsize=18)
    
    # Convert heatmap to base64
    buffer = BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)
    heatmapChart = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close()

    pieChart_desc = f'A pie chart showing the distribution of categories: {", ".join(keys)} with corresponding values: {", ".join(map(str, values))}. This chart visually represents the proportion of each category relative to the total.'

    barChart_desc = f'A bar chart displaying the frequency of occurrence for categories: {", ".join(keys)} with corresponding values: {", ".join(map(str, values))}. This chart helps in comparing the quantities of different categories side by side.'

    lineChart_desc = f'A line graph showing the data trend across points. The data points are: {value1} with corresponding values: {value2}. The y-values range from a minimum of {min_value} to a maximum of {max_value}, providing insights into the variations over the given sequence.'

    heatmapChart_desc = f'A heatmap indicating the intensity of data values within a matrix. The data ranges from a minimum value of {min_heatmap_value} to a maximum value of {max_heatmap_value}, showing relationships between different data points in a grid format.'

    return jsonify({'pieChart': pieChart, 'barChart': barChart, 'lineChart': lineChart, 'heatmapChart': heatmapChart, 
                    'pieChart_desc': pieChart_desc,
                    'barChart_desc': barChart_desc,
                    'lineChart_desc': lineChart_desc,
                    'heatmapChart_desc': heatmapChart_desc})



if __name__ == '__main__':
    app.run(debug=True)
