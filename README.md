# OMNI-SWIM: Matrix Suite

Professional analytics for competitive swimming. Parse results, track team standings, and simulate recruit impacts.

## �️ Tech Stack

### Frontend
- **React 19** – UI framework
- **TypeScript** – Type-safe development
- **Vite 6** – Lightning-fast bundler and dev server
- **Tailwind CSS 4** – Utility-first styling
- **Recharts 3** – Data visualization and charting
- **Motion** – Smooth animations and transitions
- **Lucide React** – Icon library

### Backend
- **Express.js** – HTTP server and REST API
- **Node.js** – JavaScript runtime
- **TypeScript** – Type-safe backend code
- **Python 3** – PDF parsing logic
- **pdfplumber** – PDF text extraction and analysis

### Development & AI Assistance
- **GitHub Copilot** – Code generation and completion
- **Gemini Pro 1.5 Preview** (via Google AI Studio) – Research and architectural guidance
- **DeepSeek V4** – Problem-solving and debugging
- **VS Code** – IDE with TypeScript language support

### Utilities & Libraries
- **UUID** – Unique ID generation
- **Lodash** – Utility functions
- **Dotenv** – Environment variable management
- **JIMP** – Image processing
- **pdf-parse** – PDF parsing utilities
- **Autoprefixer** – CSS vendor prefixes

## �🚀 Easy Start
1. Install dependencies:
   - `npm install`
   - `pip install pdfplumber`
2. Start the app:
   - Windows: `start.bat`
   - macOS/Linux: `start.sh`
   - Or run `npm run dev` directly.
3. Open `http://localhost:3000` in your browser.

## 🛠️ Troubleshooting
1. **Node.js Missing**: Install Node.js from https://nodejs.org/
2. **Python Missing**: Install Python from https://www.python.org/downloads/ and ensure it is on your `PATH`.
3. **Python Dependency**: `start.bat` installs `pdfplumber` automatically if needed.

## 📁 Features
- **PDF Ingestion**: Upload Hy-Tek meet results to populate the matrix.
- **Recruit Simulation**: Inject new swimmers to see how they impact team scores.
- **Auto-Save**: All data is saved to `meets.json`. You can share this file with others to sync your data.
- **Safe Export**: Download your results as a CSV at any time from the sidebar.
