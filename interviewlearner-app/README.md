# Interview Learner

An educational overlay app that helps you learn to solve coding problems by providing hints and guidance instead of direct solutions.

## Features

- 📸 Screenshot capture of LeetCode problems
- 🤖 AI-powered hint generation using Google's Gemini 2.0 Flash
- 💡 Educational hints instead of direct solutions
- 🎯 Always-on-top overlay window
- ⌨️ Global hotkey support (see shortcuts below)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Configuration

This app uses the free tier of the Gemini API.

1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Either:
   - Click the settings button (⚙️) in the app and enter your API key
   - Or create a `.env` file in the `interviewlearner-app` directory with:
     ```
     VITE_GEMINI_API_KEY=your-api-key-here
     ```

## How to Use & Shortcuts

- **Toggle Window Visibility**: `Cmd/Ctrl + B`
- **Move Window**: `Cmd/Ctrl + Arrow keys`
- **Take Screenshot**: `Cmd/Ctrl + H`
- **Delete Last Screenshot**: `Cmd/Ctrl + L`
- **Process Screenshots**: `Cmd/Ctrl + Enter`
- **Start New Problem**: `Cmd/Ctrl + R`
- **Quit**: `Cmd/Ctrl + Q`

1. Launch the app. Use `Cmd/Ctrl+B` to show/hide it.
2. Navigate to a coding problem.
3. Use `Cmd/Ctrl+H` to take one or more screenshots of the problem.
4. Use `Cmd/Ctrl+Enter` to process the screenshots and get hints.

## Tech Stack

- Electron - Desktop app framework
- Vue 3 - UI framework
- TypeScript - Type safety
- Tesseract.js - OCR for text extraction
- Google Gemini API (1.5 Flash) - Hint generation
- Vite - Build tool

# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support For `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
   1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
   2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.
