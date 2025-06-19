# anishshrestha.com

> Personal portfolio and interactive coding lab built with **SvelteKit 5** and **Tailwind CSS 4**

A modern, minimalist portfolio showcasing interactive algorithms, game AI implementations, and technical writing. Built with cutting-edge web technologies and deployed on Cloudflare Pages.

## 🎮 Interactive Labs

### [Bagchal Reforged](src/labs/bagchal)
Traditional Nepali board game with sophisticated AI opponent
- **Minimax algorithm** with alpha-beta pruning
- **Opening book** for strategic early game
- **Move ordering** and position evaluation
- **Drag & drop** + click interactions
- **Phase transition animations**

### [DSA Visualizer](src/labs/dsa-visualizer)
Real-time algorithm visualization engine
- **Pathfinding**: A*, Dijkstra, BFS, DFS
- **Sorting**: Bubble, Quick, Merge, Heap sort
- **Custom animation engine** with state management
- **Interactive grid** for algorithm exploration

### [Conway's Game of Life](src/labs/gameoflife)
Cellular automaton with pattern library
- **Optimized simulation** with configurable rules
- **Pattern presets**: Gliders, oscillators, spaceships
- **Real-time statistics** and generation tracking
- **Responsive grid** with zoom and pan

### [Tic-Tac-Toe](src/labs/tictactoe)
Classic game with unbeatable AI
- **Minimax implementation** using core engine
- **Multiple difficulty levels**
- **Clean game state management**

## 🏗️ Architecture

### Core Engine System
Abstracted game engine architecture enabling rapid game development:

```typescript
interface BaseEngine<Move, State> {
  initialState(): State;
  validMoves(state: State): Move[];
  applyMove(state: State, move: Move): State;
  evaluate(state: State): number;
}
```

### AI Framework
Reusable AI components across all games:
- **Minimax with alpha-beta pruning**
- **Position evaluation functions**
- **Move ordering and caching**
- **Difficulty scaling**

### Component Architecture
- **Modular design** - Each component under 200 lines
- **Svelte 5 runes** for reactive state management
- **TypeScript** for type safety
- **Tailwind 4** for consistent styling

## 📝 Technical Blog

Current articles covering deep technical concepts:

- **[Building Conway's Game of Life in Svelte](src/content/blog/building-conways-game-of-life-svelte.md)** - Animation engine and optimization
- **[DSA Visualizer Animation Engine](src/content/blog/building-dsa-visualizer-animation-engine.md)** - Algorithm visualization architecture  
- **[Bagchal Reforged: AI Chess for Tigers](src/content/blog/bagchal-reforged-ai-chess-tigers.md)** - Game AI and cultural gaming
- **[AoC 2024 Day 17: 3-Bit Computer](src/content/blog/aoc-2024-day-17-3bit-computer.md)** - Assembly simulation
- **[Cloudflare WARP on Arch Linux](src/content/blog/cloudflare-warp-arch-linux.md)** - Network configuration

## 🛠️ Tech Stack

### Frontend
- **SvelteKit 5** - Meta-framework with SSR
- **Svelte 5** - Component framework with runes
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS 4** - Utility-first styling
- **MDsveX** - Markdown with Svelte components

### Deployment
- **Cloudflare Workers** - Edge deployment with SvelteKit adapter
- **Wrangler** - Development and deployment tooling
- **Custom domain** - anishshrestha.com with production environment

### Development
- **Vite** - Build tool and dev server
- **ESLint** + **Prettier** - Code quality
- **PNPM** - Package management

## 🚀 Getting Started

```bash
# Clone and install
git clone https://github.com/anish-shrestha/anishshrestha.com
cd anishshrestha.com
pnpm install

# Development
pnpm dev

# Build and deploy
pnpm build
pnpm deploy
```

## 🎯 Design Philosophy

- **Minimalist aesthetics** - Dark theme with red accents
- **Performance first** - Optimized animations and interactions
- **Mobile responsive** - Touch-friendly game controls
- **Accessibility** - Keyboard navigation and screen reader support
- **Progressive enhancement** - Works without JavaScript

## 📊 Project Stats

- **4 Interactive Labs** - Each with unique algorithms
- **5 Technical Articles** - Deep-dive explanations
- **3 AI Implementations** - Minimax variants
- **15+ Algorithms** - Visualized and interactive
- **100% TypeScript** - Type-safe codebase

---

Built with ❤️ by [Anish Shrestha](https://anishshrestha.com) • [GitHub](https://github.com/anish-shrestha) • [LinkedIn](https://linkedin.com/in/anish-shrestha)
