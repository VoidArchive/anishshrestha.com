# Portfolio Website

Personal portfolio and blog built with SvelteKit.

## 🎯 ACTION PLAN - PRIORITIZED TODO

### 🚨 **HIGH PRIORITY** (Fix Immediately)

- [x] Simplified color scheme (removed duplicate `--color-text-primary/secondary`)
- [x] Pure Tailwind migration (removed all inline styles)
- [x] Updated all components to use `text-text`, `text-text-muted`, `text-primary`
- [x] **Break down massive Bagchal components**
  - [x] Split `BagchalBoard.svelte` (537 lines → <200 each)
    - [x] `BoardGrid.svelte` - SVG grid and lines
    - [x] `PieceRenderer.svelte` - Tigers and goats rendering
    - [x] `MoveHighlight.svelte` - Move indicators and highlights
    - [x] `BoardInteraction.svelte` - Click handling and validation
  - [x] Split `Shell.svelte` (422 lines → <200 each)
    - [x] `GameSidebar.svelte` - Controls and status
    - [x] `GameBoard.svelte` - Main board container
    - [x] `GameLogic.svelte` - State management
  - [x] Split `WinnerModal.svelte` (410 lines → <200)
    - [x] `ModalContent.svelte` - Winner display content
    - [x] `GameStats.svelte` - Statistics and replay options

#### **Bug Fixes**

- [x] **Fix TicTacToe bugs**
  - [x] Replace deprecated `on:click` with `onclick` (Shell.svelte:62)
  - [x] Fix direct state mutation in AI (creates immutable copies)
  - [x] Convert TicTacToe to use BaseEngine for consistency

#### **Game Engine Consistency**

- [x] **Standardize TicTacToe on BaseEngine**
  - [x] Create `TicTacToeEngine` implementing `BaseEngine<TicTacToeMove, TicTacToeState>`
  - [x] Update TicTacToe AI to use Minimax class from `$core`
  - [x] Ensure consistent patterns across all games

### ⚠️ **MEDIUM PRIORITY** (Next Sprint)

#### **Code Duplication & Reusability**

- [ ] **Create shared game UI patterns**

  - [ ] `GameModal.svelte` - Base modal for all games
  - [ ] `GameControls.svelte` - Common control patterns
  - [ ] `GameStatus.svelte` - Status display component
  - [ ] `PlayerVsAI.svelte` - Common AI vs human setup

- [ ] **Consolidate similar components**
  - [ ] Merge `ProjectCard.svelte` and `MiniProjectCard.svelte` with variants
  - [ ] Create shared button and form components
  - [ ] Standardize modal patterns

#### **Bagchal Multiplayer Foundation**

- [ ] **Prepare for Cloudflare D1 + Durable Objects**
  - [ ] Design multiplayer state schema
  - [ ] Create database migrations for D1
  - [ ] Plan Durable Object architecture for real-time games
  - [ ] Add WebSocket connection handling

### 🔧 **LOW PRIORITY** (Future Enhancements)

#### **Content & Features**

- [ ] Write project descriptions for Bagchal Reforged, Kathmandu Shame Map, Bhetum
- [x] Add blog posts (technical deep-dives, Nepal tech scene, minimalist dev practices)
- [ ] Create resume page with downloadable PDF
- [ ] Implement dark/light theme toggle
- [ ] Add search functionality for blog posts
- [ ] Build RSS feed for blog
- [ ] Add analytics (privacy-focused)

#### **Technical Improvements**

- [ ] Optimize images and add lazy loading
- [ ] Implement proper SEO meta tags
- [ ] Add sitemap generation
- [ ] Set up automated testing pipeline
- [ ] Add component testing for games
- [ ] Create performance monitoring

#### **Design & UX**

- [ ] Mobile responsiveness improvements
- [ ] Add subtle animations and hover effects
- [ ] Create custom 404 page
- [ ] Improve typography hierarchy
- [ ] Add loading states for AI thinking
- [ ] Improve accessibility (ARIA labels, keyboard navigation)

#### **Game Engine Expansion**

- [ ] **Add new games to validate engine abstraction**
  - [ ] Chess (complex piece movement)
  - [ ] Checkers (jump mechanics like Bagchal)
  - [ ] Connect Four (gravity-based)
- [ ] Add replay system for all games
- [ ] Implement game analysis features
- [ ] Add difficulty levels for AI

---

### 📊 **Metrics to Track**

- [ ] Component size (keep under 200 lines)
- [ ] Build bundle size
- [ ] Page load performance
- [ ] Game AI response time
- [ ] Code duplication percentage

### 🎯 **Success Criteria**

- [x] Modern SvelteKit 5 + Runes usage
- [x] Clean TypeScript implementation
- [ ] All components under 200 lines
- [ ] Consistent game engine patterns
- [ ] Zero code duplication in UI patterns
- [ ] Sub-200ms AI response times
- [ ] Ready for multiplayer architecture
