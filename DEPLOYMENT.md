# 🚀 Deployment Guide - Music Assistant

This guide walks you through deploying the Music Assistant app with AI functionality to Vercel.

## 🎯 Overview

The app is now configured with a **secure backend proxy** that keeps your Anthropic API key server-side. The architecture:

```
User Browser → Vercel Frontend (React/Vite)
                     ↓
             /api/chat endpoint (Serverless Function)
                     ↓
             Anthropic Claude API
```

## ✅ Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free tier works)
2. **Anthropic API Key** - Get from [console.anthropic.com](https://console.anthropic.com/)
3. **GitHub Account** - For connecting your repository

---

## 📦 Step 1: Push to GitHub

If you haven't already:

```bash
git add .
git commit -m "Add Vercel serverless proxy for AI"
git push origin main
```

---

## 🚀 Step 2: Deploy to Vercel

### Option A: Using Vercel Dashboard (Easiest)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your `music_assistant` repository
4. Vercel will auto-detect it's a Vite project ✅
5. **Don't deploy yet!** Click "Environment Variables" first

### Option B: Using Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

---

## 🔐 Step 3: Add Environment Variables

In the Vercel dashboard (or during `vercel` CLI setup):

1. **Go to:** Project Settings → Environment Variables
2. **Add variable:**
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-api03-...` (your actual API key)
   - **Environment:** Production, Preview, Development (select all)
3. Click **"Save"**

---

## ✨ Step 4: Deploy!

- **Dashboard:** Click "Deploy"
- **CLI:** Just run `vercel --prod`

Vercel will:
1. Build your Vite app (`npm run build`)
2. Deploy static files to CDN
3. Set up the `/api/chat` serverless function
4. Give you a live URL like `music-assistant-xyz.vercel.app`

---

## 🧪 Step 5: Test the AI

1. Open your deployed URL
2. Select a genre & chord progression
3. Click the AI assistant (sparkle icon)
4. Try: **"Generate Drums"** or **"Create a bass line"**

The AI should work! 🎉

---

## 🔧 Troubleshooting

### AI not responding?

**Check API key:**
```bash
vercel env ls
# Should show ANTHROPIC_API_KEY
```

**View logs:**
```bash
vercel logs
# Look for errors in /api/chat function
```

**Common issues:**
- API key not set → Add it in Vercel dashboard
- API key typo → Double-check in console.anthropic.com
- Rate limits → Check your Anthropic usage at console.anthropic.com

### Build failing?

**Clear build cache:**
```bash
vercel --prod --force
```

**Check build locally:**
```bash
npm run build
# Should succeed without errors
```

---

## 💰 Cost Estimates

**Vercel:**
- Free tier: 100GB bandwidth/month, unlimited serverless invocations
- More than enough for personal projects

**Anthropic API:**
- Claude Sonnet 4.6: ~$3 per million input tokens
- Typical music generation: ~500-1000 tokens per request
- **Rough estimate:** $0.001-0.003 per AI request
- 1000 AI generations ≈ $1-3

---

## 🎨 Custom Domain (Optional)

1. **Go to:** Project Settings → Domains
2. **Add domain:** `yourname.com`
3. **Update DNS:** Follow Vercel's instructions
4. **Done!** SSL certificate auto-configured

---

## 🔄 Updating Your Deployment

Every time you push to GitHub:

```bash
git add .
git commit -m "Update feature X"
git push
```

Vercel auto-deploys! 🚀

---

## 🛡️ Security Notes

✅ **What's secure:**
- API key never exposed to browser
- All AI requests proxied through your backend
- Vercel encrypts environment variables

⚠️ **Consider adding:**
- Rate limiting (prevent abuse)
- Authentication (if you want to restrict access)
- CORS headers (if embedding on other domains)

---

## 📊 Monitoring

**View analytics:**
- Vercel dashboard → Analytics tab
- See: requests, bandwidth, function invocations

**Claude API usage:**
- console.anthropic.com → Usage tab
- Monitor: tokens used, costs, rate limits

---

## 🆘 Need Help?

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Anthropic Docs:** [docs.anthropic.com](https://docs.anthropic.com)
- **Issues:** Check the repository issues or create a new one

---

Happy deploying! 🎵✨
