VT Rhythm Game Prototype

This folder contains a deployable React app using Vite.

What to do locally:
1. Open a terminal in this folder.
2. Run: npm install
3. Run: npm run build
4. Upload the CONTENTS of the generated dist folder into its own folder on your server.

For IONOS or any static host:
- Create or use a folder such as /vt-rhythm-game/
- Upload everything inside dist into that folder
- Open the app using the URL for that folder

Important:
- Do not upload the raw src folder by itself if you want the site to run in the browser.
- Upload the built dist files for production hosting.
- The Vite config uses base './' so the app can work from its own subfolder.
