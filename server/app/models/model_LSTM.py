import torch.nn as nn

class ASLLSTM(nn.Module):
    def __init__(self, input_size=42, hidden_size=128, num_layers=2, num_classes=46):
        super(ASLLSTM, self).__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, num_classes)

    def forward(self, x):  # x: (batch, 30, 42)
        out, _ = self.lstm(x)
        out = out[:, -1, :]  # take last time step
        out = self.fc(out)
        return out
