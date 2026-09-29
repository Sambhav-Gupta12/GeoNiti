# GeoNiti Demo Script

This script outlines the end-to-end narrative for presenting the GeoNiti platform to judges or stakeholders.

## Pre-requisites
- Ensure the database is freshly seeded (`npm run db:seed`).
- Log in as the demo official user (`official@gov.in` / `password`).
- Ensure offline embeddings or OpenAI keys are configured and working.

## Step 1: The AI Assistant and Semantic Search
1. **Navigate to**: Assistant (`/assistant`)
2. **Action**: Type exactly: "Impact of urban expansion on agricultural land in NCR".
3. **Talking Points**: 
   - "GeoNiti isn't just keyword search. Using semantic embeddings, the AI understands the concepts of 'urban expansion' and 'agricultural land'."
   - "Notice the 'Grounded' badge. The answer cites specific, verified research papers from the platform's repository."
   - Click on the cited document "Peri-urbanisation and Farmland Conversion in Delhi-NCR" to show the source material.

## Step 2: Spatial Intelligence (GIS Explorer)
1. **Navigate to**: Map Explorer (`/map`)
2. **Action**: 
   - Toggle the "Land use / Built-up" layer from the left panel.
   - Click on the district of **Gurugram** or **Gautam Buddha Nagar**.
3. **Talking Points**:
   - "Here we visualize the abstract data spatially. The map clearly shows the intensity of built-up area in the fringe districts."
   - "By clicking on a district, we pull up an instant, contextual profile. The drawer on the right integrates the KPIs, evidence, and datasets specific to this geographical boundary."

## Step 3: Trends and Anomalies
1. **Navigate to**: District Profile (Click "Open district profile" from the map drawer).
2. **Action**: Scroll to the Trends section. Highlight the built-up vs. cropland trend line.
3. **Talking Points**:
   - "The district profile gives officials a unified dashboard of historical performance."
   - Point to the Anomaly Marker on the chart.
   - "Our AI automatically flags statistical anomalies — for instance, a sudden spike in land disputes correlating with a major land acquisition drive, providing an instant tooltip explanation."

## Step 4: Policy Scenario Sandbox
1. **Navigate to**: Scenarios (`/scenarios`) from the district profile header action "Run Scenario".
2. **Action**: 
   - Select the target indicator (e.g., Cropland % or Built-up %).
   - Adjust the policy sliders (e.g., Increase Industrial Zone restriction, increase dispute resolution speed).
   - Click "Run Scenario".
3. **Talking Points**:
   - "This is where GeoNiti moves from reactive to proactive. Officials can model the impact of policy changes."
   - "The results show a projection band, clearly communicating uncertainty. This isn't a crystal ball, but a statistically grounded simulation based on historical trends."
   - "Note the 'Modelled' badge. We strictly differentiate between historical facts and AI-generated projections."

## Step 5: Collaboration and Workspaces
1. **Navigate to**: Workspace (`/workspace`).
2. **Action**: 
   - Show how the scenario run or map view can be saved to a project.
   - Click "Export Summary".
3. **Talking Points**:
   - "Insights are only useful if they can be shared. Projects allow cross-department teams to curate datasets, evidence, and spatial views into a single, exportable docket."

## Bonus: Data Administration
1. **Navigate to**: Admin (`/admin`)
2. **Action**: Go to the Upload & Review tab. Show the AI Extraction Review interface.
3. **Talking Points**:
   - "Data ingestion is a massive bottleneck in government. GeoNiti uses AI to automatically extract metadata and classify documents, assigning confidence scores so humans only review what's necessary."
