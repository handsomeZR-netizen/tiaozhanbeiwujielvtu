<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1E7l3ZU8Lv-JuyP6uIGJds3xf1eganmFy

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. (Optional) Enable Atlas map view by setting AMap keys in `.env.local`:
   - `VITE_AMAP_KEY=your_amap_key`
   - `VITE_AMAP_SECURITY_CODE=your_security_code`
3. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
4. Run the app:
   `npm run dev`
