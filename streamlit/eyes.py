import streamlit as st
import cv2
import dlib
from imutils import face_utils

# Load dlib's face detector and facial landmarks predictor
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")

# Function to calculate eye aspect ratio
def eye_aspect_ratio(eye):
    # Compute the euclidean distances between the two sets of vertical eye landmarks (x, y)-coordinates
    A = cv2.norm(eye[1] - eye[5])
    B = cv2.norm(eye[2] - eye[4])
    C = cv2.norm(eye[0] - eye[3])

    # Compute the eye aspect ratio
    ear = (A + B) / (2.0 * C)
    return ear

# Threshold to determine if the eyes are closed
EYE_ASPECT_RATIO_THRESHOLD = 0.2

# Open the webcam
cap = cv2.VideoCapture(0)

st.title("Eye State Detection")
st.write("Checking if eyes are closed or open...")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Convert the image to grayscale for better face detection
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Detect faces in the image
    faces = detector(gray)

    for face in faces:
        # Get the facial landmarks
        landmarks = predictor(gray, face)
        landmarks = face_utils.shape_to_np(landmarks)

        # Extract the left and right eye coordinates
        left_eye = landmarks[42:48]
        right_eye = landmarks[36:42]

        # Calculate the eye aspect ratio for both eyes
        left_ear = eye_aspect_ratio(left_eye)
        right_ear = eye_aspect_ratio(right_eye)

        # Average the eye aspect ratio
        ear = (left_ear + right_ear) / 2.0

        # Check if the eyes are closed
        if ear < EYE_ASPECT_RATIO_THRESHOLD:
            eye_status = "Eyes Closed"
        else:
            eye_status = "Eyes Open"

        # Display the result on the frame
        cv2.putText(frame, f"Eye Status: {eye_status}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

        # Draw the landmarks and eye contours
        cv2.polylines(frame, [left_eye], isClosed=True, color=(0, 255, 0), thickness=2)
        cv2.polylines(frame, [right_eye], isClosed=True, color=(0, 255, 0), thickness=2)

    # Show the frame in the Streamlit app
    st.image(frame, channels="BGR", use_column_width=True)

# Release the webcam and close the app
cap.release()
cv2.destroyAllWindows()
