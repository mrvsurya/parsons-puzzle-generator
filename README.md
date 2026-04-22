# Parsons Puzzle Generator

A lightweight, browser-based tool to convert code snippets into interactive Parsons Problems (drag-and-drop code ordering exercises).

## Live Demo
[View Live Demo](https://mrvsurya.github.io/parsons-puzzle-generator/)

## Features

### Editor
- **Code Input** — Paste or type code snippets into the editor textarea.
- **Tab Support** — Use the `Tab` key to indent source code naturally (inserts 4 spaces).
- **Strict Indentation Toggle** — Optionally require PEP 8-compliant indentation when validating answers.

### Puzzle Generation & Preview
- **Smart Shuffle** — Strips empty lines and randomizes code blocks using Fisher-Yates shuffle.
- **Preview Mode** — Click "Preview Puzzle" to test the puzzle as a student would see it, with a "Back to Editor" button to return and make changes.
- **Re-shuffle** — Blocks are re-shuffled each time the preview button is pressed.

### Solving
- **Drag and Drop** — Move blocks between the Source Bank and Solution Area using SortableJS-powered drag and drop.
- **2D Indentation** — Adjust indentation levels on solution blocks using left/right arrow buttons (essential for Python and nested logic).
- **Visual Indentation** — Indented blocks display a blue left-border accent for clarity.

### Validation & Feedback
- **Instant Validation** — Click "Check Answer" for immediate visual feedback on both block order and indentation.
- **Color-Coded Results** — Green for correct, red for incorrect, orange for incomplete.
- **Strict Mode** — When enabled, both order and indentation must match exactly.

### Solution Reveal (Teacher View)
- **Show/Hide Solution** — Teacher links include a toggle to reveal the correct order and indentation.

### Sharing
- **URL-Based Sharing** — No database required. All puzzle data is Base64-encoded directly into the shareable URL.
- **Student Link** — Opens the puzzle with shuffled blocks for solving.
- **Teacher Link** — Opens the puzzle pre-solved with the solution reveal button.

### Persistence
- **State Persistence** — Progress is saved to `LocalStorage` and survives page refreshes.
- **Auto-Restore** — Returning to the page automatically reloads your last session.

### Reset
- **Reset / New** — Clear saved state and start over (with confirmation dialog).

## Tech Stack
- **HTML5 / JavaScript** (Vanilla)
- **Tailwind CSS** (Styling)
- **SortableJS** (Drag-and-drop engine)
- **Font Awesome** (Icons)

## How to Use
1. **Input** — Paste a working block of code into the editor. Use spaces or `Tab` for indentation.
2. **Preview** — Click "Preview Puzzle" to see the shuffled blocks and test the puzzle.
3. **Share** — Use "Copy Student Link" or "Copy Teacher Link" to share the puzzle via URL.
4. **Solve** — Drag blocks from the Source Bank (left) to the Solution Area (right).
5. **Indent** — Use the arrow buttons on solution blocks to adjust nesting levels.
6. **Verify** — Click "Check Answer" to see if your arrangement matches the original code.