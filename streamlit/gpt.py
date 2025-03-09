import cv2
import streamlit as st
import numpy as np

# Load the cascade classifiers for face and eye detection
face_cascade = cv2.CascadeClassifier('Closed-Eye-Detection-with-opencv/haarcascade_frontalface_alt.xml')
eye_cascade = cv2.CascadeClassifier('Closed-Eye-Detection-with-opencv/haarcascade_eye_tree_eyeglasses.xml')

# Check if the cascades are loaded properly
if face_cascade.empty():
    st.error("Face Cascade not loaded! Please check the path.")
if eye_cascade.empty():
    st.error("Eye Cascade not loaded! Please check the path.")

# Set up Streamlit app
st.title('Face and Eye Detection Streamlit App')

# Placeholder for the video feed
video_feed = st.empty()

# Set up video capture
cap = cv2.VideoCapture(0)

while True:
    ret, img = cap.read()
    if not ret:
        st.error("Failed to capture video!")
        break

    # Convert the image to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Detect faces
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    if len(faces) > 0:
        for (x, y, w, h) in faces:
            # Draw a rectangle around the face
            cv2.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)

            # Region of interest (ROI) for eyes within the detected face
            roi_gray = gray[y:y + h, x:x + w]
            roi_color = img[y:y + h, x:x + w]

            # Detect eyes
            eyes = eye_cascade.detectMultiScale(roi_gray)

            # If no eyes are detected, label as "Eyes Closed"
            if len(eyes) == 0:
                cv2.putText(img, 'Eyes Closed', (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
            else:
                cv2.putText(img, 'Eyes Open', (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)

            # Optionally, draw rectangles around detected eyes
            for (ex, ey, ew, eh) in eyes:
                cv2.rectangle(roi_color, (ex, ey), (ex + ew, ey + eh), (255, 0, 0), 2)

    # Convert the BGR image to RGB (Streamlit expects RGB)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    # Display the image in the Streamlit app
    video_feed.image(img_rgb, channels="RGB", use_container_width=True)

    # Break the loop if 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
