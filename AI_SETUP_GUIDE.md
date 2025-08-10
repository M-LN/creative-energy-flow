# 🤖 AI Integration Setup Guide

## Quick Start (5 minutes)

### 1. Get OpenAI API Key
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to **API Keys** section
4. Click **"Create new secret key"**
5. Copy the key (starts with `sk-...`)

### 2. Configure Environment
1. Open `.env.local` file in your project root
2. Replace `your_openai_api_key_here` with your actual API key:
   ```
   REACT_APP_OPENAI_API_KEY=sk-your-actual-key-here
   ```
3. Save the file

### 3. Add Payment Method (Required)
- OpenAI requires a payment method even for small usage
- Go to **Billing** in your OpenAI account
- Add a credit card
- **Set usage limits** (recommended: $5-10/month for testing)

### 4. Test It Out!
1. Run `npm start`
2. Open the AI assistant (Need Help? button)
3. Ask any question - you'll get real AI responses!

## 💰 Cost Control

### Typical Usage Costs:
- **Testing/Development**: $1-3/month
- **Light Production**: $5-15/month
- **Heavy Usage**: $20+/month

### Built-in Safety Features:
- ✅ **Rate limiting** (1 second between requests)
- ✅ **Token limits** (500 tokens max per response)
- ✅ **Graceful fallbacks** (works without API key)
- ✅ **Error handling** (shows helpful messages)

### Set Usage Limits:
1. In OpenAI dashboard → **Billing** → **Usage limits**
2. Set **Monthly budget** (e.g., $10)
3. Enable **Email alerts** at 80% usage

## 🔧 Configuration Options

Edit these in `.env.local`:

```env
# Required
REACT_APP_OPENAI_API_KEY=sk-your-key-here

# Optional customization
REACT_APP_AI_MODEL=gpt-3.5-turbo          # Model to use
REACT_APP_AI_MAX_TOKENS=500               # Response length limit  
REACT_APP_AI_TEMPERATURE=0.7              # Creativity level (0-1)
```

## 🎯 What You Get

With real AI integration, your assistant can:
- ✅ **Answer any question** about energy tracking
- ✅ **Provide personalized insights** based on your data
- ✅ **Remember conversation context**
- ✅ **Offer actionable suggestions**
- ✅ **Adapt to your communication style**

## 🚨 Troubleshooting

### "API key not configured" message?
- Check your `.env.local` file exists and has the correct key
- Restart the development server (`npm start`)

### "Insufficient quota" error?
- Add payment method to your OpenAI account
- Check your usage limits aren't exceeded

### AI responses seem generic?
- The AI gets better with more conversation context
- Try asking specific questions about your energy data

## 🔒 Security Notes

- ✅ `.env.local` is in `.gitignore` (your key won't be committed)
- ⚠️ **Never share your API key publicly**
- 🔄 **Regenerate key** if accidentally exposed
- 🛡️ **For production**: Use a backend proxy (not browser-direct API calls)

---

## 🎉 You're All Set!

Your AI assistant is now powered by real intelligence! Start chatting and see how it understands your energy patterns and provides personalized insights.

**Questions? The AI assistant can now actually help answer them! 😄**
