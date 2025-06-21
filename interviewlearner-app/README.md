# Interview Learner

An educational overlay app that helps you learn to solve coding problems by providing hints and guidance instead of direct solutions.

## Features

- 📸 Screenshot capture of LeetCode problems
- 🤖 AI-powered hint generation using ChatGPT
- 💡 Educational hints instead of direct solutions
- 🎯 Always-on-top overlay window
- ⌨️ Global hotkey support (Ctrl+Shift+S)

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

You'll need an OpenAI API key to use this app:

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Either:
   - Click the settings button (⚙️) in the app and enter your API key
   - Or create a `.env` file with:
     ```
     VITE_OPENAI_API_KEY=sk-your-api-key-here
     ```

## How to Use

1. Launch the app - it will appear as an overlay window
2. Navigate to a LeetCode problem in your browser
3. Press the screenshot button or use `Ctrl+Shift+S`
4. The app will capture the screen, extract the problem text, and provide helpful hints
5. Use the pin button (📌) to toggle always-on-top mode
6. Learn and solve the problem yourself with the guidance provided!

## Tech Stack

- Electron - Desktop app framework
- Vue 3 - UI framework
- TypeScript - Type safety
- Tesseract.js - OCR for text extraction
- OpenAI API - Hint generation
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
