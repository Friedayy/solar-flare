#!/usr/bin/env python3
"""
Interactive Space Weather & Solar Flare Forecasting Web Server
Serves the web dashboard, REST APIs for ML inference, real-time NOAA/SDO telemetry,
and static scientific artifacts.
"""
import os
import sys
import json
import mimetypes
import threading
import time
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from datetime import datetime, timezone, timedelta
import joblib
import pandas as pd
import numpy as np
import requests

# Base paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DASHBOARD_DIR = os.path.join(BASE_DIR, "dashboard")
DATA_DIR = os.path.join(BASE_DIR, "data")
MODEL_PATH = os.path.join(DATA_DIR, "best_model.pkl")

# Import FEATURES from solar_flare_ml
sys.path.append(BASE_DIR)
try:
    from solar_flare_ml import FEATURES, goes_now, fetch_sharp
except ImportError:
    FEATURES = [
        "USFLUX", "MEANGAM", "MEANGBT", "MEANGBZ", "MEANGBH", "MEANJZD",
        "TOTUSJZ", "MEANALP", "MEANJZH", "TOTUSJH", "ABSNJZH", "SAVNCPP",
        "MEANPOT", "TOTPOT", "MEANSHR", "SHRGT45", "R_VALUE", "AREA_ACR"
    ]

# Feature plain-English dictionary and descriptions
FEATURE_META = {
    "R_VALUE": {
        "name": "Polarity Inversion Line Flux (R)",
        "cheat_sheet": "How much strong opposite-polarity field sits right next to each other",
        "description": "Logarithmic measure of magnetic flux near strong-field polarity inversion lines. Sharp boundaries between opposite magnetic poles harbor the highest explosive flare potential.",
        "unit": "log10(Mx)"
    },
    "TOTUSJH": {
        "name": "Total Unsigned Current Helicity",
        "cheat_sheet": "How twisted the magnetic field is overall (current helicity)",
        "description": "Proxy for total twist, shear, and topological linkage in the magnetic field lines. Non-potential, highly twisted field lines are prone to magnetic reconnection.",
        "unit": "G² / m"
    },
    "TOTPOT": {
        "name": "Total Photospheric Free Magnetic Energy Density",
        "cheat_sheet": "Stored 'free' magnetic energy that can be released as a flare",
        "description": "The difference between total magnetic energy and the theoretical minimum ground-state potential field. Supplies the raw thermal/kinetic energy expelled during flares.",
        "unit": "ergs / cm³"
    },
    "AREA_ACR": {
        "name": "Strong-field Area",
        "cheat_sheet": "Size of the strong-field area",
        "description": "Photospheric surface area where the line-of-sight magnetic field strength exceeds 300 Gauss. Larger active regions generally harbor bigger flare events.",
        "unit": "micro-hemispheres"
    },
    "MEANSHR": {
        "name": "Mean Shear Angle",
        "cheat_sheet": "How sheared/stressed the field is",
        "description": "Mean 3D angle between the observed magnetic field vector and the computed potential field vector. Higher angles mean greater magnetic stress.",
        "unit": "degrees (°)"
    },
    "MEANGAM": {
        "name": "Mean Angle of Field with Vertical",
        "cheat_sheet": "Inclination of magnetic field lines from surface normal",
        "description": "Mean inclination angle (gamma) of magnetic vectors relative to the solar normal surface.",
        "unit": "degrees (°)"
    },
    "SAVNCPP": {
        "name": "Sum of Absolute Value of Net Currents Per Polarity",
        "cheat_sheet": "Net vertical electric current balance",
        "description": "Measures non-neutralized electric currents flowing between positive and negative magnetic domains.",
        "unit": "Amperes (A)"
    },
    "MEANGBH": {
        "name": "Mean Gradient of Horizontal Field",
        "cheat_sheet": "Spatial gradient of horizontal magnetic intensity",
        "description": "Rate of change of horizontal magnetic field intensity across photospheric distance.",
        "unit": "G / Mm"
    },
    "MEANGBT": {
        "name": "Mean Gradient of Total Field",
        "cheat_sheet": "Spatial gradient of total magnetic field",
        "description": "Average spatial gradient of total field strength across the sunspot region.",
        "unit": "G / Mm"
    },
    "MEANPOT": {
        "name": "Mean Free Magnetic Energy Density",
        "cheat_sheet": "Average excess magnetic energy density",
        "description": "Mean value of excess energy density per unit volume across the patch.",
        "unit": "ergs / cm³"
    },
    "MEANGBZ": {
        "name": "Mean Gradient of Vertical Field",
        "cheat_sheet": "Spatial gradient of vertical field",
        "description": "Spatial derivative of vertical magnetic flux density.",
        "unit": "G / Mm"
    },
    "SHRGT45": {
        "name": "Fraction of Area with Shear > 45°",
        "cheat_sheet": "Fraction of severely stressed field area",
        "description": "Percentage of the active region where magnetic shear angle exceeds 45 degrees.",
        "unit": "%"
    },
    "MEANJZD": {
        "name": "Mean Vertical Current Density",
        "cheat_sheet": "Average vertical electric current density",
        "description": "Mean of vertical electric currents per unit surface area.",
        "unit": "mA / m²"
    },
    "ABSNJZH": {
        "name": "Absolute Value of Net Current Helicity",
        "cheat_sheet": "Net helicity imbalance",
        "description": "Magnitude of the net current helicity integrated across both polarities.",
        "unit": "G² / m"
    },
    "MEANALP": {
        "name": "Mean Twist Parameter (Alpha)",
        "cheat_sheet": "Force-free field twist parameter",
        "description": "Force-free parameter alpha representing local magnetic torsion.",
        "unit": "1 / Mm"
    },
    "USFLUX": {
        "name": "Total Unsigned Flux",
        "cheat_sheet": "Total amount of magnetic field in the region",
        "description": "Total magnetic flux escaping and re-entering the photosphere within the patch.",
        "unit": "Mx (Maxwell)"
    },
    "TOTUSJZ": {
        "name": "Total Unsigned Vertical Current",
        "cheat_sheet": "Total electric current flowing through the region",
        "description": "Total integrated electric current flowing perpendicular to the solar surface.",
        "unit": "Amperes (A)"
    },
    "MEANJZH": {
        "name": "Mean Characteristic Current Helicity",
        "cheat_sheet": "Average current helicity density",
        "description": "Average current helicity per unit area across the patch.",
        "unit": "G² / m"
    }
}

# Cached live telemetry
LIVE_CACHE = {
    "last_fetched": "2026-10-08T18:53:00Z",
    "goes_xray": {"time_tag": "2026-10-08T18:53:00Z", "flux_class": "C1.4", "category": "C-Class (Active)"},
    "active_regions": [
        {
            "noaa_ar": 14549,
            "t_rec": "2026-10-08 17:00:00",
            "prob_pct": 99.6,
            "prob": 0.996,
            "risk_level": "Critical",
            "risk_color": "#ff3366",
            "notes": "Complex magnetic morphology, extreme polarity inversion gradient"
        },
        {
            "noaa_ar": 14548,
            "t_rec": "2026-10-08 17:00:00",
            "prob_pct": 1.3,
            "prob": 0.013,
            "risk_level": "Quiet",
            "risk_color": "#00e676",
            "notes": "Simple dipolar active region, low magnetic shear"
        },
        {
            "noaa_ar": 14547,
            "t_rec": "2026-10-07 14:00:00",
            "prob_pct": 1.1,
            "prob": 0.011,
            "risk_level": "Quiet",
            "risk_color": "#00e676",
            "notes": "Decaying sunspot region approaching western limb"
        }
    ]
}

# Load model and baseline statistics
MODEL = None
TRAIN_STATS = {}
if os.path.exists(MODEL_PATH):
    try:
        MODEL = joblib.load(MODEL_PATH)
    except Exception as e:
        print(f"Error loading model: {e}")

TRAIN_CSV = os.path.join(DATA_DIR, "train.csv")
if os.path.exists(TRAIN_CSV):
    try:
        df_tr = pd.read_csv(TRAIN_CSV)
        desc = df_tr[FEATURES].describe().T
        for feat in FEATURES:
            TRAIN_STATS[feat] = {
                "mean": float(desc.loc[feat, "mean"]),
                "std": float(desc.loc[feat, "std"]),
                "min": float(desc.loc[feat, "min"]),
                "max": float(desc.loc[feat, "max"]),
                "median": float(desc.loc[feat, "50%"])
            }
    except Exception as e:
        print(f"Error computing train stats: {e}")


def get_feature_importances():
    """Extract model feature coefficients/weights."""
    global MODEL
    if MODEL is None and os.path.exists(MODEL_PATH):
        MODEL = joblib.load(MODEL_PATH)
    
    importances = {}
    if MODEL is not None:
        est = MODEL.steps[-1][1] if hasattr(MODEL, "steps") else MODEL
        if hasattr(est, "coef_"):
            coefs = np.abs(est.coef_[0])
            for feat, val in zip(FEATURES, coefs):
                importances[feat] = round(float(val), 3)
        elif hasattr(est, "feature_importances_"):
            for feat, val in zip(FEATURES, est.feature_importances_):
                importances[feat] = round(float(val), 3)
    return importances


class DashboardHandler(BaseHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS for local dev
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # API Endpoints
        if path == "/api/overview":
            self.handle_api_overview()
        elif path == "/api/models":
            self.handle_api_models()
        elif path == "/api/features":
            self.handle_api_features()
        elif path == "/api/stats":
            self.handle_api_stats()
        elif path.startswith("/data/"):
            # Serve files from data directory (e.g. images)
            filename = os.path.basename(path)
            filepath = os.path.join(DATA_DIR, filename)
            self.serve_static_file(filepath)
        else:
            # Serve dashboard frontend files
            rel_path = path.lstrip("/")
            if not rel_path:
                rel_path = "index.html"
            filepath = os.path.join(DASHBOARD_DIR, rel_path)
            self.serve_static_file(filepath)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/predict":
            self.handle_api_predict()
        elif path == "/api/refresh-live":
            self.handle_api_refresh_live()
        else:
            self.send_error(404, "Endpoint not found")

    def serve_static_file(self, filepath):
        if not os.path.exists(filepath) or os.path.isdir(filepath):
            # Fallback to index.html for SPA if not found
            fallback = os.path.join(DASHBOARD_DIR, "index.html")
            if os.path.exists(fallback):
                filepath = fallback
            else:
                self.send_error(404, f"File not found: {os.path.basename(filepath)}")
                return

        mime_type, _ = mimetypes.guess_type(filepath)
        if not mime_type:
            mime_type = "application/octet-stream"

        try:
            with open(filepath, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", mime_type)
            self.send_header("Content-Length", str(len(content)))
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_error(500, str(e))

    def send_json(self, data, status=200):
        body = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def handle_api_overview(self):
        data = {
            "title": "Solar Flare Forecasting Operational ML System",
            "benchmark": "Bobra & Couvidat (2015) — TSS ≈ 0.76",
            "best_model": {
                "name": "Logistic Regression (Balanced)",
                "tss": 0.650,
                "hss": 0.245,
                "recall": 0.804,
                "precision": 0.181,
                "accuracy": 0.845
            },
            "dataset_summary": {
                "train_records": 14502,
                "train_positives": 372,
                "train_imbalance": "1:38 (2.56% flare rate)",
                "test_records": 10836,
                "test_positives": 438,
                "split_strategy": "Strict Chronological Holdout (2012-2014 vs 2014-2015.5)"
            },
            "noaa_telemetry": LIVE_CACHE["goes_xray"],
            "active_regions": LIVE_CACHE["active_regions"],
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
        self.send_json(data)

    def handle_api_models(self):
        results_file = os.path.join(DATA_DIR, "results.csv")
        models = []
        if os.path.exists(results_file):
            df = pd.read_csv(results_file)
            for _, row in df.iterrows():
                models.append({
                    "model": str(row["Model"]),
                    "tss": float(row["TSS"]),
                    "hss": float(row["HSS"]),
                    "recall": float(row["Recall"]),
                    "precision": float(row["Precision"]),
                    "accuracy": float(row["Accuracy"]),
                    "is_best": "Logistic Regression" in str(row["Model"])
                })
        self.send_json({"models": models})

    def handle_api_features(self):
        importances = get_feature_importances()
        features_list = []
        for feat in FEATURES:
            meta = FEATURE_META.get(feat, {})
            imp = importances.get(feat, 0.0)
            stats = TRAIN_STATS.get(feat, {})
            features_list.append({
                "code": feat,
                "name": meta.get("name", feat),
                "cheat_sheet": meta.get("cheat_sheet", ""),
                "description": meta.get("description", ""),
                "unit": meta.get("unit", ""),
                "importance": imp,
                "stats": stats
            })
        # Sort descending by importance
        features_list.sort(key=lambda x: x["importance"], reverse=True)
        self.send_json({"features": features_list})

    def handle_api_stats(self):
        self.send_json({"stats": TRAIN_STATS})

    def handle_api_predict(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            payload = json.loads(body.decode("utf-8"))

            global MODEL
            if MODEL is None:
                MODEL = joblib.load(MODEL_PATH)

            # Construct input vector from median defaults if not provided
            input_dict = {}
            for feat in FEATURES:
                default_val = TRAIN_STATS.get(feat, {}).get("median", 0.0)
                input_dict[feat] = [float(payload.get(feat, default_val))]

            df_input = pd.DataFrame(input_dict)
            prob = float(MODEL.predict_proba(df_input)[0, 1])
            prob_pct = round(prob * 100, 1)

            # Determine risk tier
            if prob_pct >= 70:
                tier = "Severe / Critical"
                color = "#ff3366"
                badge = "High Probability Major M/X Flare Anticipated"
            elif prob_pct >= 40:
                tier = "Elevated"
                color = "#ff9d00"
                badge = "Heightened Flare Precursor Activity"
            elif prob_pct >= 15:
                tier = "Guarded / Moderate"
                color = "#ffcc00"
                badge = "Moderate Magnetic Complexity"
            else:
                tier = "Quiet / Low"
                color = "#00e676"
                badge = "Stable Photospheric Magnetic Configuration"

            # Compute relative feature contributions
            est = MODEL.steps[-1][1] if hasattr(MODEL, "steps") else MODEL
            scaler = MODEL.steps[0][1] if hasattr(MODEL, "steps") else None

            contributions = []
            if hasattr(est, "coef_") and scaler is not None:
                scaled_vec = scaler.transform(df_input)[0]
                coefs = est.coef_[0]
                for feat, s_val, c_val in zip(FEATURES, scaled_vec, coefs):
                    impact = s_val * c_val
                    contributions.append({
                        "feature": feat,
                        "impact": round(float(impact), 3),
                        "abs_impact": round(abs(float(impact)), 3),
                        "description": FEATURE_META.get(feat, {}).get("cheat_sheet", "")
                    })
                contributions.sort(key=lambda x: x["abs_impact"], reverse=True)

            self.send_json({
                "probability": round(prob, 4),
                "probability_pct": prob_pct,
                "risk_tier": tier,
                "color": color,
                "badge": badge,
                "top_drivers": contributions[:5]
            })
        except Exception as e:
            self.send_json({"error": str(e)}, status=400)

    def handle_api_refresh_live(self):
        try:
            t, cls = goes_now()
            # Query near-real-time SHARP
            start = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(hours=36)
            df_nrt = fetch_sharp(start, "36h", step="1h", series="hmi.sharp_cea_720s_nrt")

            regions = []
            if not df_nrt.empty and MODEL is not None:
                latest = df_nrt.sort_values("T_REC").groupby("HARPNUM").tail(1).copy()
                probs = MODEL.predict_proba(latest[FEATURES])[:, 1]
                latest["prob"] = probs
                for _, row in latest.sort_values("prob", ascending=False).iterrows():
                    p = float(row["prob"])
                    p_pct = round(p * 100, 1)
                    color = "#ff3366" if p_pct >= 60 else ("#ff9d00" if p_pct >= 20 else "#00e676")
                    tier = "Critical" if p_pct >= 60 else ("Elevated" if p_pct >= 20 else "Quiet")
                    regions.append({
                        "noaa_ar": int(row["NOAA_AR"]),
                        "t_rec": str(row["T_REC"]),
                        "prob": round(p, 3),
                        "prob_pct": p_pct,
                        "risk_level": tier,
                        "risk_color": color,
                        "notes": f"Magnetic flux: {row.get('USFLUX', 0):.2e} Mx, R: {row.get('R_VALUE', 0):.2f}"
                    })
                LIVE_CACHE["active_regions"] = regions

            LIVE_CACHE["goes_xray"] = {
                "time_tag": t,
                "flux_class": cls,
                "category": f"GOES Primary ({cls})"
            }
            LIVE_CACHE["last_fetched"] = datetime.now(timezone.utc).isoformat()
            self.send_json({"status": "success", "data": LIVE_CACHE})
        except Exception as e:
            self.send_json({"status": "partial", "error": str(e), "data": LIVE_CACHE})


def telemetry_worker():
    """Background worker updating NOAA readings periodically."""
    while True:
        try:
            t, cls = goes_now()
            cat = "Quiet"
            if cls.startswith("C"):
                cat = "C-Class (Active Solar Flux)"
            elif cls.startswith("M"):
                cat = "M-Class (Major Solar Storm Warning)"
            elif cls.startswith("X"):
                cat = "X-Class (Extreme Space Weather Event)"
            LIVE_CACHE["goes_xray"] = {
                "time_tag": t,
                "flux_class": cls,
                "category": cat
            }
        except Exception:
            pass
        time.sleep(120)  # Check every 2 minutes


def run_server(port=8080):
    t_thread = threading.Thread(target=telemetry_worker, daemon=True)
    t_thread.start()

    server_address = ("0.0.0.0", port)
    httpd = ThreadingHTTPServer(server_address, DashboardHandler)
    print(f"Solar Flare Forecasting Dashboard running at http://localhost:{port}/")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", sys.argv[1] if len(sys.argv) > 1 else 8080))
    run_server(port)
