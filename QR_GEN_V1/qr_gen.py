import sys
import time
import cv2
import uuid
import qrcode
from picamera2 import Picamera2

# -------------------------------------------------
# Load COCO class names
# -------------------------------------------------
class_names = []
class_file = "/home/vishnu/Desktop/Object_Detection_Files/coco.names"
with open(class_file, "rt") as f:
    class_names = f.read().rstrip("\n").split("\n")

# -------------------------------------------------
# Paths to the model files
# -------------------------------------------------
config_path  = "/home/vishnu/Desktop/Object_Detection_Files/ssd_mobilenet_v3_large_coco_2020_01_14.pbtxt"
weights_path = "/home/vishnu/Desktop/Object_Detection_Files/frozen_inference_graph.pb"

# -------------------------------------------------
# Load the DNN detection model
# -------------------------------------------------
net = cv2.dnn.DetectionModel(weights_path, config_path)
net.setInputSize(320, 320)
net.setInputScale(1.0 / 127.5)
net.setInputMean((127.5, 127.5, 127.5))
net.setInputSwapRB(True)


def get_objects(img, thres=0.45, nms=0.2, draw=True, objects=None):
    """
    Detect objects in the given image using the loaded DNN model.
    Returns the annotated image and a list of [box, className].
    """
    if objects is None:
        objects = class_names

    class_ids, confidences, bboxes = net.detect(img,
                                                confThreshold=thres,
                                                nmsThreshold=nms)
    object_info = []

    if len(class_ids) != 0:
        for class_id, confidence, box in zip(class_ids.flatten(),
                                             confidences.flatten(),
                                             bboxes):
            class_name = class_names[class_id - 1]
            if class_name in objects:
                object_info.append([box, class_name])
                if draw:
                    cv2.rectangle(img, box, color=(0, 255, 0), thickness=2)
                    cv2.putText(img,
                                f"{class_name.upper()} {confidence*100:.1f}%",
                                (box[0] + 10, box[1] + 30),
                                cv2.FONT_HERSHEY_COMPLEX,
                                0.7,
                                (0, 255, 0),
                                2)
    return img, object_info


def generate_qr_code(user_id=None):
    """
    Generates a QR code with a unique referral/green credit ID.
    Returns the QR code image.
    """
    if user_id is None:
        # Generate a unique code for this transaction
        user_id = str(uuid.uuid4())

    qr_data = f"GREEN_CREDIT:{user_id}"
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(qr_data)
    qr.make(fit=True)
    qr_img = qr.make_image(fill="black", back_color="white")
    return qr_img, qr_data


if __name__ == "__main__":
    picam2 = Picamera2()
    preview_config = picam2.create_preview_configuration(main={"size": (640, 480)})
    picam2.configure(preview_config)
    picam2.start()

    print("Press 'q' to quit.")
    last_detected_time = 0
    cooldown_seconds = 3  # prevent multiple QR generation for the same item

    try:
        while True:
            frame = picam2.capture_array()        # RGB
            frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)

            # Only look for recyclable items
            result_frame, object_info = get_objects(frame, 0.45, 0.2,
                                                    objects=['bottle','plate','wine glass','cup','book','cell phone','keyboard','mouse','remote','laptop'])
            
            current_time = time.time()
            if object_info and (current_time - last_detected_time > cooldown_seconds):
                last_detected_time = current_time
                print(f"Detected recyclable item(s): {[obj[1] for obj in object_info]}")

                # Generate QR code
                qr_img, qr_data = generate_qr_code()
                print(f"Generated GREEN CREDIT QR: {qr_data}")
                qr_img_path = f"/home/vishnu/Desktop/Object_Detection_Files/qrgen/green_qr_{int(time.time())}.png"
                qr_img.save(qr_img_path)
                print(f"QR Code saved at: {qr_img_path}")

            cv2.imshow("Object Detection Output", result_frame)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    finally:
        cv2.destroyAllWindows()
        picam2.stop()