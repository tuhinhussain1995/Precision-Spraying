from flask import Flask, request, send_file
from flask_restful import Api, Resource
import os
import shutil
from ultralytics import YOLO

app = Flask(__name__)
api = Api(app)

# Initialize YOLO model
model = YOLO('best.pt')

class ProcessVideo(Resource):
    def post(self):
        # Receive video file
        video_file = request.files['video']

        # Save video file to a temporary location
        video_path = 'temp_video.mp4'
        video_file.save(video_path)

        # Process the video using YOLO
        results = model.predict(task='detect', mode='predict', model='best.pt', conf=0.25, source=video_path, save=True)

        # Return path to processed video
        processed_video_path = 'processed_video.avi'

        # Move the processed video to the desired location
        shutil.move('runs/detect/predict/video.avi', processed_video_path)

        # Clean up temporary files
        os.remove(video_path)

        # Return processed video
        return send_file(processed_video_path, as_attachment=True)

api.add_resource(ProcessVideo, '/process_video')

if __name__ == '__main__':
    app.run(debug=True)
