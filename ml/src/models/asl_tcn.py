import torch
import torch.nn as nn


class ASLTCN(nn.Module):
    def __init__(self, input_channels=42, num_classes=46, num_filters=64, kernel_size=3, dropout=0.3):
        super(ASLTCN, self).__init__()

        self.conv1 = nn.Conv1d(input_channels, num_filters, kernel_size, padding=1)
        self.bn1 = nn.BatchNorm1d(num_filters)
        self.relu1 = nn.ReLU()

        self.conv2 = nn.Conv1d(num_filters, num_filters, kernel_size, padding=1)
        self.bn2 = nn.BatchNorm1d(num_filters)
        self.relu2 = nn.ReLU()

        self.global_pool = nn.AdaptiveAvgPool1d(1)
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(num_filters, num_classes)

    def forward(self, x):
        # x: (batch, 30, 42) → we need to permute it to (batch, 42, 30)
        x = x.permute(0, 2, 1)
        x = self.relu1(self.bn1(self.conv1(x)))
        x = self.relu2(self.bn2(self.conv2(x)))
        x = self.global_pool(x).squeeze(-1)
        x = self.dropout(x)
        return self.fc(x)
