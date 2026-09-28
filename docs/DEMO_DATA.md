# Demo Data Guide

**Demo Region:** Delhi-NCR — 1 country, 3 states (Delhi, Haryana, UP), 12 districts.

> [!IMPORTANT]
> All seeded data not from a real public source is flagged `is_illustrative=true` and labelled
> **"Illustrative data"** in the UI. Never present illustrative numbers as official statistics.

---

## Regions (16)

| Level | Entities | Geometry | Population |
|---|---|---|---|
| Country | India | Schematic bbox | 1.417 B |
| State | Delhi (NCT), Haryana, UP | Schematic bbox | — |
| District | Delhi, Gurugram, Faridabad, Sonipat, Jhajjar, Rewari, Palwal, Gautam Buddha Nagar, Ghaziabad, Meerut, Baghpat, Bulandshahr | **Schematic rectangular polygons** | Approximate |

> [!NOTE]
> Boundaries are approximate bounding rectangles. UI must show footnote **"Schematic boundaries – not official survey data."**

---

## Organizations (8)

| Name | Type | Notes |
|---|---|---|
| Ministry of Rural Development | ministry | Real name |
| Delhi Revenue Department | state_dept | Real name |
| Haryana Department of Revenue | state_dept | Real name |
| UP Revenue Board | state_dept | Real name |
| **Illustrative Land Policy Research Unit** | research_org | **Fictional** |
| **NCR Planning Board Research Cell** | research_org | **Fictional** |
| **National Institute of Land Governance Studies** | university | **Fictional** |
| **Delhi-NCR Civil Society Land Watch** | ngo | **Fictional** |

---

## Demo Users (5)

| Email | Role | Password |
|---|---|---|
| researcher@bhuniti.demo | researcher | Demo@1234 |
| analyst@bhuniti.demo | policy_analyst | Demo@1234 |
| official@bhuniti.demo | govt_official | Demo@1234 |
| dataadmin@bhuniti.demo | data_admin | Demo@1234 |
| sysadmin@bhuniti.demo | system_admin | Demo@1234 |

Public / Guest = unauthenticated (no user row).

---

## Indicators (8) + Values (1,920 rows)

All `is_illustrative=true`. Values generated for 12 districts × 20 years (2005–2024).

| Key | Description | Trend |
|---|---|---|
| `built_up_pct` | Built-up area % | Rising; fastest near Delhi core |
| `cropland_pct` | Cropland area % | Falling; inverse of built-up |
| `population_density` | Per km² | Growing 2.2% yr⁻¹ |
| `road_density_km_per_km2` | km road / km² | Slowly rising |
| `groundwater_depth_m` | Pre-monsoon depth (m) | Deepening 0.5–0.8m yr⁻¹ |
| `land_disputes_per_100k` | Disputes per 1L pop | Generally declining; **anomaly spikes** |
| `land_price_index` | Index (base ~2010) | Rising ~8.5% yr⁻¹ |
| `climate_vulnerability_index` | 0–1 composite | Slowly worsening |

**Deliberate anomalies (for anomaly detector demo):**
- Gurugram `land_disputes_per_100k` — spike ×2.8 in 2013
- Gautam Buddha Nagar `land_disputes_per_100k` — spike ×3.1 in 2018
- Baghpat `groundwater_depth_m` — +4.5m step in 2011

---

## Datasets (9)

| Title | Visibility | Status | Illustrative |
|---|---|---|---|
| Delhi-NCR Land-Use / Land-Cover Time Series | public | approved | ✅ |
| NCR Road Density Estimates | public | approved | ✅ |
| NCR Groundwater Depth Annual Observations | public | approved | ✅ |
| **Delhi Land Records Digitisation Status** | **restricted** | approved | ❌ |
| **NCR Land Dispute Court Cases Dataset** | **restricted** | approved | ✅ |
| NCR Land Price Index | public | approved | ✅ |
| NCR Climate Vulnerability Index | public | approved | ✅ |
| NCR Agricultural Census Land Holding Summary | public | approved | ✅ |
| NCR Informal Settlement Land Tenure Survey | internal | **pending_review** | ✅ |

---

## Documents (20)

| Type | Count | Restrictions |
|---|---|---|
| research_paper | 6 | 0 restricted, 0 pending |
| policy | 4 | 0 restricted; 2 are factual DILRMP/SVAMITVA summaries |
| legal | 2 | 0 restricted |
| case_study | 3 | 0 restricted |
| report | 5 | 1 **restricted**, 1 **pending_review** |

**Conflicting evidence pair:**
- `rp5` — Road infrastructure is the primary driver of farmland conversion
- `rp6` — Population demand, not roads, drives conversion (directly contradicts rp5)

**Real programme summaries (not illustrative):**
- DILRMP Overview (`pd3`) — source: dolr.gov.in
- SVAMITVA Programme Brief (`pd4`) — source: svamitva.nic.in

**Author rule:** All illustrative documents use **fictional** author names. No real individuals are named.

---

## Policies (6)

DILRMP, SVAMITVA, LARR Act 2013, NCR Regional Plan 2041, Haryana Land Records Policy 2019, NCR Groundwater Directive.

---

## Evidence Links (~30)

Knowledge graph wiring:
`Policy → Document → Dataset → Region → Indicator`
Including one `contradicts` edge (rp6 → rp5).

---

## Geo Layers (5)

All `is_illustrative=true`. Style config only; no real vector tiles in the seed.

---

## Challenges (8), Projects (2), Saved Searches (2), Audit Events (3)

---

## Cited Facts (for Dashboard)

Loaded from `db/seeds/cited_facts.json`. All carry `verify_before_presenting: true`.

| Fact | Source | Year |
|---|---|---|
| ~98.5% rural records digitised (DILRMP) | MoRD Annual Report 2023-24 | 2024 |
| 3.29+ lakh villages surveyed (SVAMITVA) | MoPR communications | 2024 |
| 2.34 crore property cards issued (SVAMITVA) | MoPR communications | 2024 |
| Land disputes ≈ two-thirds of pending civil cases | NITI Aayog / Law Ministry estimates | 2023 |
| NCR population exceeds 5 crore | Census 2011 projections, NCRPB | 2021 |
