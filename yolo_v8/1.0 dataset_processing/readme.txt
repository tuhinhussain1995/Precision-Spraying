Follow the codes inside "Rename Image and Create Label.ipynb":
-------------------------------------------------------------

1. Rename Images inside folder name
	'/home/tuhin/Desktop/image_processing/images'

2. Go inside "labelImg" and open a terminal and run "python labelImg.py" and label all the images

3. Create Directory:
	/home/tuhin/Desktop/image_processing¶
	Inside image_processing there are 5 folders images and labels.
	images => Here put all the images folders.
	labels => Here put all the labels folders.
	test => test images and labels (inside create two folders images and labels)
	train => train images and labels (inside create two folders images and labels)
	valid => valid images and labels (inside create two folders images and labels)
	Note: before run the below codes place all the image and label folders inside images and labels
	 	and make sure test, train and valid are empty.
	
4. Update Label indexing and before place all the labels inside 
	'/home/tuhin/Desktop/image_processing/labels'
	
5. Split train, valid and test using 70%, 20% and 10%

6. Keep the number of images inside each directory and put all these images inside directory (optional)
	/home/tuhin/Desktop/image_processing/images
