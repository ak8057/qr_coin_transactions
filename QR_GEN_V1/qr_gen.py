import sys
import time
import cv2
import uuid
import qrcode
import RPi.GPIO as GPIO
from picamera2 import Picamera2

# -------------------------------------------------
# GPIO setup
# -------------------------------------------------
BUTTON_PIN = 17  # push button input
LED_PIN = 27     # LED output

GPIO.setmode(GPIO.BCM)
GPIO.setup(BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
GPIO.setup(LED_PIN, GPIO.OUT)
GPIO.output(LED_PIN, GPIO.LOW)

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

# -------------------------------------------------
# Recyclable items and GreenCoin values
# -------------------------------------------------
green_coin_map = {
    'bottle':      10,
    'plate':        5,
    'wine glass':   7,
    'cup':          5,
    'book':         3,
    'cell phone':  20,
    'keyboard':    15,
    'mouse':        8,
    'remote':       8,
    'laptop':      30,
}

# -------------------------------------------------
# Helper Functions
# -------------------------------------------------
def get_objects(img, thres=0.45, nms=0.2, draw=True, objects=None):
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


def generate_qr_code(item_name, green_coin, user_id=None):
    if user_id is None:
        user_id = str(uuid.uuid4())

    qr_data = f"ITEM:{item_name}|GREENCOIN:{green_coin}|TXN:{user_id}"
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(qr_data)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    return qr_img, qr_data


# -------------------------------------------------
# Main Program
# -------------------------------------------------
if __name__ == "__main__":
    picam2 = Picamera2()
    preview_config = picam2.create_preview_configuration(main={"size": (640, 480)})
    picam2.configure(preview_config)
    picam2.start()

    last_detected_time = 0
    cooldown_seconds = 3
    detection_active = False

    print("System ready. Press the button to START or STOP detection.")

    try:
        while True:
            button_state = GPIO.input(BUTTON_PIN)

            if button_state == GPIO.HIGH:
                detection_active = not detection_active
                GPIO.output(LED_PIN, detection_active)
                time.sleep(0.5)  # debounce delay
                if detection_active:
                    print("✅ Detection started!")
                else:
                    print("🛑 Detection stopped.")

            if detection_active:
                frame = picam2.capture_array()
                frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)

                result_frame, object_info = get_objects(
                    frame, 0.45, 0.2,
                    objects=list(green_coin_map.keys())
                )

                current_time = time.time()
                if object_info and (current_time - last_detected_time > cooldown_seconds):
                    last_detected_time = current_time

                    for _, item_name in object_info:
                        coin_value = green_coin_map.get(item_name, 0)
                        print(f"Detected: {item_name} -> GreenCoin: {coin_value}")

                        qr_img, qr_data = generate_qr_code(item_name, coin_value)
                        print(f"Generated GREEN CREDIT QR: {qr_data}")

                        qr_img_path = f"/home/vishnu/Desktop/Object_Detection_Files/qrgen/green_qr_{item_name}_{int(time.time())}.png"
                        qr_img.save(qr_img_path)
                        print(f"QR Code saved at: {qr_img_path}")

                cv2.imshow("Object Detection Output", result_frame)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
            else:
                time.sleep(0.1)  # prevent busy loop when inactive

    finally:
        print("\nCleaning up GPIO and camera...")
        GPIO.cleanup()
        cv2.destroyAllWindows()
        picam2.stop()