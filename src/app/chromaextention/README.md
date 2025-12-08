Niyambadha – Stay Focused, Smarter

Niyambadha is a smart productivity Chrome extension that blocks distracting websites, redirects users to puzzles, and helps build long-term digital discipline.
Instead of mindless scrolling, users solve short puzzles to earn focused screen time.

🚀 Features
🔒 Smart Website Blocking

Block entire domains or specific sites.

Auto-redirect users to an interactive puzzle instead of allowing access.

🧩 Puzzle-Based Unlock System

Solve Paheli puzzles, Pattern Lock puzzles, or Math challenges.

Earn your screen-time back by solving puzzles.

Better focus. Less distraction.

⏱️ Controlled Screen Time

Each solved puzzle restores originalTimeMinutes of focus time.

Unsolved puzzles reduce time to 0.1 minutes, preventing bypass through new tabs.

🔄 Auto Sync with Cloud

User settings stored in Firebase Firestore.

Automatically syncs blocked sites, timers, and preferences.

🧠 Adaptive Flow

If the user is not logged in, they’re automatically redirected to create an account.

Extension dynamically refreshes settings every 30 seconds to ensure updates apply instantly.

🛠️ Tech Stack

Chrome Extension (Manifest V3)

Next.js (Frontend + API Routes)

Firebase Authentication

Firestore Database

Tailwind CSS

Vercel for hosting

📦 Installation (Developer Mode)

Download or clone the project:

git clone https://github.com/YOUR_USERNAME/Niyambadha.git

Go to chrome://extensions/ in Chrome.

Enable Developer Mode.

Click Load Unpacked.

Select the extension directory containing:

manifest.json
background.js
icons/

📁 Project Structure
extension/
│── background.js
│── manifest.json
│── icons/
│ ├── icon16.png
│ ├── icon48.png
│ └── icon128.png
portal-app/
│── app/
│── components/
│── api/ (Next.js API routes)
│── lib/firebase.js

⚙️ How Niyambadha Works
1️⃣ User opens a blocked website

→ Timer starts based on watchTimeMinutes.

2️⃣ Timer finishes

→ User is redirected to Niyambadha portal puzzle page.

3️⃣ User solves the puzzle

→ Firebase updates watchTimeMinutes = originalTimeMinutes.

4️⃣ User fails or closes

→ watchTimeMinutes = 0.1 so they can’t open a new tab and bypass it.

5️⃣ Extension reloads fresh settings every 30 seconds

→ Ensures real-time sync.

🧩 Puzzle Types

Hindi Paheli (riddle puzzles)

Pattern lock puzzles

Math challenges

All puzzles use a consistent success flow and scoreboard tracking.

🔐 Authentication Flow

Uses Firebase Email/Password login.

If user has no Firestore user document, extension redirects to:

https://niyambadha.vercel.app/auth/signup

Prevents extension use without an account.

🌐 API Endpoints (Next.js)
Method Endpoint Purpose
GET /api/userdata Fetch user settings
PATCH /api/userdata/watchtime Update watch time
GET /api/redirects Check redirect status
POST /api/redirects Log redirect event
📸 Screenshots

(Add these later)

Dashboard

Blocked websites manager

Puzzle portal

Chrome extension in action

👨‍💻 Author – Nikhil Kale

Full-Stack Developer | AI Engineer

Passionate about building AI-powered apps, productivity tools, and real-time systems.

Portfolio: (Add your portfolio link if you want)

🔗 Related Projects
🌸 PeriodCare – Menstrual Health AI Companion

➡ Live: https://periodcareforyou.vercel.app/

♻️ ZeroWasteBite – Stop Food Waste Platform

➡ Live: https://zerowastebite.vercel.app/

🚀 Avsarmarg – Campus to Corporate Platform

➡ Live: https://avsarmarg.vercel.app/

🖨️ File Xerox – Upload → Print → Pickup

➡ Live: https://filexerox.vercel.app/

🤖 BodhaBot – Smart Chatbot Builder

➡ Live: https://bodhabot.vercel.app/

🏫 AI-Powered Modern College Website

➡ GitHub: https://github.com/1900690105/GROUP_G1

📄 License

MIT License — you're free to use, modify, and distribute.
