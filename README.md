# 2D Parsons Puzzle Generator

A lightweight, browser-based tool to convert code snippets into interactive "Parsons Problems" (drag-and-drop code ordering exercises). 

## 🚀 Live Demo
[INSERT YOUR GITHUB PAGES URL HERE]

## ✨ Features
* **2D Indentation:** Support for horizontal indentation (essential for Python and logic nesting).
* **Smart Shuffle:** Automatically strips empty lines and randomizes code blocks.
* **Persistent State:** Uses `LocalStorage` to save your progress even if you refresh the page.
* **Tab Support:** The "Create" mode allows you to use the `Tab` key to indent your source code naturally.
* **Instant Validation:** Immediate visual feedback on code order and indentation logic.

## 🛠️ Tech Stack
* **HTML5/JavaScript** (Vanilla)
* **Tailwind CSS** (Styling)
* **SortableJS** (Drag-and-drop engine)

## 📖 How to Use
1. **Input:** Paste a working block of code into the generator. Use spaces or tabs for indentation.
2. **Generate:** Click "Generate Puzzle" to shuffle the lines.
3. **Solve:** Drag blocks from the left bank to the right solution area.
4. **Indent:** Use the arrow buttons on the solution blocks to adjust nesting levels.
5. **Verify:** Click "Check Answer" to see if your logic matches the original source.

## 📄 License
This project is open-source and available under the MIT License.