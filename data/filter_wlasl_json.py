import json

# ASL vocabulary
vocabulary = [
    'and', 'at', 'book', 'child', 'come', 'computer', 'dinner', 'dog', 'eat', 'every',
    'family', 'father', 'food', 'friend', 'girl', 'go', 'he', 'help', 'home', 'i',
    'letter', 'like', 'make', 'mother', 'movie', 'now', 'park', 'phone', 'play', 'read',
    'restaurant', 'school', 'see', 'she', 'store', 'student', 'talk', 'teacher', 'to',
    'today', 'toy', 'walk', 'want', 'we', 'weekend', 'with', 'woman', 'write', 'you',
    'young'
]

vocab_set = set(word.lower().strip() for word in vocabulary)

# Load WLASL
with open("WLASL_v0.3.json", "r") as f:
    full_data = json.load(f)

# Filter by gloss field
filtered_data = [entry for entry in full_data if entry.get("gloss", "").lower().strip() in vocab_set]

# Save the filtered version
with open("WLASL_custom.json", "w") as f:
    json.dump(filtered_data, f, indent=2)

matched = {entry["gloss"].lower().strip() for entry in filtered_data}
unmatched = vocab_set - matched
print(f"Filtered {len(filtered_data)} entries.")
if unmatched:
    print("No matches found for:", sorted(unmatched))
