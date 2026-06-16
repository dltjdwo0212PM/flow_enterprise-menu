#!/usr/bin/env python3
"""
Asset Vault — Sheet → JSON 변환기

구글시트의 두 탭(assets, applications)을 CSV로 내려받아 ./sheets/ 에 두고 실행하면
앱이 읽는 assets.json 을 생성한다.

  1) 구글시트에서 'assets' 탭 → 파일 > 다운로드 > CSV → sheets/assets.csv
  2) 구글시트에서 'applications' 탭 → CSV → sheets/applications.csv
  3) python3 build_assets.py
  4) public/assets.json 이 갱신된다 (index.html 과 같은 위치 = 정적 배포 대상)

핵심 원칙: '재사용 횟수'는 시트에 숫자로 적지 않는다.
          applications 행 수로 자동 계산된다(=단일 진실원).
"""
import csv, json, os, sys
from datetime import datetime

BASE = os.path.dirname(os.path.abspath(__file__))
SHEETS = os.path.join(BASE, "sheets")
OUT = os.path.join(BASE, "public", "assets.json")

def split_multi(s):
    return [x.strip() for x in (s or "").split("|") if x.strip()]

def truthy(s):
    return str(s or "").strip().lower() in ("1","true","y","yes","예","o","ok")

def read_csv(name):
    path = os.path.join(SHEETS, name)
    if not os.path.exists(path):
        sys.exit(f"[오류] {path} 가 없습니다. 시트를 CSV로 내려받아 sheets/ 에 두세요.")
    with open(path, encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))

def main():
    assets, by_id = [], {}
    for r in read_csv("assets.csv"):
        if not (r.get("id") or "").strip():
            continue
        a = {
            "id": int(r["id"]),
            "feature_key": (r.get("feature_key") or "").strip().upper(),
            "name_ko": (r.get("name_ko") or "").strip(),
            "name_en": (r.get("name_en") or "").strip(),
            "category": (r.get("category") or "미분류").strip(),
            "tier": (r.get("tier") or "resell").strip(),       # std | resell | excl
            "platforms": split_multi(r.get("platforms")),
            "effort_mm": float(r["effort_mm"]) if (r.get("effort_mm") or "").strip() else 0,
            "rev_est": int(float(r["rev_est"])) if (r.get("rev_est") or "").strip() else 0,
            "source": (r.get("source") or "manual").strip(),   # auto | manual
            "is_new": truthy(r.get("is_new")),
            "pm": (r.get("pm") or "").strip(),
            "tags": split_multi(r.get("tags")),
            "description": (r.get("description") or "").strip(),
            "constraints": (r.get("constraints") or "").strip(),
            "demo_url": (r.get("demo_url") or "").strip(),
            "wiki_url": (r.get("wiki_url") or "").strip(),
            "applications": [],
        }
        assets.append(a)
        by_id[a["id"]] = a

    app_rows = 0
    for r in read_csv("applications.csv"):
        if not (r.get("asset_id") or "").strip():
            continue
        aid = int(r["asset_id"])
        if aid not in by_id:
            print(f"[경고] applications: 존재하지 않는 asset_id={aid} (건너뜀)")
            continue
        by_id[aid]["applications"].append({
            "client_name": (r.get("client_name") or "").strip(),
            "client_anon": (r.get("client_anon") or "").strip(),
            "applied_at": (r.get("applied_at") or "").strip(),
            "contract_ref": (r.get("contract_ref") or "").strip(),
        })
        app_rows += 1

    payload = {"generated_at": datetime.now().strftime("%Y-%m-%d %H:%M"), "assets": assets}
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    reused = sum(1 for a in assets if len(a["applications"]) >= 2)
    print(f"OK → {OUT}")
    print(f"  자산 {len(assets)}개 · 적용(applications) {app_rows}행")
    print(f"  재사용(2회+) 자산 {reused}개 · 자산화율 {round(reused/len(assets)*100) if assets else 0}%")

if __name__ == "__main__":
    main()
