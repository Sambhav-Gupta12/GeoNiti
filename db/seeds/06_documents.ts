import { PoolClient } from 'pg';
import { ORG_IDS } from './01_organizations';
import { USER_IDS } from './02_users';
import { REGION_IDS } from './03_regions';

export const DOC_IDS = {
  // Research papers
  rp1: 'dddddddd-0000-0000-0001-000000000001',
  rp2: 'dddddddd-0000-0000-0001-000000000002',
  rp3: 'dddddddd-0000-0000-0001-000000000003',
  rp4: 'dddddddd-0000-0000-0001-000000000004',
  rp5: 'dddddddd-0000-0000-0001-000000000005',
  rp6: 'dddddddd-0000-0000-0001-000000000006', // Disagrees with rp5
  // Policy documents
  pd1: 'dddddddd-0000-0000-0002-000000000001',
  pd2: 'dddddddd-0000-0000-0002-000000000002',
  pd3: 'dddddddd-0000-0000-0002-000000000003', // DILRMP – real programme summary
  pd4: 'dddddddd-0000-0000-0002-000000000004', // SVAMITVA – real programme summary
  // Legal documents
  ld1: 'dddddddd-0000-0000-0003-000000000001',
  ld2: 'dddddddd-0000-0000-0003-000000000002',
  // Case studies
  cs1: 'dddddddd-0000-0000-0004-000000000001',
  cs2: 'dddddddd-0000-0000-0004-000000000002',
  cs3: 'dddddddd-0000-0000-0004-000000000003',
  // Reports
  rep1: 'dddddddd-0000-0000-0005-000000000001',
  rep2: 'dddddddd-0000-0000-0005-000000000002',
  rep3: 'dddddddd-0000-0000-0005-000000000003', // restricted
  rep4: 'dddddddd-0000-0000-0005-000000000004', // pending
};

type Doc = {
  id: string; type: string; title: string; abstract: string; body: string;
  authors: string[]; org: string; year: number; source_url?: string;
  keywords: string[]; topics: string[]; status: string;
  visibility: string; illustrative: boolean; provenance?: string;
  regions: string[];
};

const docs: Doc[] = [
  // ── Research Papers ─────────────────────────────────────────────────────────
  {
    id: DOC_IDS.rp1, type: 'research_paper',
    title: 'Peri-urbanisation and Farmland Conversion in Delhi-NCR: A Two-Decade Trajectory',
    abstract: 'This paper analyses land-use transitions across 12 Delhi-NCR districts from 2005 to 2024 using multi-temporal land-cover data. It quantifies the extent of cropland-to-urban conversion and identifies proximity to employment centres as the primary driver.',
    authors: ['A. K. Sharma (Illustrative)', 'P. Verma (Illustrative)'],
    org: ORG_IDS.nilgs, year: 2023,
    keywords: ['peri-urbanisation', 'farmland conversion', 'Delhi-NCR', 'land-use change', 'LULCC'],
    topics: ['peri-urbanisation', 'land-use change', 'urban expansion'],
    status: 'approved', visibility: 'public', illustrative: true,
    regions: [REGION_IDS.india, REGION_IDS.delhi_s, REGION_IDS.haryana, REGION_IDS.up],
    body: `Over the two decades spanning 2005 to 2024, the Delhi National Capital Region has undergone one of the most rapid peri-urban transitions recorded in South Asia. Analysis of annual land-cover data for twelve districts — spanning parts of Delhi, Haryana, and Uttar Pradesh — reveals a net cropland loss of approximately 18 to 24 percentage points in fringe districts such as Gurugram, Gautam Buddha Nagar, and Faridabad. The pace of conversion accelerated sharply between 2010 and 2018, coinciding with major infrastructure investments including expressway construction and metro corridor extensions.

The primary driver identified in this study is proximity to employment centres, particularly the Information Technology hubs of Gurugram and Noida. A regression analysis of district-level panel data finds that each additional kilometre of expressway within a district boundary is associated with a statistically significant 0.9 to 1.4 percentage-point increase in the annual rate of cropland conversion. This finding holds after controlling for population growth, land prices, and baseline agricultural productivity.

A secondary driver is the fragmentation of agricultural holdings. Smallholder farms in peri-urban zones face dual pressure from rising non-farm labour wages and increasing input costs. Survey data from village-level transects conducted in Baghpat and Sonipat suggest that households with holdings below 1 hectare are 3.2 times more likely to sell or lease land within five years of receiving a builder offer than those with larger holdings.

Built-up expansion has not been spatially uniform. Districts further from Delhi — Jhajjar, Rewari, and Bulandshahr — show comparatively lower conversion rates despite similar agricultural conditions, suggesting that road connectivity, rather than agricultural marginalisation per se, is the binding constraint on urban spread. This finding has implications for infrastructure planning: new road investments in these districts could unlock rapid conversion of currently productive farmland.

The paper concludes that without binding spatial plans enforced at the metropolitan scale, the current trajectory implies near-complete loss of prime agricultural land within a 30-kilometre radius of the Delhi border by 2035. It calls for a mandatory Environmental Impact Assessment (EIA) for all road projects within the NCR with projected traffic above 15,000 PCUs per day, and for the NCR Planning Board to establish hard agricultural land reservation zones backed by transferable development rights compensation.`,
  },
  {
    id: DOC_IDS.rp2, type: 'research_paper',
    title: 'Groundwater Depletion and Land Governance in the NCR: Linkages and Policy Gaps',
    abstract: 'Rapidly declining groundwater tables in the NCR are intertwined with unregulated land-use change. This paper explores the causal mechanisms linking urbanisation, agricultural intensification, and groundwater depletion, and proposes a land-water governance integration framework.',
    authors: ['S. Mehta (Illustrative)', 'R. Pillai (Illustrative)'],
    org: ORG_IDS.ilpru, year: 2022,
    keywords: ['groundwater', 'land governance', 'NCR', 'water-land nexus', 'overextraction'],
    topics: ['groundwater', 'climate-resilient land use', 'governance'],
    status: 'approved', visibility: 'public', illustrative: true,
    regions: [REGION_IDS.india, REGION_IDS.gnb, REGION_IDS.baghpat, REGION_IDS.ghaziabad],
    body: `The National Capital Region sits atop a rapidly declining aquifer system. Pre-monsoon water table depth in districts such as Gurugram and Baghpat has worsened by an estimated 8 to 14 metres between 2005 and 2023, according to aggregated observations from Central Ground Water Board (CGWB) monitoring wells. This study interrogates the governance dimensions of this crisis, arguing that land-use decisions — taken with no reference to hydrogeological carrying capacity — are the proximate cause of accelerating depletion.

Urban conversion of agricultural land does not automatically reduce groundwater extraction. On the contrary, the paper documents a transition from irrigation demand to domestic and industrial demand that, in aggregate, places equal or greater stress on aquifers. New residential colonies in Noida and Ghaziabad rely extensively on illegal borewells in the absence of adequate municipal water supply, a pattern documented in Right to Information (RTI) responses from municipal bodies in both districts.

Regulatory gaps compound the problem. Land-use conversion is regulated under the Punjab Scheduled Roads and Controlled Areas Restriction of Unregulated Development Act (for Haryana) and the UP Urban Planning and Development Act, but neither statute requires a hydrogeological assessment as a precondition for conversion approval. The paper proposes a Groundwater Impact Assessment (GWIA) as a mandatory clearance condition for large-scale land-use conversions, modelled on procedures in place in the state of Maharashtra.

A spatial analysis presented in this paper identifies 'groundwater-critical zones' — areas where existing extraction rates exceed recharge by more than 40% — that substantially overlap with the most intensive zones of ongoing conversion in the NCR. Overlaying this map with approved master plan land-use designations reveals that 23% of land proposed for urban expansion in district town planning schemes falls within critical groundwater zones.

Policy recommendations include mandatory integration of CGWB hydrogeological maps into district land-use plans, a moratorium on new high-rise residential construction in districts classified as 'Over-exploited' under the Dynamic Groundwater Resources Assessment, and a ring-fenced budget for rooftop rainwater harvesting as a precondition for building plan approval in identified zones.`,
  },
  {
    id: DOC_IDS.rp3, type: 'research_paper',
    title: 'Land Dispute Resolution in Peri-urban India: Evidence from NCR Revenue Courts',
    abstract: 'Drawing on illustrative court data for NCR districts, this paper examines the types, duration, and resolution rates of land disputes. It finds that peri-urban fringe districts face significantly higher dispute rates and longer resolution timelines than core urban districts.',
    authors: ['T. Bose (Illustrative)'],
    org: ORG_IDS.lw_ngo, year: 2021,
    keywords: ['land disputes', 'dispute resolution', 'revenue courts', 'NCR', 'peri-urban'],
    topics: ['dispute resolution', 'land records', 'governance'],
    status: 'approved', visibility: 'public', illustrative: true,
    regions: [REGION_IDS.gurugram, REGION_IDS.gnb, REGION_IDS.sonipat, REGION_IDS.faridabad],
    body: `Land dispute rates in peri-urban India serve as a leading indicator of governance stress. This paper examines illustrative district court data for NCR fringe districts covering the period 2010 to 2022, finding that Gurugram recorded a spike in dispute registrations in 2013 coinciding with a wave of compulsory land acquisitions under the Land Acquisition Act 1894 — the year preceding the enactment of the Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 (LARR Act).

The dominant dispute categories are boundary demarcation conflicts (38%), mutation challenges following inheritance (29%), and disputes arising from land acquisition compensation claims (21%). A notable finding is the 15-year median pendency for acquisition-related disputes in the District Court at Gurugram, against a 4-year median for boundary cases. This asymmetry suggests that the legal complexity of acquisition compensation disputes, rather than court capacity alone, drives pendency.

The paper argues that digital land records — as promoted under the Digital India Land Records Modernisation Programme (DILRMP) — are necessary but not sufficient for dispute reduction. In districts where record digitisation is above 90%, dispute rates have declined for mutation-related cases but remain elevated for boundary and acquisition disputes, where ground-truth verification through physical survey remains essential.

Three case studies from Sonipat, Gautam Buddha Nagar, and Faridabad are presented to illustrate the gap between digitised records and ground conditions. In all three cases, village revenue maps (khasra records) digitised from 1970s-era paper maps contain systematic errors of 2 to 5 metres in boundary demarcation, which modern GPS surveys now reveal. These legacy errors are the proximate cause of a new generation of boundary disputes emerging precisely in areas with high digitisation rates.

The paper calls for a National Land Survey Modernisation Mission complementary to DILRMP, mandating drone-based re-survey of peri-urban revenue circles prioritised by dispute density, with adjudication of discrepancies through a fast-track Special Revenue Tribunal.`,
  },
  {
    id: DOC_IDS.rp4, type: 'research_paper',
    title: 'SVAMITVA Scheme: Early Evidence on Property Rights and Rural Welfare in NCR Villages',
    abstract: 'The SVAMITVA scheme provides legal property rights documents to households in rural abadi areas. This paper evaluates early rollout evidence in NCR-adjacent villages and examines welfare impacts including access to formal credit and dispute reduction.',
    authors: ['M. Krishnan (Illustrative)', 'D. Anand (Illustrative)'],
    org: ORG_IDS.nilgs, year: 2023,
    keywords: ['SVAMITVA', 'property rights', 'rural abadi', 'land titling', 'welfare'],
    topics: ['land records digitisation', 'property rights', 'rural development'],
    status: 'approved', visibility: 'public', illustrative: true,
    regions: [REGION_IDS.india, REGION_IDS.up, REGION_IDS.haryana],
    body: `The SVAMITVA (Survey of Villages Abadi and Mapping with Improvised Technology in Village Areas) scheme, launched in April 2020 by the Ministry of Panchayati Raj, aims to provide property rights cards — 'Adhikar Patra' — to residents of rural abadi (inhabited) areas. By providing legally recognised documentation of habitation land, the scheme seeks to enable formal credit access, reduce intra-village boundary disputes, and integrate rural populations into the formal property market.

This paper draws on illustrative household survey data from 24 NCR-adjacent villages in western Uttar Pradesh and southern Haryana to examine early welfare outcomes among surveyed households. The sample was stratified by landholding size, caste category, and proximity to the nearest urban agglomeration.

A difference-in-differences analysis comparing surveyed households before and after receipt of property cards finds a 27 percentage point increase in reported access to formal institutional credit among title recipients. This is consistent with the theoretical expectation that formalised property rights reduce collateral risk for lenders. However, the effect is substantially larger for households with existing bank accounts and prior credit histories, suggesting that title alone is insufficient without accompanying financial inclusion measures.

Dispute effects are more nuanced. In the 24 villages surveyed, drone mapping revealed 312 boundary discrepancies in habitation areas, of which 89 were actively contested as of the survey date. Dispute registration rates did not decline significantly in the two years post-mapping; rather, the availability of precise drone maps appears to have crystallised previously informal or tolerated encroachments into formal disputes. Revenue officials in Hapur and Baghpat report a 40% increase in mutation objection petitions following drone survey completion.

The paper concludes that SVAMITVA creates a foundation for improved land governance but requires complementary investments in fast-track dispute adjudication, financial inclusion, and community-level mediation before its welfare potential can be fully realised. A national administrative database tracking post-survey dispute registration rates per village is recommended.`,
  },
  {
    id: DOC_IDS.rp5, type: 'research_paper',
    title: 'Road Infrastructure as the Primary Driver of Peri-Urban Conversion in NCR',
    abstract: 'Using a spatial panel model, this paper argues that new road investment — not population pressure or housing demand — is the first-order driver of farmland conversion in NCR fringe districts. Policy should restrict new highways into agricultural zones.',
    authors: ['V. Nair (Illustrative)'],
    org: ORG_IDS.ncrb, year: 2022,
    keywords: ['road infrastructure', 'farmland conversion', 'spatial panel', 'NCR', 'peri-urban'],
    topics: ['peri-urbanisation', 'infrastructure', 'land-use change'],
    status: 'approved', visibility: 'public', illustrative: true,
    regions: [REGION_IDS.india, REGION_IDS.haryana, REGION_IDS.up],
    body: `The conventional explanation for farmland loss in metropolitan fringes focuses on population growth and housing demand. This paper challenges that framing for the NCR, presenting evidence from a spatial panel model of twelve districts over the period 2005–2022 that road infrastructure investment — as measured by National Highway and Expressway route-km added per district per annum — is the statistically dominant predictor of land-use conversion, surpassing demographic variables in both magnitude and consistency.

The model controls for population growth, economic output (GSDP per capita), agricultural productivity (yield per hectare of principal crops), and proximity to the Delhi border. After controlling for these factors, the road infrastructure variable retains an elasticity of approximately 1.8: a doubling of annual highway investment in a district is associated with an 80% increase in the rate of agricultural land conversion in the following two years.

The mechanism proposed is one of speculative land acquisition preceding planned highway corridors. Analysis of dated land transaction records from state registration departments shows a consistent pattern: agricultural-to-residential conversion rates spike 18 to 30 months before a highway opening, suggesting that speculative purchases by real estate developers are triggered by highway alignment announcements rather than actual connectivity improvements.

This finding has a direct policy implication. Current Master Plans and Regional Plans treat road investment and land-use change as coordinated planning instruments. The evidence here suggests they are not — infrastructure investment decisions are made without binding land-use pre-commitments, creating a window for speculative conversion that undermines food security and ecological services. The paper proposes mandatory Agricultural Land Reservation Notifications before highway alignment finalisation, enforceable by the National Highways Authority of India as a condition of Environmental Clearance.

This position contrasts with the conventional policy view, which holds that road investment enables agricultural market integration and thus should be prioritised in rural areas. The paper does not contest this finding for remote rural areas, but argues that within 80 km of Delhi, the speculative land market effect dominates.`,
  },
  {
    id: DOC_IDS.rp6, type: 'research_paper',
    title: 'Population Growth, Not Infrastructure, Drives Farmland Loss in NCR: A Demand-Side Analysis',
    abstract: 'This paper presents a demand-side model of peri-urban farmland conversion in NCR, arguing that population-driven housing demand is the primary driver. Road investment is a facilitator, not a cause. Policies should focus on housing supply reform, not highway moratoria.',
    authors: ['G. Tripathi (Illustrative)', 'L. Kapoor (Illustrative)'],
    org: ORG_IDS.ilpru, year: 2023,
    keywords: ['housing demand', 'farmland conversion', 'population growth', 'NCR', 'supply reform'],
    topics: ['peri-urbanisation', 'housing', 'land-use change'],
    status: 'approved', visibility: 'public', illustrative: true,
    regions: [REGION_IDS.india, REGION_IDS.haryana, REGION_IDS.up],
    body: `This paper directly engages with the infrastructure-led conversion thesis (see Nair, 2022) and argues that it rests on a misidentification of causal direction. Road investment in NCR districts is itself a response to population-driven demand — it is endogenous to urban growth. Failing to account for this endogeneity inflates the estimated impact of road kilometres on land conversion and leads to incorrect policy conclusions.

Using an instrumental variable (IV) approach — instrumenting highway investment with historical colonial-era road alignments and topographic constraints — the authors find that the causal effect of road investment on conversion rates falls by 60% and loses statistical significance at the 5% level. By contrast, population growth instrumented with out-of-state migration rates retains a large, significant, and positive effect on conversion. A 10% increase in population in a district is associated with a 7 to 9 percentage point increase in built-up area over the following five years.

The demand-side framing implies a different set of interventions. Rather than restricting infrastructure investment, which would reduce labour market integration and agricultural market access, policy should focus on enabling housing supply densification within existing urban footprints. Floor Space Index (FSI) liberalisation in Gurugram and Ghaziabad — both of which have FSI ceilings well below international comparable cities — is estimated to be able to accommodate an additional 400,000 dwelling units without any expansion of the current urban boundary.

The paper also addresses the speculative land market argument of Nair (2022), acknowledging that pre-announcement speculation exists but arguing it is a second-order effect that can be addressed through a time-bound land use freeze on highway alignment announcement, rather than a blanket highway moratorium. A 24-month freeze on conversion applications along announced alignments would preserve the infrastructure investment option while limiting speculation.

This position is thus not simply the opposite of the infrastructure-restriction thesis but a more calibrated intervention: address the demand with supply reforms, and manage the infrastructure-speculation nexus with targeted freeze mechanisms rather than broad moratoria.`,
  },

  // ── Policy Documents ─────────────────────────────────────────────────────────
  {
    id: DOC_IDS.pd1, type: 'policy',
    title: 'NCR Regional Plan 2041 – Land Use and Settlement Policy Chapter (Illustrative Summary)',
    abstract: 'An illustrative summary of land-use and settlement policy directions from the NCR Regional Plan 2041 framework, focusing on agricultural land protection, urban expansion zones, and green belts.',
    authors: ['NCR Planning Board Research Cell (Illustrative)'],
    org: ORG_IDS.ncrb, year: 2021,
    keywords: ['NCR Regional Plan', 'land use policy', 'green belt', 'urban expansion', 'settlement'],
    topics: ['peri-urbanisation', 'planning', 'land-use change'],
    status: 'approved', visibility: 'public', illustrative: true,
    regions: [REGION_IDS.india, REGION_IDS.delhi_s, REGION_IDS.haryana, REGION_IDS.up],
    body: `The illustrative summary below describes the kinds of land-use and settlement policy provisions that might appear in a regional planning document for a metropolitan region of the scale and character of NCR. It is not a reproduction of any official document.

A regional plan of this type would typically delineate the metropolitan region into zones: a Core Urban Zone (encompassing existing notified urban areas), a Controlled Urbanisation Zone (peri-urban areas approved for planned development subject to environmental and infrastructure assessments), an Agricultural Priority Zone (prime agricultural land designated for long-term retention), and a Natural and Ecological Zone (forests, wetlands, and floodplains with development restrictions).

Within the Controlled Urbanisation Zone, the plan would typically require Detailed Development Plans (DDPs) approved by the competent authority before construction commencement, mandatory provision of social infrastructure (schools, health facilities) at defined per capita standards, and a green area requirement of not less than 20% of the gross development area.

Agricultural Priority Zones would be supported by economic instruments including Transferable Development Rights (TDRs) that permit landholders within these zones to sell development rights to developers operating in designated receiving zones, thereby providing economic compensation for agricultural land retention without public expenditure.

Green belts around major urban centres are typically maintained through strict no-construction regulations, managed by the Revenue Department. The plan would also describe inter-agency coordination mechanisms for land-use conflict resolution among multiple authorities — municipal corporations, development authorities, cantonment boards, and industrial development authorities — that exercise overlapping jurisdiction in NCR.`,
  },
  {
    id: DOC_IDS.pd2, type: 'policy',
    title: 'Haryana Panchayati Raj Land Records Management Policy 2019 (Illustrative)',
    abstract: 'An illustrative policy document describing procedures for digitisation, validation, and management of village-level land records under the Panchayati Raj framework in Haryana.',
    authors: ['Haryana Department of Revenue (Illustrative)'],
    org: ORG_IDS.haryana_rev, year: 2019,
    keywords: ['land records', 'panchayati raj', 'digitisation', 'Haryana', 'revenue records'],
    topics: ['land records digitisation', 'governance'],
    status: 'approved', visibility: 'public', illustrative: true,
    regions: [REGION_IDS.haryana, REGION_IDS.sonipat, REGION_IDS.jhajjar],
    body: `The illustrative policy document described here reflects the kinds of institutional provisions that a state government land records management policy might contain in the context of the Digital India Land Records Modernisation Programme (DILRMP). The content is illustrative and does not reproduce any official Haryana government document.

A Haryana Panchayati Raj Land Records Management Policy of this type would typically specify the roles of Patwaris (field revenue officials) in verifying digitised khasra and girdawari records, define timelines for mutation processing following registration events, and establish a public grievance redressal mechanism for record-correction petitions.

The policy would mandate that all revenue records be available in both Hindi and English on the state land records portal, with free public access to jamabandi (record of rights) extracts. It would define a State Land Records Authority under the Board of Revenue with oversight of data quality, audit, and annual reporting functions.

A critical provision in policies of this type is the definition of an authoritative source: where discrepancies exist between paper-based and digitised records, the policy specifies which takes precedence and the adjudication procedure for resolving conflicts. Typically, the Patwari's field survey is treated as ground truth, with digitised records treated as presumptive evidence subject to field verification.

The policy would also address the transition to drone-based survey updates, specifying the procuement procedure for survey drones, the competence certification requirements for drone operators in revenue departments, and the legal admissibility of drone-derived boundary coordinates in revenue court proceedings.`,
  },
  {
    id: DOC_IDS.pd3, type: 'policy',
    title: 'Digital India Land Records Modernisation Programme (DILRMP): Programme Overview and Status',
    abstract: 'A factual summary of the DILRMP — a Centrally Sponsored Scheme for digitising land records, computerising registration, and linking records across states. As of 2024, approximately 98.5% of rural land records have been digitised. Source: Ministry of Rural Development Annual Report 2023-24.',
    authors: ['Ministry of Rural Development'],
    org: ORG_IDS.mord, year: 2024,
    source_url: 'https://dolr.gov.in/dilrmp',
    keywords: ['DILRMP', 'land records', 'digitisation', 'RoR', 'mutation', 'registration'],
    topics: ['land records digitisation', 'governance', 'digital india'],
    status: 'approved', visibility: 'public', illustrative: false,
    provenance: 'Factual summary based on Ministry of Rural Development Annual Report 2023-24 and DILRMP programme documentation. Source: https://dolr.gov.in/dilrmp. Verify statistics before presentation.',
    regions: [REGION_IDS.india],
    body: `The Digital India Land Records Modernisation Programme (DILRMP), earlier known as the National Land Records Modernisation Programme (NLRMP), is a Centrally Sponsored Scheme of the Government of India administered by the Department of Land Resources (DoLR) under the Ministry of Rural Development. The programme aims to modernise the land records management system, reduce land disputes, and provide updated, digitised land ownership records to landholders.

The programme operates through four core components: (i) computerisation of Record of Rights (RoR); (ii) computerisation of Registration; (iii) integration of RoR and Registration; and (iv) cadastral map digitisation and creation of a Modern Record Room. As of the financial year 2023-24, approximately 98.5% of rural land records have been digitised across participating states, according to figures published in the Ministry of Rural Development Annual Report 2023-24. This statistic should be verified against the latest DILRMP dashboard before presentation.

The SVAMITVA scheme, launched in 2020, complements DILRMP by providing property rights documentation to residents of rural abadi (habitation) areas — land that was previously excluded from formal land records systems because it fell outside agricultural revenue records. SVAMITVA uses drone surveys to create updated cadastral maps of village abadi areas and issue property cards (Adhikar Patra) backed by state government authority.

A key integration target is the Unique Land Parcel Identification Number (ULPIN), also called Bhu-Aadhaar, which assigns a 14-digit unique identifier to every land parcel in the country. ULPIN enables linking of land records across different government databases — including the PM-KISAN beneficiary database, crop insurance records, and sub-registrar offices — thereby reducing duplication and facilitating targeted agricultural subsidies. As of early 2024, ULPIN has been rolled out across multiple states.

The programme has demonstrably reduced certain categories of land disputes in participating states where integration between revenue records and registration systems has been achieved. However, boundary disputes arising from legacy cadastral map errors and disputes related to sharecropping and tenancy arrangements — which may not be captured in formal ownership records — remain outside the direct scope of DILRMP.`,
  },
  {
    id: DOC_IDS.pd4, type: 'policy',
    title: 'SVAMITVA Scheme: Survey of Villages Abadi and Mapping — Programme Brief',
    abstract: 'A factual programme summary of SVAMITVA. As of March 2024, over 3.29 lakh villages have been surveyed and approximately 2.34 crore property cards issued. Source: Ministry of Panchayati Raj.',
    authors: ['Ministry of Panchayati Raj'],
    org: ORG_IDS.mord, year: 2024,
    source_url: 'https://svamitva.nic.in',
    keywords: ['SVAMITVA', 'property rights', 'drone survey', 'abadi', 'property card', 'rural'],
    topics: ['land records digitisation', 'property rights', 'rural development'],
    status: 'approved', visibility: 'public', illustrative: false,
    provenance: 'Factual summary based on Ministry of Panchayati Raj programme communications and press releases. Source: https://svamitva.nic.in. Statistics should be verified before presentation.',
    regions: [REGION_IDS.india],
    body: `SVAMITVA — Survey of Villages Abadi and Mapping with Improvised Technology in Village Areas — is a Central Sector Scheme of the Government of India launched on 24 April 2020 by the Ministry of Panchayati Raj. The scheme addresses a historical gap in Indian land administration: habitation land within villages (abadi areas) was largely absent from formal land records systems, leaving rural residents without legally recognised ownership documentation for their homes.

The scheme uses Continuously Operating Reference Station (CORS) network-enabled drone surveys to create high-resolution cadastral maps of rural abadi areas. These maps are used by state revenue authorities to prepare updated records, on the basis of which property rights documents — called Adhikar Patra or property cards — are issued to eligible residents. In many states, the property cards are signed by the Chief Minister to emphasise their legal standing.

As of March 2024, more than 3.29 lakh (329,000) villages across India have been surveyed under SVAMITVA, and approximately 2.34 crore (23.4 million) property cards have been issued or prepared for distribution. These figures are sourced from Ministry of Panchayati Raj communications and should be verified against the latest SVAMITVA dashboard at svamitva.nic.in before citation in official documents.

Welfare assessments of the scheme note two primary intended channels of impact: (i) formalisation of property rights enables residents to access formal credit using their property card as collateral; and (ii) precisely delimited boundaries reduce intra-village boundary and encroachment disputes. Early qualitative assessments from pilot states (Maharashtra, Karnataka, Uttar Pradesh, and Haryana) reported positive household reception, though the credit access channel has been slower to materialise than initially anticipated, partly due to banking sector hesitancy to accept property cards as standalone collateral without additional credit history.

The survey process itself has surfaced legacy boundary disputes in abadi areas, with some villages recording a short-term increase in dispute registrations following drone survey completion as previously informal arrangements are crystallised into formal records. Revenue departments in several states have established dedicated Fast Track Courts for post-survey dispute adjudication.`,
  },

  // ── Legal Documents ──────────────────────────────────────────────────────────
  {
    id: DOC_IDS.ld1, type: 'legal',
    title: 'Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 — Key Provisions Summary',
    abstract: 'A summary of the key provisions of the LARR Act 2013 as they apply to land acquisition for infrastructure and urban development in NCR, including consent requirements, compensation norms, and R&R provisions.',
    authors: ['National Institute of Land Governance Studies (Illustrative)'],
    org: ORG_IDS.nilgs, year: 2020,
    keywords: ['LARR Act', 'land acquisition', 'compensation', 'rehabilitation', 'resettlement', 'consent'],
    topics: ['land acquisition', 'legal framework', 'governance'],
    status: 'approved', visibility: 'public', illustrative: true,
    regions: [REGION_IDS.india],
    body: `The Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 (LARR Act 2013) replaced the colonial-era Land Acquisition Act, 1894, which had governed compulsory land acquisition in India for over a century. The LARR Act introduced fundamental changes to the legal framework for acquisition, with particular relevance to peri-urban contexts such as the National Capital Region.

The most significant procedural change is the Social Impact Assessment (SIA) requirement. For acquisitions above specified thresholds, the acquiring authority must commission an independent SIA, published for public comment, assessing the project's impact on livelihoods, community assets, and social fabric of the affected population. The SIA report must be considered by a multi-member Expert Group before acquisition proceeds.

Compensation norms under the LARR Act are substantially higher than under the 1894 Act. The market value of land — determined by the higher of the registered sale price over the preceding three years or the circle rate — is multiplied by a factor of one (for urban areas) or two (for rural areas), and an additional 100% 'solatium' is payable. For peri-urban NCR, where land is often registered at below-market prices to minimise stamp duty, this formula can still undervalue actual market prices, leading to compensation disputes.

Consent requirements apply to Public-Private Partnership projects (80% consent of affected families required) and private purchase of land for development (70% consent). For purely governmental acquisitions, consent is not formally required but the SIA process serves as a public participation mechanism.

Rehabilitation and Resettlement (R&R) provisions mandate the preparation of an R&R Scheme for acquisitions meeting specified thresholds of displaced families. The scheme must include provisions for alternative housing sites, employment or livelihoods assistance, and infrastructure in resettlement colonies. Implementation of R&R provisions has been inconsistent across states, with NGOs documenting significant gaps in NCR projects, particularly for informal settlers who do not hold formal land records.`,
  },
  {
    id: DOC_IDS.ld2, type: 'legal',
    title: 'Urban Land (Ceiling and Regulation) Repeal Act, 1999 and Its Aftermath in NCR',
    abstract: 'An illustrative analysis of the repeal of the Urban Land Ceiling Act and its consequences for land markets and speculation in NCR, examining how repeal-era land releases interacted with subsequent urbanisation.',
    authors: ['Delhi-NCR Civil Society Land Watch (Illustrative)'],
    org: ORG_IDS.lw_ngo, year: 2019,
    keywords: ['urban land ceiling', 'land reform', 'speculation', 'land market', 'NCR', 'repeal'],
    topics: ['land acquisition', 'legal framework', 'peri-urbanisation'],
    status: 'approved', visibility: 'public', illustrative: true,
    regions: [REGION_IDS.india, REGION_IDS.delhi_s, REGION_IDS.haryana],
    body: `The Urban Land (Ceiling and Regulation) Act (ULCA), 1976 had imposed limits on the quantum of urban land any single entity could hold, with surplus land intended for acquisition by state governments for public housing. The Act was repealed by the Urban Land (Ceiling and Regulation) Repeal Act, 1999, on the recommendation of the National Commission on Urbanisation, which found the ceiling regime had failed to deliver public housing and had instead generated widespread litigation and artificial land scarcity.

The repeal released large parcels of land that had been under declaratory proceedings back into private circulation. In NCR, this had a material effect on land supply, particularly in secondary cities such as Ghaziabad and Faridabad, where significant ceiling-surplus land was held. The timing of repeal — in the late 1990s — coincided with the beginning of the IT sector-driven demand surge in NCR, and this combination produced a rapid escalation of land prices in the 2000s.

Critics of the repeal argue that it transferred wealth from potential public housing beneficiaries to speculative investors, who acquired released parcels at distressed prices and sold them at market rates during the subsequent boom. Proponents argue that the release of constrained supply was a necessary precondition for the expansion of the housing market, which ultimately increased overall supply through private development.

A mapping of repeal-era land releases in Ghaziabad and Faridabad against subsequent land-use change shows that the majority of released parcels were converted to residential and commercial use within five years of repeal, yielding private returns substantially above the 1999 acquisition prices. Very little of the released land was used for affordable housing, despite policy intentions.

This paper argues that the repeal experience offers a cautionary lesson for current proposals to free up government-held urban land. Without binding affordable housing requirements attached to land releases, market forces will allocate released land to high-value uses, replicating the outcomes of 1999.`,
  },

  // ── Case Studies ─────────────────────────────────────────────────────────────
  {
    id: DOC_IDS.cs1, type: 'case_study',
    title: 'Gurugram Land Acquisition Disputes 2010-2015: Lessons from the Cyber City Expansion',
    abstract: 'A case study of compulsory land acquisitions for infrastructure development in Gurugram between 2010 and 2015, examining compensation disputes, protest movements, and ultimate resolution timelines.',
    authors: ['P. Anand (Illustrative)'],
    org: ORG_IDS.lw_ngo, year: 2021,
    keywords: ['Gurugram', 'land acquisition', 'infrastructure', 'compensation disputes', 'protest'],
    topics: ['land acquisition', 'dispute resolution', 'peri-urbanisation'],
    status: 'approved', visibility: 'public', illustrative: true,
    regions: [REGION_IDS.gurugram],
    body: `Between 2010 and 2015, the Haryana Urban Development Authority (HUDA) and the National Highways Authority of India (NHAI) jointly undertook a series of land acquisitions in Gurugram district to facilitate the expansion of commercial zones and expressway construction associated with the Cyber City development corridor. This case study documents the acquisition process, the disputes that arose, and the lessons for future acquisition policy.

A total of approximately 1,800 acres of agricultural land was acquired across multiple village revenue circles in Gurugram over this period. Compensation was computed at the prevailing collector circle rates, which were substantially below market transaction prices documented in the adjoining residential colonies. The disparity — in some cases a factor of 4 to 6 between circle rates and market value — was the immediate cause of farmer protests and a wave of compensation petition filings in the District Court.

The protests, organised through a farmers' cooperative, drew significant media attention in 2012 and 2013 and contributed to the political pressure that resulted in the passage of the LARR Act, 2013. Ironically, the LARR Act's higher compensation norms applied only to acquisitions initiated after 1 January 2014, leaving the bulk of Gurugram acquisition cases subject to the old 1894 Act norms.

Court outcomes for the Gurugram acquisition petitions were mixed. Where petitioners could establish discrepancy between circle rates and demonstrated market prices through sale registration evidence, courts enhanced compensation by 30 to 60%. Where the only evidence was verbal testimony of price expectations, petitions generally failed. The illustrative data for this case study records a spike in dispute registrations in Gurugram in 2013 consistent with the timing of this litigation wave.

Lessons for future acquisition include the importance of land valuation by independent expert committees rather than reliance on administrative circle rates, advance publication of acquisition plans to enable land market monitoring, and community consultations before site finalisation rather than after acquisition notification.`,
  },
  {
    id: DOC_IDS.cs2, type: 'case_study',
    title: 'DILRMP Implementation in Delhi Revenue Circles: Progress and Persistent Gaps',
    abstract: 'An illustrative case study of DILRMP rollout in three Delhi revenue districts, examining digitisation progress, integration with the sub-registrar office, and remaining challenges.',
    authors: ['National Institute of Land Governance Studies (Illustrative)'],
    org: ORG_IDS.nilgs, year: 2022,
    keywords: ['DILRMP', 'Delhi', 'revenue circles', 'digitisation', 'registration integration'],
    topics: ['land records digitisation', 'governance'],
    status: 'approved', visibility: 'public', illustrative: true,
    regions: [REGION_IDS.delhi_d, REGION_IDS.delhi_s],
    body: `Delhi presents an unusual case study for land records modernisation because, as a Union Territory, it operates under direct Central Government oversight through the Lieutenant Governor, potentially enabling faster administrative reforms than states with autonomous revenue departments. This case study examines DILRMP implementation in three illustrative revenue districts — representing the urban core, an urban-rural fringe, and a trans-Yamuna peri-urban zone — to assess progress and remaining challenges.

Record digitisation — defined as conversion of paper jamabandi and khasra records to digital format accessible on the Delhi land records portal — is reported at above 95% for Delhi as a whole. However, the case study finds significant variation by record type: ownership records (jamabandi) are highly digitised, but mutation records — which reflect the most recent ownership transfers — have a digitisation lag of three to eight months because Patwaris must physically verify mutation requests before recording them in the system.

Integration with the Sub-Registrar's Office (SRO) is partially implemented. Sale deed registrations at the SRO are automatically flagged to the revenue system, but mutation of records still requires a separate manual application by the buyer. This procedural gap means that the land records portal often reflects a former owner up to six months after a sale transaction has been registered, creating ambiguity that has given rise to fraudulent duplicate sale transactions in at least eleven documented cases.

Cadastral map digitisation faces a different challenge. Delhi's village revenue maps were mostly prepared in the 1920s and 1930s during British-era settlement surveys. Digitised versions of these maps contain the historical measurement units (bighas, biswa, biswansi) that were not always uniformly defined across revenue circles. GIS overlay of the digitised cadastral maps against modern high-resolution satellite imagery reveals boundary discrepancies of 2 to 12 metres in 38% of revenue plot boundaries examined in the sample areas.

Recommendations include: (i) automating mutation on the basis of registered sale deeds, requiring only exceptions to be manually verified; (ii) commissioning a systematic GPS-based re-survey of urban revenue plots in Delhi using SVAMITVA-like drone technology; and (iii) establishing a centralised fraud alert system linked between the SRO and the revenue record database.`,
  },
  {
    id: DOC_IDS.cs3, type: 'case_study',
    title: 'Climate-Resilient Land Use Planning: Baghpat District Groundwater Stress Response',
    abstract: 'A case study of the groundwater crisis in Baghpat district, documenting the anomalous depletion event of 2011 and subsequent district administration responses, with lessons for climate-resilient land governance.',
    authors: ['S. Kaur (Illustrative)'],
    org: ORG_IDS.ilpru, year: 2023,
    keywords: ['groundwater', 'Baghpat', 'climate resilience', 'land governance', 'water stress'],
    topics: ['climate-resilient land use', 'groundwater', 'governance'],
    status: 'approved', visibility: 'public', illustrative: true,
    regions: [REGION_IDS.baghpat, REGION_IDS.up],
    body: `Baghpat district in western Uttar Pradesh represents a ground-level study of the intersection between agricultural land use, groundwater governance, and climate resilience. The district lies in the Ganga-Yamuna Doab, historically one of India's most productive agricultural belts, but groundwater levels have declined sharply over the past two decades due to intensive irrigation for sugarcane and wheat cultivation combined with erratic monsoon recharge.

In 2011, monitoring data recorded an anomalous single-year decline in average groundwater depth of approximately 4.5 metres — significantly above the trend-line decline of 0.5 to 0.8 metres per year typical of preceding years. District administration records attribute this anomaly to a combination of a below-normal monsoon (the June–September 2011 season received approximately 72% of normal rainfall in this zone) and a simultaneous expansion of area under sugarcane, a highly water-intensive crop, following the announcement of a new sugar mill in an adjoining district.

The administrative response was limited to an advisory from the district magistrate to farmers to reduce paddy transplanting, with no enforcement mechanism. The Uttar Pradesh Ground Water Act, which provides for declaration of groundwater-stressed areas with associated restrictions on new borewell sinking, was not invoked. The case illustrates the governance gap between scientific monitoring capacity — which identified the anomaly — and regulatory authority — which lacked either the mandate or the institutional capacity to respond.

The 2011 event has been incorporated into this seed dataset as a deliberate anomaly to demonstrate the platform's anomaly detection capability. Users of the trend analytics module will see a clear spike in groundwater depth for Baghpat in 2011, flagged as a detected anomaly, with a link to this case study document.

Recommendations from this case study for climate-resilient land governance include: integrating CGWB groundwater monitoring data into district agricultural extension advisories; establishing automatic triggers in the groundwater management framework that prompt district administrations to invoke the UP Ground Water Act when certain depletion thresholds are crossed; and including groundwater recharge provisions as a mandatory land-use planning requirement in all new township approvals.`,
  },

  // ── Reports ──────────────────────────────────────────────────────────────────
  {
    id: DOC_IDS.rep1, type: 'report',
    title: 'NCR Land Governance Annual Review 2023 (Illustrative)',
    abstract: 'An illustrative annual review of land governance developments across NCR districts in 2023, covering digitisation progress, major court decisions, policy changes, and land market trends.',
    authors: ['NCR Planning Board Research Cell (Illustrative)'],
    org: ORG_IDS.ncrb, year: 2023,
    keywords: ['annual review', 'NCR', 'land governance', '2023', 'policy update'],
    topics: ['land records digitisation', 'dispute resolution', 'peri-urbanisation'],
    status: 'approved', visibility: 'public', illustrative: true,
    regions: [REGION_IDS.india, REGION_IDS.delhi_s, REGION_IDS.haryana, REGION_IDS.up],
    body: `This illustrative annual review synthesises land governance developments across twelve NCR districts over the calendar year 2023. It is produced by the NCR Planning Board Research Cell as a monitoring and accountability document for the NCR Coordination Committee. The content is illustrative and does not represent official NCRPB reporting.

On land records digitisation, all three NCR states reported progress under DILRMP. Delhi achieved greater than 95% digitisation of ownership records and initiated a pilot for automated mutation on the basis of registered sale deeds in three revenue circles. Haryana completed integration of the HARIS (Haryana Revenue and Information System) with the Sub-Registrar Online Module in 12 of 22 districts, enabling real-time mutation flagging after registration. Uttar Pradesh completed Phase III of its e-Dharti portal rollout, bringing online mutation services to approximately 80% of tehsils.

Land dispute trends in NCR showed continued decline in boundary-related disputes, attributed to improved availability of digitised khasra maps. However, acquisition-related disputes rose by an estimated 11% over 2022, reflecting an increase in compulsory acquisition notifications for expressway and metro corridor extensions. NCR courts designated under the National Highways Amendment Act received a significant volume of new acquisition petitions.

Land market indicators across NCR showed continued price appreciation, with higher rates in Gurugram, Faridabad, and Gautam Buddha Nagar. Prices in outer districts — Rewari, Jhajjar, and Palwal — remained relatively flat, consistent with the infrastructure-driven conversion hypothesis in that appreciation tracks proximity to planned road corridors.

Environmental concerns dominated public discourse around land governance in 2023. NCR districts received formal notices from the National Green Tribunal (NGT) regarding construction activity in floodplain zones, and the Environment Clearance process for several large township projects was challenged by civil society organisations citing non-compliance with the Environmental Impact Assessment Notification 2006.`,
  },
  {
    id: DOC_IDS.rep2, type: 'report',
    title: 'BhuNiti Platform Data Quality and Methodology Report (Illustrative)',
    abstract: 'A transparency report describing the data sources, methodologies, and limitations of the illustrative datasets in the BhuNiti demonstration platform, including the indicator time series, document corpus, and geospatial layers.',
    authors: ['BhuNiti Demo Team (Illustrative)'],
    org: ORG_IDS.nilgs, year: 2024,
    keywords: ['data quality', 'methodology', 'illustrative data', 'BhuNiti', 'demo'],
    topics: ['governance', 'data quality'],
    status: 'approved', visibility: 'public', illustrative: true,
    regions: [REGION_IDS.india],
    body: `This report describes the data sources and methodology used to construct the illustrative dataset that populates the BhuNiti demonstration platform. It is provided to ensure transparency with users, particularly those evaluating the platform for production deployment, and is required by the platform's design principle of always labelling synthetic data as "Illustrative data."

The indicator time series (built_up_pct, cropland_pct, population_density, road_density, groundwater_depth, land_disputes_per_100k, land_price_index, climate_vulnerability_index) for twelve NCR districts over 2005–2024 were generated using a parameterised simulation. Baseline values for each district were set based on published aggregate statistics for the NCR region. Annual trends were modelled using literature-derived rates (e.g., urbanisation rates of 1–3% per year for fringe districts). Gaussian noise was added to each series to create realistic variation. Two deliberate anomalies were introduced: a spike in land disputes for Gurugram in 2013 (reflecting historical acquisition litigation patterns) and an anomalous groundwater depth drop in Baghpat in 2011 (simulating a documented drought and intensification event). All indicator values are flagged is_illustrative=true.

The document corpus contains 20 documents across five types. Eighteen are fully illustrative, authored by fictional names attributed to fictional organisations. Two documents — the DILRMP programme brief and the SVAMITVA programme brief — are factual summaries of real Government of India programmes, with source URLs and provenance notes. All documents are marked is_illustrative=true except those two.

Geographic boundaries for all 16 regions (1 country, 3 states, 12 districts) are simplified rectangular polygons derived from approximate bounding box coordinates. They are not official survey boundaries and are labelled "Schematic boundaries – not official survey data." Users requiring official boundaries should consult the Survey of India, NCRPB, or state revenue departments.

No official government data, no real individual names, and no real organisation-specific statistics have been invented or misrepresented in this dataset.`,
  },
  {
    id: DOC_IDS.rep3, type: 'report',
    title: 'NCR District Administration Confidential Land Use Compliance Report 2023',
    abstract: 'Internal report on land-use compliance violations in NCR districts. Restricted — not for public release.',
    authors: ['NCR Planning Board Research Cell (Illustrative)'],
    org: ORG_IDS.ncrb, year: 2023,
    keywords: ['compliance', 'violations', 'NCR', 'restricted', 'internal'],
    topics: ['governance', 'land-use change'],
    status: 'approved', visibility: 'restricted', illustrative: true,
    provenance: 'Illustrative internal report. Restricted visibility — must not appear in public search or RAG.',
    regions: [REGION_IDS.india, REGION_IDS.haryana, REGION_IDS.up],
    body: `This is an illustrative restricted internal report. Its visibility is set to "restricted" to demonstrate the platform's RBAC capability. It does not appear in public search results, the RAG assistant, or the public document repository. Only users with data_admin or system_admin roles can access it.

The report would typically contain aggregated data on unauthorized construction activities, compounding violations, and land-use deviations from approved master plans detected through aerial survey and complaint-based inspections. District-wise enforcement action tables, pending show-cause notices, and demolition orders would be included.

No real compliance data is contained in this illustrative document.`,
  },
  {
    id: DOC_IDS.rep4, type: 'report',
    title: 'NCR Informal Settlements Land Tenure Survey: Preliminary Findings 2023',
    abstract: 'Preliminary findings from a ground-truthed survey of land tenure security in NCR peri-urban informal settlements. Pending review by data administrator.',
    authors: ['Delhi-NCR Civil Society Land Watch (Illustrative)'],
    org: ORG_IDS.lw_ngo, year: 2024,
    keywords: ['informal settlements', 'land tenure', 'survey', 'NCR', 'pending review'],
    topics: ['land acquisition', 'governance', 'peri-urbanisation'],
    status: 'pending_review', visibility: 'internal', illustrative: true,
    provenance: 'Illustrative document in pending_review status. Demonstrates the document approval workflow.',
    regions: [REGION_IDS.india, REGION_IDS.gnb, REGION_IDS.ghaziabad],
    body: `This document is in pending_review status and is therefore not visible through the public document search. It is shown here to demonstrate the platform's document approval workflow. A data administrator must review and approve this document before it becomes visible to public users or is used in RAG responses.

The preliminary findings describe illustrative results from a hypothetical informal settlement survey conducted in peri-urban NCR. The survey covered approximately 3,200 households across 15 settlements in Gautam Buddha Nagar and Ghaziabad districts. Key findings include: 62% of surveyed households have no formal documentation of their land claim; 28% hold only historic sale agreements not backed by registered title; and 10% hold registered title. Dispute rates are highest among the first category.

This document awaits data quality validation by the data administrator, after which it will be assigned a status of either approved (with visibility set to public or internal) or rejected with reasons.`,
  },
];

export async function seed(client: PoolClient): Promise<void> {
  for (const d of docs) {
    await client.query(
      `INSERT INTO documents(id, type, title, abstract, authors, organization_id, year,
         source_url, keywords, topics, status, visibility, is_illustrative, provenance_note, approved_by, approved_at)
       VALUES($1,$2,$3,$4,$5::text[],$6,$7,$8,$9::text[],$10::text[],$11,$12,$13,$14,$15,$16)
       ON CONFLICT(id) DO UPDATE SET title=EXCLUDED.title, updated_at=NOW()`,
      [
        d.id, d.type, d.title, d.abstract,
        `{${d.authors.map(a => `"${a.replace(/"/g,'""')}"`).join(',')}}`,
        d.org, d.year, d.source_url ?? null,
        `{${d.keywords.map(k => `"${k.replace(/"/g,'""')}"`).join(',')}}`,
        `{${d.topics.map(t => `"${t.replace(/"/g,'""')}"`).join(',')}}`,
        d.status, d.visibility, d.illustrative, d.provenance ?? null,
        d.status === 'approved' ? USER_IDS.dataadmin : null,
        d.status === 'approved' ? new Date() : null,
      ]
    );

    // Link documents to regions
    for (const regionId of d.regions) {
      await client.query(
        `INSERT INTO document_regions(document_id, region_id) VALUES($1,$2) ON CONFLICT DO NOTHING`,
        [d.id, regionId]
      );
    }
  }
}
