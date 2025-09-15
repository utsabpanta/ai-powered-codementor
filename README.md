# 🤖 AI-Powered Code Mentor

A modern, intelligent code analysis platform that provides instant code reviews, security analysis, and improvement suggestions using **multiple AI providers** with automatic fallback for maximum reliability.

> **⭐ If you find this project helpful, please consider giving it a star on GitHub! It helps others discover this tool and motivates continued development.**

## ✨ What Makes This Special

- **🔄 Multi-Provider AI**: Seamlessly switches between **Gemini**, **Groq**, and **HuggingFace** if one fails
- **🎯 Customizable Models**: Easy to change AI models for each provider (see [Model Configuration](#-model-configuration))
- **⚡ Real-time Analysis**: Instant feedback on code quality, security, and performance
- **🎨 Modern UI**: Clean interface with syntax highlighting, drag-drop, and file upload
- **📊 Smart Reports**: Toggle between raw JSON and beautiful UI visualizations
- **🛡️ Production Ready**: Built with TypeScript, proper error handling, and validation

### 🔧 Current AI Models
- **Gemini**: `gemini-2.5-flash` (Google's latest fast model)
- **Groq**: `llama-3.3-70b-versatile` (Latest Llama model for versatile tasks)
- **HuggingFace**: `bigcode/starcoder2-15b` (Specialized for code analysis)

## 🚀 Quick Start

### 1️⃣ Prerequisites
- **Node.js** 18+
- **PNPM** If you don't have pnpm installed, install it using `npm i -g pnpm`
- **At least one AI API key** (get them [here](#-get-api-keys))

### 2️⃣ Setup (2 minutes)
```bash
# Clone and install
git clone <your-repo-url>
cd ai-powered-codementor
pnpm install

# Setup environment
cd backend && cp .env.example .env
# Add your API keys to .env file

# Start the app
cd .. && pnpm dev
```

**🎉 That's it!** Open http://localhost:5174 and start analyzing code!

## 🎯 How to Use

1. **📁 Upload Code**: Drag & drop files or paste code directly
2. **🎛️ Choose Analysis**: Pick from general, security, performance, or maintainability
3. **🤖 Select AI Provider**: Use auto-selection or pick your preferred AI
4. **📊 Get Results**: View detailed analysis with actionable recommendations

## 🔧 Model Configuration

Want to use different AI models? Easy! Just modify these files:

### 🔵 Gemini Models
**File**: `/backend/src/services/geminiService.ts` (line 35)
```typescript
this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
```

### 🟢 Groq Models
**File**: `/backend/src/services/groqService.ts` (line 15)
```typescript
model: 'llama-3.3-70b-versatile'
```

### 🟠 HuggingFace Models
**File**: `/backend/src/services/huggingFaceService.ts` (line 16)
```typescript
model: 'bigcode/starcoder2-15b'
```

## 🔑 Get API Keys (free usage)

### Google Gemini
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key" → Select project → Copy key

### Groq (Fast!)
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up (takes 30 seconds) → Go to API Keys → Create new key

### HuggingFace
1. Go to [HuggingFace Tokens](https://huggingface.co/settings/tokens)
2. Create new token → Copy and save

## ⚙️ Environment Setup

```bash
# In /backend/.env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Add at least one API key
GEMINI_API_KEY=your_gemini_key_here
GROQ_API_KEY=your_groq_key_here
HUGGINGFACE_API_KEY=your_hf_key_here
```

## 🏗️ Architecture & Tech Stack

| Layer | Technologies |
|-------|-------------|
| **🎨 Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Zustand |
| **⚡ Backend** | Node.js, Express, TypeScript, Fallback System |
| **🤖 AI Providers** | Google Gemini, Groq, HuggingFace |
| **📦 Package Manager** | PNPM Workspaces |
| **🛠️ DevTools** | ESLint, Prettier, Nodemon |

### Key Architecture Features
- **🔄 Automatic Fallback**: If Gemini fails → tries Groq → then HuggingFace
- **🛡️ Type Safety**: Full TypeScript coverage with proper interfaces
- **🎯 Modular Design**: Easy to add new AI providers
- **⚡ Fast Development**: Hot reload for both frontend and backend


## 🔧 Development Commands

```bash
# 🚀 Development
pnpm dev              # Start both frontend & backend
pnpm dev:frontend     # Frontend only (port 5174)
pnpm dev:backend      # Backend only (port 3001)

# 🏗️ Building
pnpm build            # Build everything for production
pnpm lint             # Check code quality
pnpm clean            # Remove build artifacts
```

## 🌐 API Reference

| Endpoint | Method | Purpose |
|----------|---------|---------|
| `/api/analyze` | POST | 🔍 Analyze code with AI |
| `/api/explain` | POST | 💡 Get code explanations |
| `/api/improve` | POST | ⚡ Get improvement suggestions |
| `/api/report` | POST | 📊 Generate comprehensive reports |
| `/api/providers` | GET | 🤖 Check AI provider status |

## 🚀 Production Deployment

```bash
# Build for production
pnpm build

# Set environment variables
export NODE_ENV=production
export CORS_ORIGIN=https://yourdomain.com

# Start production server
cd backend && pnpm start
```

## 🔒 Security & Best Practices

✅ **Input validation** on all endpoints
✅ **File size limits** for uploads
✅ **API key security** with environment variables
✅ **CORS protection** with configurable origins
✅ **Error handling** without sensitive data exposure
✅ **TypeScript** for compile-time safety

## 🤝 Contributing

Contributions are welcome!

## 💡 Troubleshooting

**🚨 Build Errors?**
- Run `pnpm install` to ensure dependencies are installed
- Check Node.js version (need 18+)

**🤖 AI Not Working?**
- Verify API keys in `/backend/.env`
- Check console for error messages
- Try a different AI provider

**🌐 Frontend Not Loading?**
- Make sure backend is running on port 3001
- Check CORS settings in backend config

## 📄 License

MIT License - feel free to use this in your own projects!