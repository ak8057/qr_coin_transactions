#!/usr/bin/env python3
# rv_machine.py
# Reverse Vending style flow:
# - Wait for push-button. On press: green LED ON and beep once.
# - Start camera + detection loop (same DNN model logic).
# - When QR generated: stop detection, turn GREEN OFF, turn RED ON, stop camera, close windows.

import os
import time
import uuid
import cv2
import qrcode
import numpy as np
from picamera2 import Picamera2

# GPIO
from gpiozero import Button, LED, Buzzer
from signal import pause

# ---------------------------
# GPIO PIN CONFIG (BCM)
# ---------------------------
BTN_PIN = 17     # Push button input (BCM)
GREEN_LED = 27   # Green LED (BCM)
RED_LED = 22     # Red LED (BCM)
BUZZER_PIN = 18  # Buzzer (BCM), can be PWM-capable pin if you want tones

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

# ---------------------------
# Global camera instance (initialize once)
# ---------------------------
picam2 = Picamera2()
preview_config = picam2.create_preview_configuration(main={"size": (640, 480)})
picam2.configure(preview_config)

# ---------------------------
# Initialize GPIO devices
# ---------------------------
button = Button(BTN_PIN, pull_up=False, bounce_time=0.05)
green_led = LED(GREEN_LED)
red_led = LED(RED_LED)
buzzer = Buzzer(BUZZER_PIN)

# ---------------------------
# DNN model setup
# ---------------------------
class_names = []
class_file = "/home/vishnu/Desktop/Object_Detection_Files/coco.names"
with open(class_file, "rt") as f:
    class_names = f.read().rstrip("\n").split("\n")

config_path  = "/home/vishnu/Desktop/Object_Detection_Files/ssd_mobilenet_v3_large_coco_2020_01_14.pbtxt"
weights_path = "/home/vishnu/Desktop/Object_Detection_Files/frozen_inference_graph.pb"

net = cv2.dnn.DetectionModel(weights_path, config_path)
net.setInputSize(320, 320)
net.setInputScale(1.0 / 127.5)
net.setInputMean((127.5, 127.5, 127.5))
net.setInputSwapRB(True)


def get_objects(img, thres=0.45, nms=0.2, draw=True, objects=None):
    """Detect objects in the given image using the loaded DNN model."""
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
            idx = int(class_id) - 1
            if 0 <= idx < len(class_names):
                class_name = class_names[idx]
            else:
                class_name = str(class_id)

            if class_name in objects:
                object_info.append([box, class_name, float(confidence)])
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


def generate_qr_code(item_name, green_coin, user_id=None, save_dir="/home/vishnu/Desktop/Object_Detection_Files/qrgen"):
    """Generates QR code with ITEM, GREENCOIN, and TXN fields."""
    if user_id is None:
        user_id = str(uuid.uuid4())

    qr_data = f"ITEM:{item_name}|GREENCOIN:{green_coin}|TXN:{user_id}"
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(qr_data)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")

    if not os.path.exists(save_dir):
        os.makedirs(save_dir, exist_ok=True)

    filename = f"green_qr_{int(time.time())}.png"
    fullpath = os.path.join(save_dir, filename)
    qr_img.save(fullpath)
    return qr_img, qr_data, fullpath


def start_detection_loop():
    """Start detection loop using global Picamera2 instance."""
    picam2.start()
    print("Detection loop started. Place recyclable item in front of camera.")
    last_detected_time = 0
    cooldown_seconds = 3

    try:
        while True:
            frame = picam2.capture_array()
            frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
            target_objects = list(green_coin_map.keys())

            result_frame, object_info = get_objects(frame, thres=0.45, nms=0.2,
                                                    draw=True, objects=target_objects)
            current_time = time.time()
            if object_info and (current_time - last_detected_time > cooldown_seconds):
                last_detected_time = current_time
                detected_names = [obj[1] for obj in object_info]
                print(f"Detected recyclable item(s): {detected_names}")

                # Use first detected item for QR generation
                item_name = detected_names[0]
                green_coin = green_coin_map.get(item_name, 0)

                qr_img, qr_data, qr_path = generate_qr_code(item_name, green_coin)
                print(f"Generated GREEN CREDIT QR: {qr_data}")
                print(f"QR saved at: {qr_path}")

                # Show QR code for 2 seconds
                try:
                    qr_cv = cv2.cvtColor(np.array(qr_img.convert("RGB")), cv2.COLOR_RGB2BGR)
                    cv2.imshow("GREEN CREDIT QR", qr_cv)
                    cv2.waitKey(2000)
                    cv2.destroyWindow("GREEN CREDIT QR")
                except Exception as e:
                    print("Unable to show QR preview:", e)

                break  # exit loop after QR generation

            cv2.imshow("Object Detection Output", result_frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    finally:
        picam2.stop()
        cv2.destroyAllWindows()


def on_button_pressed():
    """Triggered by button press: LED + buzzer + detection flow."""
    buzzer.on()
    time.sleep(0.08)
    buzzer.off()

    if green_led.is_lit:
        print("Detection already running (green LED is ON).")
        return

    green_led.on()
    red_led.off()
    print("Green LED ON. You may place the recyclable item.")

    try:
        start_detection_loop()
        print("Detection loop ended (QR generated or manual exit).")
    except Exception as e:
        print("Error in detection loop:", e)
    finally:
        green_led.off()
        red_led.on()
        print("Green LED OFF. Red LED ON. Process complete.")


# Attach button event handler
button.when_pressed = on_button_pressed

if __name__ == "__main__":
    print("Reverse Vending Machine - Ready. Press the push-button to start.")
    red_led.off()
    green_led.off()
    try:
        pause()
    except KeyboardInterrupt:
        print("Exiting, cleaning up GPIO and camera.")
    finally:
        try:
            picam2.stop()
            picam2.close()
            time.sleep(1.0)
        except Exception as e:
            print("Error stopping/closing Picamera2:", e)

        cv2.destroyAllWindows()
        green_led.off()
        red_led.on()
        print("Green LED OFF. Red LED ON. Process complete.")