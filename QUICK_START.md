# Quick Start Guide

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will automatically open at `http://localhost:5173`

## First Steps

1. **Choose an LLM**: Click any LLM card (ChatGPT, Claude, Gemini, etc.)
2. **Upload Conversations**: 
   - Click "Upload HTML" button, or
   - Drag & drop HTML files onto the card
3. **View Your Conversations**: Click "View Conversations →" to see all conversations
4. **Open a Conversation**: Click any conversation to view it in fullscreen
5. **Manage**: Delete conversations you no longer need

## Project Overview

### What's Included

- **Complete React App**: Fully functional conversation management system
- **TypeScript**: Type-safe code throughout
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Local Storage**: All data persists in your browser
- **No Backend**: Everything runs locally
- **Drag & Drop**: Easy file uploads

### Main Components

1. **Dashboard** - Shows all LLM categories as cards
2. **Conversation List** - Lists all conversations for a specific LLM
3. **Conversation Viewer** - Displays the HTML conversation in an iframe

### Data Storage

Conversations are stored in browser localStorage as JSON. Each conversation includes:
- ID (timestamp-based)
- Title (filename)
- LLM provider
- Upload date
- Full HTML content

## Next Steps

1. Try uploading sample HTML files to test the app
2. Explore the fullscreen viewer mode
3. Customize the LLM list in `src/utils/useLLMData.ts` if needed
4. Build for production with `npm run build`

## Troubleshooting

**Port already in use?**
- Edit `vite.config.ts` and change the port number

**Data not persisting?**
- Check browser console for any errors (F12)
- Ensure localStorage is enabled in your browser

**Want to add more LLMs?**
- Edit the `LLMS` object in `src/utils/useLLMData.ts`
- Add a new entry with displayName, color, and icon
