
Installation:
=============
Make sure you have installed below python packages before you start setting up your machine for training ::

    $ pip3 install opencv-python
	$ pip3 install imutils
	$ pip3 install matplotlib
	$ pip3 install torchvision
	$ pip3 install torch
	$ pip3 install boto3
	$ pip3 install pandas
	$ pip3 install urllib3

Step 1:
=============
Clone the repository and open ssd mobile-net folder.

 	## Directory Descriptions:
	data: that stores all of images and annotation data and that images and annotation will use to train the model.
	models: after train the models will save inside this directory.
	videos: to generate the train images we can put a video file in this directory and by using the prepare_dataset.py we can generate the images from this video.
	vision: this directory contains all the Python codes files that will help to preprocess the dataset, train and validate the model.
	prepare_dataset.py: this is the code that helps to generate the images from the video file that we places inside directory videos.
 
Step 2:
=============
Record a video of your dataset and upload it in directory videos and then run prepare_dataset.py to generate images from the video file.


Step 3:
=============
With the help of labelImg generate the annotations from the images. So clone the labelImg repository and run python3 labelImg.py to open the GUI for labelImg. Here you just need to label of the images manually.
https://github.com/HumanSignal/labelImg


Step 4:
=============
Now create a file named labels.txt inside data/model0110/Annotation/labels.txt and write down all the labels name inside this file.

Step 5:
=============
Now open a terminal and run the following command to train and generate the model.

	$ python3 train_ssd.py --dataset-type=voc --data=data/model0110/ --model-dir=models/model0110 --batch-size=2 --workers=2 --epochs=500

 ![1](https://github.com/tuhinhussain1995/Precision-Spraying/assets/50451175/c2e91980-7fb0-473c-83d5-d3c6ac3afc7c)


Step 6:
=============
After complete all the epochs to check the best model run the following command from the root directory and this will show a graph when the train started and how did the loss reducted throwout the whole process. And also you can see which epoch generated the best model with lowest loss.

	$ python3 result.py

 ![2](https://github.com/tuhinhussain1995/Precision-Spraying/assets/50451175/df405cc1-5798-4aa9-90d8-711cf12d17ad)


Step 7:
=============
Now use this best model to predict the input images, videos and live streaming inputs.

