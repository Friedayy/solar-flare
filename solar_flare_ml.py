"""
solar_flare_ml.py - Real-Time Solar Flare Forecasting (ML version)
Usage:
  python solar_flare_ml.py train  # downloads data, trains & compares models
  python solar_flare_ml.py live   # predicts on today's Sun using NRT data
Install:
  pip install drms sunpy[net] scikit-learn xgboost pandas numpy requests joblib
"""
import os, sys, warnings
from datetime import datetime, timedelta, timezone
import numpy as np, pandas as pd, requests, joblib, drms
from sunpy.net import Fido, attrs as a
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import confusion_matrix
from xgboost import XGBClassifier

warnings.filterwarnings("ignore")

FEATURES = [
    "USFLUX", "MEANGAM", "MEANGBT", "MEANGBZ", "MEANGBH", "MEANJZD",
    "TOTUSJZ", "MEANALP", "MEANJZH", "TOTUSJH", "ABSNJZH", "SAVNCPP",
    "MEANPOT", "TOTPOT", "MEANSHR", "SHRGT45", "R_VALUE", "AREA_ACR"
]

CLIENT = drms.Client()
os.makedirs("data", exist_ok=True)

def tai(t):
    return t.strftime("%Y.%m.%d_%H:%M_TAI")

def fetch_sharp(start, duration, step="6h", series="hmi.sharp_cea_720s"):
    """Pull SHARP magnetic parameters for every active region."""
    query = f"{series}[][{tai(start)}/{duration}@{step}]"
    df = CLIENT.query(query, key="HARPNUM,T_REC,NOAA_AR,LON_FWT," + ",".join(FEATURES))
    if df.empty:
        return df
    df["T_REC"] = drms.to_datetime(df["T_REC"])
    df = df[(df["NOAA_AR"] > 0) & (df["LON_FWT"].abs() <= 70)]  # near disk centre only
    return df.dropna(subset=FEATURES)

def fetch_flares(start, end):
    """GOES flare list (with NOAA active region numbers) from the HEK."""
    res = Fido.search(a.Time(start, end), a.hek.EventType("FL"),
                      a.hek.OBS.Observatory == "GOES")
    t = res["hek"]
    return pd.DataFrame({
        "peak": pd.to_datetime([str(x) for x in t["event_peaktime"]]),
        "cls": [str(c) for c in t["fl_goescls"]],
        "ar": [int(x) for x in t["ar_noaanum"]],
    })

def label(sharp, flares, horizon_h=24):
    """1 if the region produces an M/X flare in the next 24 h, else 0."""
    major = flares[flares["cls"].str[:1].isin(["M", "X"]) & (flares["ar"] > 0)]
    peaks = {ar: np.sort(g["peak"].values) for ar, g in major.groupby("ar")}
    y = np.zeros(len(sharp), dtype=int)
    for i, (ar, t) in enumerate(zip(sharp["NOAA_AR"], sharp["T_REC"].values)):
        p = peaks.get(ar)
        if p is not None:
            lo = np.searchsorted(p, t, side="right")
            hi = np.searchsorted(p, t + np.timedelta64(horizon_h, "h"), side="right")
            y[i] = int(hi > lo)
    return y

def build(start, end, name):
    path = f"data/{name}.csv"
    if os.path.exists(path):
        return pd.read_csv(path, parse_dates=["T_REC"])
    parts, cur = [], start
    while cur < end:  # 30-day chunks keep JSOC queries small
        print("  fetching", cur.date())
        parts.append(fetch_sharp(cur, "30d"))
        cur += timedelta(days=30)
    sharp = pd.concat(parts, ignore_index=True)
    flares = fetch_flares(start, end + timedelta(days=1))
    sharp["label"] = label(sharp, flares)
    sharp.to_csv(path, index=False)
    return sharp

def scores(y, p):
    tn, fp, fn, tp = confusion_matrix(y, p, labels=[0, 1]).ravel()
    tss = tp / (tp + fn + 1e-9) - fp / (fp + tn + 1e-9)
    hss = 2 * (tp * tn - fn * fp) / ((tp + fn) * (fn + tn) + (tp + fp) * (fp + tn) + 1e-9)
    return dict(TSS=tss, HSS=hss, Recall=tp / (tp + fn + 1e-9),
                Precision=tp / (tp + fp + 1e-9), Accuracy=(tp + tn) / len(y))

def train():
    # time-based split: no region appears in both sets (avoids leakage)
    tr = build(datetime(2012, 1, 1), datetime(2014, 1, 1), "train")
    te = build(datetime(2014, 1, 1), datetime(2015, 7, 1), "test")
    Xtr, ytr, Xte, yte = tr[FEATURES], tr["label"], te[FEATURES], te["label"]
    ratio = (ytr == 0).sum() / max((ytr == 1).sum(), 1)
    print(f"train {len(tr)} rows | positives {ytr.sum()} | imbalance 1:{ratio:.0f}")
    models = {
        "Logistic Regression": make_pipeline(StandardScaler(),
            LogisticRegression(class_weight="balanced", max_iter=2000)),
        "SVM (RBF) - Bobra baseline": make_pipeline(StandardScaler(),
            SVC(kernel="rbf", C=4.0, gamma=0.075, class_weight="balanced", probability=True)),
        "Random Forest": RandomForestClassifier(n_estimators=400, class_weight="balanced",
            min_samples_leaf=5, n_jobs=-1, random_state=42),
        "XGBoost": XGBClassifier(n_estimators=400, max_depth=5, learning_rate=0.05,
            scale_pos_weight=ratio, eval_metric="logloss", random_state=42),
    }
    rows, best, best_tss = [], None, -1
    for name, m in models.items():
        m.fit(Xtr, ytr)
        s = scores(yte, m.predict(Xte)); s["Model"] = name; rows.append(s)
        if s["TSS"] > best_tss:
            best, best_tss = m, s["TSS"]
    res = pd.DataFrame(rows).set_index("Model").round(3)
    print(res); res.to_csv("data/results.csv")
    joblib.dump(best, "data/best_model.pkl")
    if hasattr(best, "feature_importances_"):
        imp = pd.Series(best.feature_importances_, FEATURES).sort_values(ascending=False)
        print("\nTop features:\n", imp.head(8).round(3))

def goes_now():
    url = "https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json"
    d = [r for r in requests.get(url, timeout=20).json() if r["energy"] == "0.1-0.8nm"]
    f = d[-1]["flux"]
    for c, lim in [("A", 1e-7), ("B", 1e-6), ("C", 1e-5), ("M", 1e-4)]:
        if f < lim:
            return d[-1]["time_tag"], f"{c}{f / (lim / 10):.1f}"
    return d[-1]["time_tag"], f"X{f / 1e-4:.1f}"

def live():
    model = joblib.load("data/best_model.pkl")
    start = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(hours=36)
    df = fetch_sharp(start, "36h", step="1h", series="hmi.sharp_cea_720s_nrt")
    if df.empty:
        print("No near-real-time SHARP data available right now."); return
    latest = df.sort_values("T_REC").groupby("HARPNUM").tail(1).copy()
    latest["P(M/X flare in 24h)"] = model.predict_proba(latest[FEATURES])[:, 1]
    out = latest[["NOAA_AR", "T_REC", "P(M/X flare in 24h)"]]
    print(out.sort_values("P(M/X flare in 24h)", ascending=False).round(3).to_string(index=False))
    t, cls = goes_now()
    print(f"\nCurrent GOES X-ray level ({t}): {cls}")

if __name__ == "__main__":
    {"train": train, "live": live}.get(sys.argv[1] if len(sys.argv) > 1 else "train", train)()
