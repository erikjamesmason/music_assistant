# 🎵 Music Assistant

An AI-powered music composition tool that helps you create music with chord progressions, layered patterns, and intelligent pattern generation using Claude AI.

## ✨ Features

- **Genre-Based Composition** - Start with Pop, Rock, Jazz, Electronic, or Hip Hop
- **Smart Chord Progressions** - Pre-built progressions with music theory explanations
- **Layer Editor** - Add drums, bass, and melody layers with Strudel-inspired syntax
- **AI Pattern Generation** - Claude-powered intelligent pattern creation
- **Real-time Playback** - Browser-based audio with Tone.js synthesis
- **MIDI Export** - Export your composition to standard MIDI files
- **Live Validation** - Real-time pattern validation with helpful error messages

---

## 🚀 Quick Start

### Local Development

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Set Up Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your Anthropic API key
# Get one from: https://console.anthropic.com/
```

Your `.env` should contain:
```env
ANTHROPIC_API_KEY=sk-ant-api03-your_actual_key_here
```

#### 3. Run Development Server with Vercel CLI

**Important:** To test the AI functionality locally, you need to use `vercel dev` (not `npm run dev`), which runs the serverless function locally.

```bash
# Install Vercel CLI globally (one-time setup)
npm install -g vercel

# Run local dev server with serverless functions
vercel dev
```

This will:
- Start the Vite dev server
- Run the `/api/chat` serverless function locally
- Load environment variables from `.env`
- Open at `http://localhost:3000`

#### Alternative: Test Without AI (Frontend Only)
If you just want to test the UI without AI features:
```bash
npm run dev
```
Note: The AI assistant won't work, but all other features will.

---

## 🎹 How to Use

### 1. Select Genre & Progression
- Choose a genre (Pop, Rock, Jazz, Electronic, Hip Hop)
- Pick a chord progression from the options

### 2. Build Your Composition

**Add Layers:**
- Click "+ Drums", "+ Bass", or "+ Melody"

**Pattern Syntax:**
- **Drums:** `k s k s | h h h h` (k=kick, s=snare, h=hihat, -=rest)
- **Bass/Melody:** `c4 e4 g4 | d4 f4 a4` (note names with octaves)
- **Bars:** Separate with `|` pipes

**Example Patterns:**
```
Drums:  k - s - | k - s - | k k s - | k - s -
Bass:   c2 c2 g2 g2 | a2 a2 g2 g2
Melody: c4 e4 g4 c5 | d4 f4 a4 d5
```

### 3. Use AI Assistant
Click the sparkle icon to open the AI assistant:
- **Quick Actions:** "Generate Drums", "Create Bass", "Add Melody", "Improve Track"
- **Custom Prompts:** "Make a funky bass line" or "Add a drum fill in bar 3"

### 4. Play & Export
- **Play Button:** Preview your composition
- **BPM Slider:** Adjust tempo (60-180 BPM)
- **Export MIDI:** Download separate MIDI files for each layer

---

## 🛠️ Tech Stack

- **React** - UI framework
- **Vite** - Build tool & dev server
- **Tone.js** - Audio synthesis & scheduling
- **Tailwind CSS** - Styling
- **Claude AI** - Pattern generation
- **Vercel** - Serverless functions & deployment

---

## 📦 Project Structure

```
music_assistant/
├── api/
│   └── chat.js              # Serverless function for AI proxy
├── src/
│   ├── App.jsx              # Main app orchestrator
│   ├── components/
│   │   ├── GenreSelection/
│   │   │   └── StartScreen.jsx
│   │   └── Composer/
│   │       ├── ComposerScreen.jsx
│   │       ├── LayerEditor.jsx
│   │       ├── LayerItem.jsx
│   │       └── AIAssistant.jsx
│   ├── hooks/
│   │   └── useSynths.js     # Tone.js synth management
│   ├── utils/
│   │   ├── midiGenerator.js # MIDI export logic
│   │   └── patternParser.js # Pattern syntax parser
│   └── data/
│       └── progressions.js  # Chord progressions by genre
├── vercel.json              # Vercel configuration
└── DEPLOYMENT.md            # Full deployment guide
```

---

## 🚀 Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for detailed deployment instructions to Vercel.

**Quick Deploy:**
1. Push to GitHub
2. Import to Vercel
3. Add `ANTHROPIC_API_KEY` environment variable
4. Deploy!

---

## 🔐 Security

✅ **API Key Protection:**
- API key stored server-side only
- Frontend calls `/api/chat` proxy
- Serverless function forwards to Anthropic API

⚠️ **Never commit your `.env` file!** (Already in `.gitignore`)

---

## 🧪 Development Commands

```bash
# Install dependencies
npm install

# Local dev with AI (recommended)
vercel dev

# Local dev without AI (frontend only)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 📝 Pattern Syntax Reference

### Drums
- `k` = Kick drum
- `s` = Snare
- `h` = Hi-hat
- `-` = Rest (silence)

### Bass & Melody
- Note format: `[note][octave]` (e.g., `c4`, `g#3`)
- Notes: `c`, `d`, `e`, `f`, `g`, `a`, `b`
- Sharps: Add `#` (e.g., `c#4`, `f#3`)
- Rest: `-` for silence

### Examples
```
Simple Drums:   k s k s
Four-on-floor:  k - k - | k - k -
Walking Bass:   c2 e2 g2 c3
Melody:         e4 g4 c5 g4 | d4 f4 a4 f4
```

---

## 🆘 Troubleshooting

### AI not working locally?
```bash
# Make sure you're using vercel dev, not npm run dev
vercel dev

# Check that .env has your API key
cat .env
```

### Build errors?
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Vercel CLI issues?
```bash
# Update to latest version
npm install -g vercel@latest

# Login again
vercel login
```

---

## 📄 License

MIT

---

## 🙏 Credits

Built with Claude AI assistance using:
- [Tone.js](https://tonejs.github.io/) for audio
- [Anthropic Claude API](https://www.anthropic.com/) for AI
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide Icons](https://lucide.dev/) for icons
