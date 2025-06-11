import os
import glob
import cv2
import numpy as np
import mediapipe as mp
import json
import pandas as pd
from tqdm import tqdm

mp_hands = mp.solutions.hands

def extract_keypoints_from_video(video_path, max_frames=30):
    cap = cv2.VideoCapture(video_path)
    frames = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frames.append(frame)
    cap.release()

    keypoints = []
    step = max(1, len(frames) // max_frames)

    with mp_hands.Hands(static_image_mode=True, max_num_hands=1) as hands:
        for i in range(0, len(frames), step):
            if len(keypoints) >= max_frames:
                break
            image = cv2.cvtColor(frames[i], cv2.COLOR_BGR2RGB)
            results = hands.process(image)
            if results.multi_hand_landmarks:
                lm = results.multi_hand_landmarks[0]
                kp = [coord for point in lm.landmark for coord in (point.x, point.y)]
            else:
                kp = [0.0] * 42
            keypoints.append(kp)

    while len(keypoints) < max_frames:
        keypoints.append([0.0] * 42)

    return np.array(keypoints)


def preprocess_split(split_name, video_root="videos", output_root="preprocessed_keypoints", max_frames=30, limit=None):
    input_dir = os.path.join(video_root, split_name)
    output_dir = os.path.join(output_root, split_name)
    os.makedirs(output_dir, exist_ok=True)

    label_map = {}
    label_id = 0
    data = []
    labels = []

    all_videos = glob.glob(os.path.join(input_dir, "*", "*.mp4"))
    if limit:
        all_videos = all_videos[:limit]

    for video_path in tqdm(all_videos, desc=f"Processing {split_name}"):
        class_label = os.path.basename(os.path.dirname(video_path)).lower()
        file_name = os.path.splitext(os.path.basename(video_path))[0]
        output_path = os.path.join(output_dir, f"{file_name}.npy")

        if class_label not in label_map:
            label_map[class_label] = label_id
            label_id += 1

        if os.path.exists(output_path):
            print(f"Skipping (already exists): {file_name}.npy")
        else:
            print(f"Processing: {file_name} (class: {class_label})")
            keypoints = extract_keypoints_from_video(video_path, max_frames=max_frames)
            np.save(output_path, keypoints)
            print(f"Saved {file_name}.npy")

        data.append(f"{file_name}.npy")
        labels.append(label_map[class_label])

    # Save per-split labels.csv and label_map.json
    if data:
        with open(os.path.join(output_dir, "labels.csv"), "w") as f:
            f.write("file,label\n")
            for fname, lbl in zip(data, labels):
                f.write(f"{fname},{lbl}\n")

        with open(os.path.join(output_dir, "label_map.json"), "w") as f:
            json.dump(label_map, f, indent=2)

        print(f"{split_name}: {len(data)} files labeled and saved.")
    else:
        print(f"{split_name}: No data found.")

    return output_dir, data, labels, label_map


def merge_labels_and_maps(processed_splits, output_root="preprocessed_keypoints"):
    all_dfs = []
    global_label_set = set()

    for split_name, split_dir, _, _, _ in processed_splits:
        label_csv = os.path.join(split_dir, "labels.csv")
        map_json = os.path.join(split_dir, "label_map.json")

        if os.path.exists(label_csv):
            df = pd.read_csv(label_csv)
            df["split"] = split_name
            all_dfs.append(df)

        if os.path.exists(map_json):
            with open(map_json, "r") as f:
                global_label_set.update(json.load(f).keys())

    if all_dfs:
        merged_df = pd.concat(all_dfs, ignore_index=True)
        merged_df.to_csv(os.path.join(output_root, "labels.csv"), index=False)
        print(f"Merged labels.csv saved to: {os.path.join(output_root, 'labels.csv')}")
    else:
        print("No labels.csv files found to merge.")

    if global_label_set:
        sorted_labels = sorted(global_label_set)
        merged_map = {label: idx for idx, label in enumerate(sorted_labels)}
        with open(os.path.join(output_root, "label_map.json"), "w") as f:
            json.dump(merged_map, f, indent=2)
        print(f"Merged label_map.json saved to: {os.path.join(output_root, 'label_map.json')}")
    else:
        print("No label maps found to merge.")


if __name__ == "__main__":
    processed_splits = []
    for split in ["train", "val", "test"]:
        split_dir, data, labels, label_map = preprocess_split(
            split_name=split,
            video_root="videos",
            output_root="preprocessed_keypoints",
            max_frames=30,
            limit=None
        )
        processed_splits.append((split, split_dir, data, labels, label_map))

    merge_labels_and_maps(processed_splits)
