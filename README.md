<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/e/e5/Gospers_glider_gun.gif" alt="Gosper Glider Gun" width="300" />
  
  # Conway's Playground
  
  *A beautiful, interactive web playground for exploring Conway's Game of Life.*
</div>

---

## The Backstory

This project originally started as a humble class project two years ago, back in the Fall of 2024. What began as a simple programming assignment sparked a deeper fascination with cellular automata. Now, years later, I felt inspired to revisit the concept—this time, with the goal of building a significantly better version through a modern, polished, and fully interactive web playground.

---

## Features

- **Interactive Canvas:** Click and drag to draw your own starting patterns directly onto the grid, with seamless support for both mouse and touch devices.
- **Fine-Grained Controls:** Play, pause, step forward generation-by-generation, randomize the board, or reset it completely.
- **Custom Rulesets:** Break the rules of standard Conway! Tweak the exact numbers of neighbors required for cells to *survive* or be *born*.
- **Dynamic Scaling:** Adjust the grid size effortlessly, and control the simulation speed in real-time.
- **Live Analytics:** Watch the simulation unfold with real-time statistics, including the current generation count, total live cells, and a beautiful population growth chart.
- **Responsive Design:** A carefully crafted layout that works flawlessly on desktop, tablet, and mobile devices.

---

## Architecture & Tech Stack

The application is built using modern front-end methods, prioritizing performance, maintainability, and a premium visual experience:

- **Core:** Built on [React 18](https://react.dev/) using [Vite](https://vitejs.dev/) for extremely fast development and highly optimized production builds.
- **Language:** Fully written in **TypeScript** to ensure type safety and code reliability.
- **Visuals & Styling:** 
  - Styled primarily with **Tailwind CSS** for rapid, responsive UI composition.
  - Animated using **Framer Motion** (`motion/react`) to provide smooth transitions and satisfying micro-interactions.
  - Iconography provided by **Lucide React**.
- **Data Visualization:** The population growth chart is powered by **Recharts**, seamlessly integrated into the application state.
- **Logic Separation:** The core cellular automata logic is decoupled from the UI (housed in `gameLogic.ts`), ensuring the heavy lifting doesn't clutter component rendering pipelines.

---

## Running Locally

If you'd like to run Conway's Playground on your own machine, follow these simple steps:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and `npm` installed on your computer.

### Installation

1. **Clone or Download the Repository:**
   Download the source code to your local machine and navigate into the project directory in your terminal.

   ```bash
   cd conways-playground
   ```

2. **Install Dependencies:**
   Run the following command to download and install all necessary packages:

   ```bash
   npm install
   ```

3. **Start the Development Server:**
   Launch the app locally by running:

   ```bash
   npm run dev
   ```

4. **Open in Browser:**
   Once the server starts, open your web browser and navigate to the local URL provided in your terminal (usually `http://localhost:5173` or `http://localhost:3000`).

Enjoy exploring the emergent beauty of cellular automata!
