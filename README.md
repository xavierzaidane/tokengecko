# **TokenGecko** 🦎

> **The High-Performance Prompt Inspection, Cost Optimization, and Token Analytics Workbench.**

TokenGecko is a modern, developer-first IDE workbench designed for prompt engineers, AI developers, and technical teams to inspect, tokenize, benchmark, and optimize LLM prompt payloads across multiple model providers in real time.

---

## 🚀 Key Features

### 💻 1. Monaco-Powered Prompt Editor
- **Full IDE Experience**: Integrated `@monaco-editor/react` with custom `storeframe-dark` syntax highlighting.
- **Language Auto-Detection**: Supports JSON, Markdown, TypeScript/JavaScript, and Plain Text prompt payloads.
- **Real-Time Token Counting**: Exact token calculation using `js-tiktoken` with instant character, word, and token telemetry.

### 🎯 2. Target Model Catalog & Cost Benchmarking
- **Multi-Provider Support**: Benchmark prompts against **OpenAI**, **Anthropic**, **Google Gemini**, **DeepSeek**, **Meta Llama**, **Mistral**, and **Qwen**.
- **Real-Time Cost Calculations**: Automatic input/output token cost estimation based on live context windows and pricing tiers.
- **High-Density Catalog Grid**: Filter by model provider, search models, or apply quick multi-model presets (e.g. *Flagship LLMs*, *Budget-Friendly*, *Huge Context*).

### ⚡ 3. Prompt Health & Optimization Engine
- **Automated Linting**: Detects bloated system instructions, duplicate context, repetitive formatting, and unnecessary preamble.
- **Actionable Advice**: Gives a prompt health score (*Good*, *Warning*, *Needs Optimization*) with direct cost-reduction recommendations.
- **1-Click Recommendations**: Apply model switching advice or prompt trimming recommendations instantly.

### 📊 4. Multi-Model Comparison Matrix & Visualizations
- **TanStack Table Matrix**: Interactive, sortable comparison table for input tokens, estimated output, context window utilization %, and total cost.
- **Visual Analytics**: Interactive Recharts breakdown of token distribution by prompt section (System Rules, Context Data, User Instructions).

### 🔒 5. Inspection Vault & Public Sharing
- **History Log Vault**: Persistent saving of prompt inspections to InsForge BaaS database.
- **Public Share Links**: Generate shareable, read-only inspection reports for client presentations or team code reviews.
- **BYOK Key Management**: Local client-side key storage for customized model access.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React 19)
- **Styling**: Vanilla CSS & [Tailwind CSS 3.4](https://tailwindcss.com/) with Storeframe dark theme tokens
- **IDE Editor**: `@monaco-editor/react`
- **Backend & Auth**: [InsForge SDK](https://insforge.dev/) (`@insforge/sdk`)
- **Data Table**: `@tanstack/react-table`
- **Charts & Visuals**: `recharts`
- **Tokenizer**: `js-tiktoken`
- **Icons**: `lucide-react` & Official Provider Icon Assets (`/public/`)

---

## 📁 Project Structure

```text
tokengecko/
├── public/                     # Provider logos (OpenAI, Anthropic, Gemini, DeepSeek, Meta, Mistral, Qwen, gecko)
├── src/
│   ├── app/
│   │   ├── inspector/          # Main Prompt Inspector IDE page
│   │   ├── history/            # Saved Inspection Vault page
│   │   ├── keys/               # BYOK API Key Vault page
│   │   ├── share/[shareToken]/ # Public Inspection Share view
│   │   └── globals.css         # Storeframe CSS variables & custom scrollbars
│   ├── components/
│   │   ├── icons/              # ProviderIcon SVG/Image resolver component
│   │   ├── inspector/          # Monaco prompt editor, Model selector, Summary panel, Comparison matrix, Visualizations
│   │   ├── layout/             # Collapsible Sidebar layout & navigation header
│   │   └── ui/                 # Custom shadcn UI components (Tabs, Cards, Badges, Buttons, Inputs)
│   └── lib/
│       ├── analysis/           # Schema definitions and tiktoken tokenizer utility
│       ├── models/             # Model catalog registry, pricing data, and presets
│       └── optimization/       # Rule-based prompt health & cost optimization engine
```

---

## 🏁 Getting Started

### Prerequisites

- Node.js 18+ and `npm` installed.

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/xavierzaidane/tokengecko.git
cd tokengecko
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root folder:

```env
NEXT_PUBLIC_INSFORGE_BASE_URL="https://your-insforge-app.region.insforge.app"
NEXT_PUBLIC_INSFORGE_ANON_KEY="your-anon-key-here"
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start using the TokenGecko Inspector Workspace.

---

## 📜 Available Scripts

- `npm run dev` - Starts local dev server with Hot Module Replacement
- `npm run build` - Builds production bundle
- `npm run start` - Starts production server
- `npm run lint` - Runs Next.js ESLint check

---

## 📄 License

MIT License. Designed with ❤️ for the AI developer community.
