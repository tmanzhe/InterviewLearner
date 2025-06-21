<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Tesseract from 'tesseract.js'
import { GoogleGenerativeAI, GenerationConfig, Content } from '@google/generative-ai'
import { GEMINI_API_KEY, SYSTEM_PROMPT } from './config/gemini'

// State
const screenshots = ref<string[]>([])
const isProcessing = ref(false)
const hints = ref('')
const error = ref('')
const isAlwaysOnTop = ref(true)
const apiKey = ref(GEMINI_API_KEY)
const showSettings = ref(false)

// Initialize Gemini
let genAI: GoogleGenerativeAI | null = null
const generationConfig: GenerationConfig = {
  temperature: 0.7,
  maxOutputTokens: 1000,
};

const initGemini = () => {
  if (apiKey.value) {
    genAI = new GoogleGenerativeAI(apiKey.value)
  }
}

// Screenshot and process
const takeScreenshot = async () => {
  if (!apiKey.value) {
    error.value = 'Please set your Gemini API key in settings'
    showSettings.value = true
    return
  }

  try {
    const screenshot = await window.electronAPI.takeScreenshot()
    if (screenshot) {
      screenshots.value.push(screenshot.dataURL)
      error.value = ''
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred'
    console.error(err)
  }
}

const deleteLastScreenshot = () => {
  screenshots.value.pop()
}

const startNewProblem = () => {
  screenshots.value = []
  hints.value = ''
  error.value = ''
  isProcessing.value = false
}

const processScreenshots = async () => {
  if (screenshots.value.length === 0) {
    error.value = 'No screenshots to process.'
    return
  }
  if (!apiKey.value) {
    error.value = 'Please set your Gemini API key in settings'
    showSettings.value = true
    return
  }

  isProcessing.value = true
  error.value = ''
  hints.value = ''

  try {
    if (!genAI) initGemini()
    
    let combinedText = ''
    for (const dataURL of screenshots.value) {
      const result = await Tesseract.recognize(
        dataURL,
        'eng',
        {
          logger: m => console.log(m)
        }
      )
      combinedText += result.data.text + '\n\n'
    }

    if (!combinedText.trim()) {
      throw new Error('No text found in screenshots')
    }
    
    const model = genAI!.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const userMessage = `Here's a coding problem I'm working on (it might be in multiple parts from several screenshots):\n\n${combinedText}\n\nPlease provide helpful hints and guidance without giving the complete solution.`
    const contents: Content[] = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: "Okay, I understand. I'm ready to help. Please provide the coding problem." }] },
      { role: 'user', parts: [{ text: userMessage }] }
    ]

    const result = await model.generateContent({ contents, generationConfig })
    const response = result.response
    hints.value = response.text()

  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred'
    console.error(err)
  } finally {
    isProcessing.value = false
  }
}

// Window controls
const minimize = () => window.electronAPI.minimizeWindow()
const close = () => window.electronAPI.closeWindow()
const togglePin = async () => {
  isAlwaysOnTop.value = await window.electronAPI.toggleAlwaysOnTop()
}

// Save API key
const saveApiKey = () => {
  localStorage.setItem('gemini_api_key', apiKey.value)
  initGemini()
  showSettings.value = false
  error.value = ''
}

// Lifecycle
onMounted(() => {
  // Load saved API key
  const savedKey = localStorage.getItem('gemini_api_key')
  if (savedKey) {
    apiKey.value = savedKey
    initGemini()
  }

  // Listen for screenshot triggers from main process
  window.electronAPI.onScreenshotTrigger(takeScreenshot)
  window.electronAPI.onDeleteLastScreenshotTrigger(deleteLastScreenshot)
  window.electronAPI.onProcessScreenshotsTrigger(processScreenshots)
  window.electronAPI.onStartNewProblemTrigger(startNewProblem)
})

onUnmounted(() => {
  window.electronAPI.removeScreenshotTrigger()
  window.electronAPI.removeDeleteLastScreenshotTrigger()
  window.electronAPI.removeProcessScreenshotsTrigger()
  window.electronAPI.removeStartNewProblemTrigger()
})
</script>

<template>
  <div class="app">
    <!-- Title Bar -->
    <div class="title-bar">
      <span class="title">Interview Learner</span>
      <div class="controls">
        <button @click="showSettings = !showSettings" class="control-btn" title="Settings (Cmd+,)">
          ⚙️
        </button>
        <button @click="togglePin" class="control-btn" :class="{ active: isAlwaysOnTop }" title="Toggle Always on Top">
          📌
        </button>
        <button @click="minimize" class="control-btn" title="Minimize">
          －
        </button>
        <button @click="close" class="control-btn close" title="Hide Window (Cmd+B to show)">
          ✕
        </button>
      </div>
    </div>

    <!-- Settings -->
    <div v-if="showSettings" class="settings">
      <h3>Settings</h3>
      <label>
        Gemini API Key:
        <input 
          v-model="apiKey" 
          type="password" 
          placeholder="Enter your key..."
          @keyup.enter="saveApiKey"
        />
      </label>
      <button @click="saveApiKey" class="btn primary">Save</button>
      <p class="hint">Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank">Google AI Studio</a></p>
    </div>

    <!-- Main Content -->
    <div v-else class="content">
      <!-- Action Buttons -->
      <div class="actions">
        <button @click="takeScreenshot" :disabled="isProcessing" class="btn">
          📸 Take SS (Cmd+H)
        </button>
        <button @click="processScreenshots" :disabled="isProcessing || screenshots.length === 0" class="btn primary">
          <span v-if="!isProcessing">🚀 Process (Cmd+Enter)</span>
          <span v-else>🔄 Processing...</span>
        </button>
      </div>

      <!-- Screenshot Info -->
      <div class="screenshot-info">
        <span class="count">Screenshots: {{ screenshots.length }}</span>
        <div class="screenshot-controls">
          <button @click="deleteLastScreenshot" :disabled="isProcessing || screenshots.length === 0" title="Delete Last (Cmd+L)">
            🗑️
          </button>
          <button @click="startNewProblem" :disabled="isProcessing || screenshots.length === 0" title="Start New (Cmd+R)">
            🔄
          </button>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="error">
        {{ error }}
      </div>

      <!-- Hints Display -->
      <div v-if="hints" class="hints">
        <h3>💡 Learning Hints</h3>
        <div class="hint-content" v-html="formatHints(hints)"></div>
      </div>

      <!-- Instructions -->
      <div v-if="!hints && !error && !isProcessing" class="instructions">
        <p>📚 How to use:</p>
        <ol>
          <li>Show window with `Cmd+B`</li>
          <li>Move window with `Cmd+Arrows`</li>
          <li>Take one or more screenshots with `Cmd+H`</li>
          <li>Process them with `Cmd+Enter`</li>
          <li>Start over with `Cmd+R`</li>
          <li>Quit with `Cmd+Q`</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  methods: {
    formatHints(text: string): string {
      // Convert markdown-style formatting to HTML
      if (!text) return ''
      return text
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>')
    }
  }
}
</script>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: rgba(24, 24, 27, 0.95);
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  -webkit-app-region: drag;
  user-select: none;
}

.title {
  font-weight: 600;
  font-size: 14px;
}

.controls {
  display: flex;
  gap: 8px;
  -webkit-app-region: no-drag;
}

.control-btn {
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;
  font-size: 16px;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.control-btn.active {
  background: rgba(59, 130, 246, 0.5);
}

.control-btn.close:hover {
  background: rgba(239, 68, 68, 0.5);
}

.settings {
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  margin: 16px;
  border-radius: 8px;
}

.settings h3 {
  margin-top: 0;
  margin-bottom: 16px;
}

.settings label {
  display: block;
  margin-bottom: 16px;
}

.settings input {
  display: block;
  width: 100%;
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #fff;
  font-family: monospace;
}

.settings .hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 8px;
}

.settings .hint a {
  color: #3b82f6;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  color: #fca5a5;
}

.hints {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
  margin-top: 16px;
  flex: 1;
  overflow-y: auto;
}

.hints h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #fbbf24;
}

.hint-content {
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
}

.hint-content :deep(code) {
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.hint-content :deep(pre) {
  background: rgba(0, 0, 0, 0.3);
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 12px 0;
}

.instructions {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 16px;
}

.instructions p {
  margin-top: 0;
  font-weight: 600;
}

.instructions ol {
  margin: 12px 0 0;
  padding-left: 20px;
  line-height: 1.8;
}

.btn {
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 14px;
}

.btn.primary {
  background: #3b82f6;
  color: #fff;
}

.btn.primary:hover {
  background: #2563eb;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* New styles */
.actions {
  display: flex;
  gap: 12px;
}

.actions .btn {
  flex-grow: 1;
}

.screenshot-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  background: rgba(255, 255, 255, 0.05);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
}

.screenshot-controls {
  display: flex;
  gap: 8px;
}

.screenshot-info button {
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
  font-size: 16px;
  padding: 4px;
}

.screenshot-info button:hover:not(:disabled) {
  opacity: 1;
}

.screenshot-info button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
