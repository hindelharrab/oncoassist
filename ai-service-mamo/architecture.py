import torch
import torch.nn as nn
import torchvision.models as models


class MammoModelB3(nn.Module):
    def __init__(self, dropout_high=0.4, dropout_low=0.3):
        super().__init__()
        backbone = models.efficientnet_b3(weights=None)
        in_features = backbone.classifier[1].in_features
        backbone.classifier = nn.Identity()
        self.backbone    = backbone
        self.in_features = in_features
        self.head = nn.Sequential(
            nn.Linear(in_features, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(dropout_high),
            nn.Linear(256, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(dropout_low),
            nn.Linear(128, 1)
        )

    def forward(self, x):
        return self.head(self.backbone(x)).squeeze(1)


def load_model(weights_path: str):
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    model  = MammoModelB3()
    model.load_state_dict(
        torch.load(
            weights_path,
            map_location=device,
            weights_only=True
        )
    )
    model.eval()
    model.to(device)
    print(f"✓ Modèle chargé sur : {device}")
    return model, device