# Creative Energy Flow – Detailed Project Blueprint

Welcome to the **Creative Energy Flow** project!  
This Progressive Web App (PWA) empowers users to track and visualize their creative energy and social battery throughout the day, using beautiful charts and a modern, installable offline-first experience.

---

## 1. **Project Purpose & Vision**

- **Self-awareness & Optimization:**  
  Help users gain insights into their creative rhythms and social energy, making it easier to plan productive, restorative, or social time.
- **Data-driven Decisions:**  
  Provide actionable analytics and trends based on personal input.
- **PWA for Accessibility:**  
  Ensure the tool works seamlessly on desktop and mobile, even offline.

---

## 2. **Tech Stack & Tools**

- **Frontend:**  
    - [x] React 19 (UI library)
    - [x] TypeScript (type safety)
    - [x] Chart.js + react-chartjs-2 (data visualization)
    - [x] date-fns (date/time utilities)
    - [x] PWA (offline support, installable)
    - [x] CSS Modules or Tailwind (styling)
- **Testing:**  
    - [x] Jest + React Testing Library
- **Design:**  
    - [x] Figma/Sketch for mockups
    - [x] PNG/JPG for hand-drawn wireframes, user flows
    - [x] SVG for icons
- **Data Storage:**  
    - [x] LocalStorage or IndexedDB for persistent user data

---

## 3. **Project Structure**

```
public/
  ├── index.html
  ├── manifest.json
  ├── icons/             # PWA icons
  └── ...

src/
  ├── App.tsx
  ├── components/
  │     ├── EnergyDashboard.tsx
  │     ├── EnergyInput.tsx
  │     ├── SocialBatteryInput.tsx
  │     ├── charts/
  │     │     ├── EnergyFlowChart.tsx
  │     │     └── SocialBatteryChart.tsx
  ├── data/
  │     ├── sampleData.ts
  ├── types/
  │     ├── energy.ts
  │     ├── socialBattery.ts
  ├── utils/
  ├── index.tsx
  └── ...

design/
  ├── sketches/
  │     ├── dashboard-sketch.jpg
  │     ├── input-form-sketch.jpg
  ├── mockups/
  │     ├── dashboard-mobile.png
  │     ├── dashboard-desktop.png
  │     ├── energy-input.png
  ├── flowcharts/
  │     ├── user-flow.svg
  │     ├── data-flow.svg
  └── README.md
```

---

## 4. **Detailed Features**

### 4.1. **Energy Dashboard**
- View current energy and social battery as large, clear numbers or gauges.
- Show trend graphs for the day/week/month.
- Display quick stats: average, highest, lowest, and last logged value.

### 4.2. **Energy Input**
- Interactive slider (1–10) to log current creative energy.
- Optional text field for notes (“What’s affecting your energy?”).
- Timestamp is automatically recorded.
- Quick action: “Log Now” button.

### 4.3. **Social Battery Input**
- Similar slider (1–10) for social energy.
- Dropdown or tags for recent activity (e.g., “Meeting”, “Alone Time”).
- Optional notes.
- “Update Social Battery” button.

### 4.4. **Charts & Visualization**
- **Line Chart:** Energy over time (day, week, month).
- **Bar Chart:** Social battery vs. energy correlations.
- **Pie/Donut:** Time spent in each energy zone (high/medium/low).
- Interactive tooltips and legends.
- Responsive for mobile and desktop.

### 4.5. **Offline & PWA Capabilities**
- Fully works offline (cache assets and data).
- Installable on mobile/desktop (manifest, icon, splash).
- Prompt user to “Add to Home Screen”.

### 4.6. **Data Storage**
- All logs stored locally (localStorage or IndexedDB).
- Privacy-first: No cloud sync by default.

### 4.7. **Export/Import**
- Export logs as CSV or JSON.
- Import for backup or transfer.

---

## 5. **Design System & Files**

**Folder: `design/`**

- **`sketches/`**  
  Hand-drawn or low-fidelity wireframes for main screens:
  - Dashboard layout
  - Energy & social battery input
  - Chart visualizations

- **`mockups/`**  
  High-fidelity Figma/Sketch mockups for:
  - Mobile and desktop dashboards
  - Input forms
  - Charts and stats cards

- **`flowcharts/`**  
  SVG/PNG diagrams for:
  - User journey: log in → dashboard → log energy → view trends
  - Data flow: input → local storage → visualization

- **`README.md`** (in design/)
  - Color palette, typography, UI principles, spacing & grid, iconography
  - Rationale for UX decisions

**Sample contents for `design/README.md`:**
```markdown
# Design & UX Guidelines

## Color Palette
- Primary: #51C4D3
- Accent: #FFD166
- Background: #F7F7F7
- Text: #333333

## Typography
- Headlines: Inter, Bold, 1.4em+
- Body: Inter, Regular, 1em

## Components
- Card: Rounded, shadow, high contrast data
- Sliders: Large thumb, color feedback
- Charts: Minimalist, color-coded by type

## Spacing & Layout
- 8px base grid
- Responsive paddings for mobile/desktop

## User Flow
1. Open app (dashboard)
2. Log energy/social battery
3. See instant feedback on charts
4. Optionally export data
```

---

## 6. **User Flow Example**

1. **User opens app →**  
   Dashboard shows today’s energy and social battery.
2. **User logs energy →**  
   Uses slider, adds optional note, hits “Log Now”.
3. **User logs social battery →**  
   Updates after an interaction.
4. **Dashboard & charts update instantly.**
5. **User reviews trends, exports data, or installs app.**

---

## 7. **Development & Usage Instructions**

1. **Install dependencies:**  
   ```sh
   npm install
   ```
2. **Start the dev server:**  
   ```sh
   npm start
   ```
3. **Open in browser:**  
   Visit `http://localhost:3000`
4. **(When available) Log your energy and social battery.**
5. **Visualize your energy flow and optimize your routine!**

---

## 8. **Roadmap**

- [ ] Add interactive energy and social battery input forms
- [ ] Connect inputs to persistent local storage
- [ ] Build and refine all chart components
- [ ] Polish PWA install/offline experience
- [ ] Add export/import & privacy settings
- [ ] Integrate basic AI for pattern suggestions

---

## 9. **Contributing**

Contributions, issues, and ideas are welcome!  
Fork, submit PRs, or open issues for feedback and improvements.

---

## 10. **License**

MIT License  
Created by M-LN
