import os
import json
import torch
import torch.nn as nn
import torch.optim as optim

from models.dataloaders import get_dataloaders
from models.model_LSTM import ASLLSTM
from models.model import ASLTCN


# Device setup
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Dynamically load number of classes from label_map.json
label_map_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data/preprocessed_keypoints/label_map.json"))
with open(label_map_path, "r") as f:
    label_map = json.load(f)
num_classes = len(label_map)


train_loader, val_loader, test_loader = get_dataloaders(batch_size=32)

# Define model
# model = ASLLSTM(input_size=42, hidden_size=128, num_layers=2, num_classes=num_classes)
model = ASLTCN(input_channels=42, num_classes=num_classes)
model = model.to(device)

# Loss and optimizer
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=1e-3)

# Training loop
epochs = 10
for epoch in range(epochs):
    model.train()
    total_loss, total_correct, total_samples = 0, 0, 0

    for x, y in train_loader:
        x, y = x.to(device), y.to(device)
        optimizer.zero_grad()
        out = model(x)
        loss = criterion(out, y)
        loss.backward()
        optimizer.step()

        total_loss += loss.item()
        _, predicted = out.max(1)
        total_correct += predicted.eq(y).sum().item()
        total_samples += y.size(0)

    acc = 100. * total_correct / total_samples
    print(f"[Epoch {epoch+1}/{epochs}] Loss: {total_loss:.4f} | Train Acc: {acc:.2f}%")

# Optional: Evaluate on validation set
model.eval()
val_correct, val_total = 0, 0
with torch.no_grad():
    for x, y in val_loader:
        x, y = x.to(device), y.to(device)
        out = model(x)
        _, predicted = out.max(1)
        val_correct += predicted.eq(y).sum().item()
        val_total += y.size(0)

val_acc = 100. * val_correct / val_total
print(f"\n✅ Final Validation Accuracy: {val_acc:.2f}%")

# Save the trained model
model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../asl_lstm_model.pth"))
torch.save(model.state_dict(), model_path)
print(f"📦 Model saved to: {model_path}")
