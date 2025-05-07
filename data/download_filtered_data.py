import os
import json
import yt_dlp
import pandas as pd
from tqdm import tqdm

def download_video(entry):
    url = entry.get("url")
    video_id = entry.get("video_id")
    gloss = entry.get("gloss")
    split = entry.get("split", "train")

    # Skip if any essential field is missing
    if not url or not video_id or not gloss:
        print(f"⚠️ Skipping entry due to missing field(s): {entry}")
        return

    # Create output directory
    output_dir = os.path.join("videos", split, gloss)
    os.makedirs(output_dir, exist_ok=True)

    output_path = os.path.join(output_dir, f"{gloss}_{video_id}.mp4")
    if os.path.exists(output_path):
        print(f"✅ Already downloaded: {output_path}")
        return

    try:
        with yt_dlp.YoutubeDL({'outtmpl': output_path}) as ydl:
            ydl.download([url])
    except Exception as e:
        print(f"❌ Error downloading {output_path}: {e}")

def main():
    # Load your filtered CSV
    df = pd.read_csv("filtered_wlasl_entries.csv")
    print(f"🔍 Total videos found: {len(df)}")

    for _, row in tqdm(df.iterrows(), total=len(df), desc="📥 Downloading videos"):
        download_video(row.to_dict())

if __name__ == "__main__":
    main()
