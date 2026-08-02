# Games Repository

This repository contains two browser-based games, each with different goals and gameplay mechanics.

## 🎮 Games

### 1. CodeQuest - Learn to Code Through Adventure

**Location**: `/code-quest/`

An interactive educational game that teaches JavaScript programming through progressive challenges.

**Features:**
- 12 coding challenges from beginner to advanced
- Real-time code execution and validation
- XP system, levels, and achievements
- Beautiful dark-themed UI
- Progress tracking with localStorage

**How to Play:**
```bash
cd code-quest
python3 -m http.server 8080
```
Then visit `http://localhost:8080`

**Learn More:** [CodeQuest README](code-quest/README.md)

---

### 2. THR33 - Orbit Arcade

**Location**: `/game/`

A fast-paced arcade game where you pilot a craft through falling cores and shards.

**Features:**
- Arcade-style gameplay
- Combo chains
- Shield system
- Wave progression
- Touch and keyboard controls

**How to Play:**
```bash
cd game
python3 -m http.server 8080
```
Then visit `http://localhost:8080`

**Learn More:** [THR33 README](game/README.md)

---

## 🚀 Quick Start

Both games are pure HTML/CSS/JavaScript and can be run by simply opening the `index.html` file in a browser, or by running a local server.

### Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Optional: Python 3 or Node.js for local server

### No Installation Required
Both games run entirely in the browser with no external dependencies!

---

## 📁 Repository Structure

```
.
├── code-quest/          # Educational coding game
│   ├── index.html
│   ├── styles.css
│   ├── game.js
│   └── README.md
│
├── game/                # THR33 arcade game
│   ├── index.html
│   ├── styles.css
│   ├── game.js
│   └── README.md
│
└── 33/                  # Backend application
```

---

## 🎯 Target Audience

- **CodeQuest**: Beginners learning to code, students, educators
- **THR33**: Gamers looking for a quick arcade experience

---

## 🛠️ Technology

Both games are built with:
- HTML5
- CSS3
- Vanilla JavaScript
- No frameworks or build tools required

---

## 📝 License

Open source - feel free to use and modify!

---

**Have fun playing and learning!** 🎮🚀
