import os
import pandas as pd
import shutil
import json
from collections import Counter


def filter_top_k(top_k=10):
    # Dynamically resolve absolute paths
    current_dir = os.path.dirname(__file__)
    project_root = os.path.abspath(os.path.join(current_dir, ".."))  # gesturepro/

    data_root = os.path.join(project_root, "data", "preprocessed_keypoints")
    out_root = os.path.join(project_root, "data", "preprocessed_keypoints_top10")

    os.makedirs(out_root, exist_ok=True)
    split_dirs = ["train", "val", "test"]

    # Step 1: Find top-k labels from train set
    train_labels = pd.read_csv(os.path.join(data_root, "train", "labels.csv"))
    label_map_path = os.path.join(data_root, "label_map.json")

    with open(label_map_path, "r") as f:
        label_map = json.load(f)
    reverse_map = {v: k for k, v in label_map.items()}

    label_counts = train_labels["label"].value_counts()
    top_labels = label_counts.head(top_k).index.tolist()

    top_glosses = [reverse_map[lbl] for lbl in top_labels]
    new_label_map = {gloss: idx for idx, gloss in enumerate(top_glosses)}

    print(f"✅ Top {top_k} glosses: {top_glosses}")

    # Step 2: Process each split
    for split in split_dirs:
        in_dir = os.path.join(data_root, split)
        out_dir = os.path.join(out_root, split)
        os.makedirs(out_dir, exist_ok=True)

        df = pd.read_csv(os.path.join(in_dir, "labels.csv"))
        filtered = df[df["label"].isin(top_labels)].copy()
        filtered["gloss"] = filtered["label"].map(lambda x: reverse_map[x])
        filtered["label"] = filtered["gloss"].map(new_label_map)

        # Copy .npy files
        for fname in filtered["file"]:
            src = os.path.join(in_dir, fname)
            dst = os.path.join(out_dir, fname)
            if os.path.exists(src):
                shutil.copyfile(src, dst)

        filtered[["file", "label"]].to_csv(os.path.join(out_dir, "labels.csv"), index=False)

        with open(os.path.join(out_dir, "label_map.json"), "w") as f:
            json.dump(new_label_map, f, indent=2)

        print(f"📂 Saved {len(filtered)} samples to {out_dir}")


if __name__ == "__main__":
    filter_top_k(top_k=10)
