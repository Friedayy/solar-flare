"""
make_plots.py - creates the figures for the report and PPT.
Run AFTER: python solar_flare_ml.py train
Usage: python make_plots.py
"""
import joblib, pandas as pd, matplotlib.pyplot as plt
from sklearn.metrics import ConfusionMatrixDisplay
from solar_flare_ml import FEATURES

te = pd.read_csv("data/test.csv", parse_dates=["T_REC"])
model = joblib.load("data/best_model.pkl")
res = pd.read_csv("data/results.csv", index_col="Model")

# Fig 6.1 - confusion matrix
ConfusionMatrixDisplay.from_estimator(model, te[FEATURES], te["label"],
    display_labels=["No M/X flare", "M/X flare"], cmap="Blues")
plt.title("Confusion Matrix - Best Model (Test 2014-2015)")
plt.tight_layout(); plt.savefig("data/fig_confusion_matrix.png", dpi=200); plt.close()

# Fig 6.2 - feature importance (tree models only)
est = model.steps[-1][1] if hasattr(model, "steps") else model
if hasattr(est, "feature_importances_"):
    imp = pd.Series(est.feature_importances_, FEATURES).sort_values()
    imp.plot.barh(figsize=(7, 6), color="#1F4E78")
    plt.title("Which magnetic features drive flare risk?"); plt.xlabel("Importance")
    plt.tight_layout(); plt.savefig("data/fig_feature_importance.png", dpi=200); plt.close()
elif hasattr(est, "coef_"):
    import numpy as np
    imp = pd.Series(np.abs(est.coef_[0]), FEATURES).sort_values()
    imp.plot.barh(figsize=(7, 6), color="#1F4E78")
    plt.title("Which magnetic features drive flare risk?"); plt.xlabel("Magnitude (|coef|)")
    plt.tight_layout(); plt.savefig("data/fig_feature_importance.png", dpi=200); plt.close()
else:
    print("Best model has no feature_importances_ (e.g. SVM). Skipping importance plot.")

# Model comparison chart (TSS vs Accuracy - shows why accuracy lies)
res[["TSS", "Accuracy"]].plot.bar(figsize=(8, 5), rot=15, color=["#C55A11", "#9DC3E6"])
plt.title("Accuracy looks great for every model. TSS shows the real difference.")
plt.ylim(0, 1.05); plt.tight_layout(); plt.savefig("data/fig_model_comparison.png", dpi=200); plt.close()

# Class imbalance chart
counts = pd.read_csv("data/train.csv")["label"].value_counts().sort_index()
counts.index = ["No M/X flare", "M/X flare"]
counts.plot.bar(color=["#9DC3E6", "#C55A11"], rot=0, figsize=(5, 4))
plt.title(f"Class imbalance in training data (1:{counts.iloc[0] // max(counts.iloc[1], 1)})")
plt.tight_layout(); plt.savefig("data/fig_class_imbalance.png", dpi=200); plt.close()

print("Saved figures in data/:")
print("  fig_confusion_matrix.png, fig_feature_importance.png,")
print("  fig_model_comparison.png, fig_class_imbalance.png")
print("\nPaste this into Table 3:\n", res.round(3).to_string())
