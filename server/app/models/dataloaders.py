import os
from torch.utils.data import DataLoader
from .dataset import ASLKeypointDataset


def get_dataloaders(batch_size=32):

    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/preprocessed_keypoints_top10"))

    train_dir = os.path.join(base_dir, "train")
    val_dir   = os.path.join(base_dir, "val")
    test_dir  = os.path.join(base_dir, "test")

    train_ds = ASLKeypointDataset(train_dir, os.path.join(train_dir, "labels.csv"))
    val_ds   = ASLKeypointDataset(val_dir,   os.path.join(val_dir, "labels.csv"))
    test_ds  = ASLKeypointDataset(test_dir,  os.path.join(test_dir, "labels.csv"))

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader   = DataLoader(val_ds, batch_size=batch_size)
    test_loader  = DataLoader(test_ds, batch_size=batch_size)

    return train_loader, val_loader, test_loader
