import json
import pandas as pd
import difflib

#ASL vocabulary
target_vocab = ['and', 'at', 'book', 'child', 'come', 'computer', 'dinner', 'dog', 'eat', 'every',
 'family', 'father', 'food', 'friend', 'girl', 'go', 'he', 'help', 'home', 'i',
 'letter', 'like', 'make', 'mother', 'movie', 'now', 'park', 'phone', 'play', 'read',
 'restaurant', 'school', 'see', 'she', 'store', 'student', 'talk', 'teacher', 'to',
 'today', 'toy', 'walk', 'want', 'we', 'weekend', 'with', 'woman', 'write', 'you',
 'young']

#Load the WLASL dataset
with open("WLASL_v0.3.json", "r") as f:
    wlasl_data = json.load(f)

#Collect all available glosses from WLASL
available_glosses = set(entry["gloss"].strip().lower() for entry in wlasl_data)

#Use fuzzy matching to expand vocab
expanded_vocab = set()
match_map = {}
for word in target_vocab:
    match = difflib.get_close_matches(word, available_glosses, n=1, cutoff=0.8)
    if match:
        expanded_vocab.add(match[0])
        match_map[word] = match[0]

#Identify missing words
original_vocab_set = set(target_vocab)
missing_words = sorted(original_vocab_set - set(match_map.keys()))

#Log matched and missing words
print(f"\n✅ Matched {len(match_map)} out of {len(target_vocab)} words.")
print("Matched glosses:", sorted(expanded_vocab))
print(f"\n❌ Missing {len(missing_words)} words (not found or unmatched):")
print("Missing glosses:", missing_words)

#Filter WLASL entries by matched glosses
filtered_entries = []
for entry in wlasl_data:
    gloss = entry["gloss"].strip().lower()
    if gloss in expanded_vocab:
        for instance in entry.get("instances", []):
            filtered_entries.append({
                "gloss": gloss,
                "video_id": instance.get("video_id"),
                "url": instance.get("url"),
                "split": instance.get("split", "train")  # default to 'train' if missing
            })

#Save and preview
filtered_df = pd.DataFrame(filtered_entries)
filtered_df.to_csv("filtered_wlasl_entries.csv", index=False)

print(f"\n✅ Extracted {len(filtered_df)} video entries for training.")
print("Sample rows:")
print(filtered_df.head())
