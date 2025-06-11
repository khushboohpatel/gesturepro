import os
import numpy as np
import pandas as pd
import torch
from torch.utils.data import Dataset

class ASLKeypointDataset(Dataset):
    def __init__(self, data_dir, label_csv, transform=None):
        self.data_dir = data_dir
        self.data = pd.read_csv(label_csv)
        self.transform = transform

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        row = self.data.iloc[idx]
        file_path = os.path.join(self.data_dir, row["file"])
        keypoints = np.load(file_path).astype(np.float32)  # shape: (30, 42)
        label = int(row["label"])

        if self.transform:
            keypoints = self.transform(keypoints)

        return torch.tensor(keypoints), torch.tensor(label)
