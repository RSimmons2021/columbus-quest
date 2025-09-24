# Columbus Quest - OBM Interview App


## Overview
A gamified city discovery platform for Columbus, Ohio. Users explore the city by checking into quest locations, earning points, and competing on leaderboards.

## Core Features
1. **User Registration/Auth** - Basic user system
2. **Location-Based Quests** - Find nearby quest locations
3. **Check-in System** - Users can check in at quest locations
4. **Real-time Leaderboard** - Points system with live rankings
5. **Quest Management** - Admin can create/manage quests

## Tech Stack
- **Backend**: Rails API with PostgreSQL
- **Frontend**: React with geolocation
- **Real-time**: WebSockets for live updates

## Project Structure
```
backend/     # Rails API
frontend/    # React app
```

## Getting Started

### Prerequisites
- Node.js and npm
- Ruby on Rails
- PostgreSQL

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/RSimmons2021/Orange-Barrel-Media-Full-Stack-Project
   cd columbus-quest
   ```

2. **Start the backend**
   ```bash
   cd backend
   bundle install
   rails db:create db:migrate
   rails s -p 3001
   ```

3. **Start the frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the app**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## Features to Add
- Social features
- Achievement system
