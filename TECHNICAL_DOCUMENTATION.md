# Columbus Quest - Technical Documentation 🏛️
*Interview Reference Guide - Orange Barrel Media Code Day*

---

## 🚀 Project Overview

**Columbus Quest** is a full-stack location-based gamification application that turns exploring Columbus into an engaging RPG-style adventure. Users complete "quests" by visiting real-world locations, earning points, and competing on leaderboards.

### Core Concept
- **Gamified exploration** of Columbus city locations
- **Quest-based system** with checkpoints and rewards
- **Progressive Web App (PWA)** optimized for mobile kiosks
- **Medieval RPG theming** for immersive user experience

---

## 🏗️ Architecture Overview

### Frontend Stack
- **React 18** - Modern UI library with hooks
- **Framer Motion** - Advanced animations and micro-interactions
- **Tailwind CSS** - Utility-first styling framework
- **Custom medieval theme system** - Immersive RPG aesthetic

### Backend Stack
- **Ruby on Rails 8.0.3** - Robust API framework
- **PostgreSQL** - Reliable relational database
- **RESTful API design** - Clean endpoint structure
- **CORS enabled** - Frontend-backend communication

### Key Technologies
- **Ruby 3.4.6** - Latest stable Ruby version
- **React Router** - Client-side navigation
- **JWT Authentication** (ready for implementation)
- **Responsive Design** - Mobile-first approach

---

## 📁 Project Structure

```
columbus-quest/
├── backend/                 # Rails API
│   ├── app/
│   │   ├── controllers/api/v1/  # API endpoints
│   │   ├── models/              # Data models
│   │   └── views/               # JSON responses
│   ├── config/              # Rails configuration
│   └── db/                  # Database migrations
│
└── frontend/               # React SPA
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Route components
    │   ├── contexts/       # React context (theme)
    │   └── services/       # API communication
    └── public/             # Static assets
```

---

## 🗄️ Database Schema

### Core Models

#### Quest
```ruby
class Quest < ApplicationRecord
  has_many :checkpoints, dependent: :destroy

  # Attributes:
  # - name: string
  # - description: text
  # - points_per_checkpoint: integer
  # - difficulty: string
  # - is_active: boolean
end
```

#### Checkpoint
```ruby
class Checkpoint < ApplicationRecord
  belongs_to :quest
  has_many :trackers, dependent: :destroy

  # Attributes:
  # - name: string
  # - description: text
  # - latitude: decimal
  # - longitude: decimal
  # - order_number: integer
end
```

#### Tracker
```ruby
class Tracker < ApplicationRecord
  belongs_to :checkpoint

  # Attributes:
  # - user_identifier: string
  # - visited_at: datetime
  # - points_earned: integer
end
```

---

## 🔌 API Endpoints

### Quest Endpoints
```
GET    /api/v1/quests           # List all active quests
GET    /api/v1/quests/:id       # Get specific quest with checkpoints
POST   /api/v1/quests/:id/check_in/:checkpoint_id  # Check into location
```

### Leaderboard Endpoints
```
GET    /api/v1/leaderboard      # Get top users and current user position
```

### Response Format
```json
{
  "id": 1,
  "name": "Historic Downtown Discovery",
  "description": "Explore the heart of Columbus...",
  "points_per_checkpoint": 10,
  "total_checkpoints": 5,
  "completed_checkpoints": 2,
  "checkpoints": [...]
}
```

---

## 🎨 Frontend Architecture

### Component Hierarchy
```
App
├── MedievalNavbar           # Navigation with theme controls
├── PageTransition           # Route transition animations
├── MedievalParticles        # Background ambiance
└── Pages
    ├── Home                 # Dashboard with stats
    ├── Quests               # Quest listing and filters
    ├── QuestDetail          # Individual quest view
    ├── Progress             # User achievement tracking
    ├── Leaderboard          # Competitive rankings
    └── MapView              # Interactive location map
```

### Key Components

#### MedievalQuestCard
- **Purpose**: Display quest information with medieval styling
- **Features**: Progress tracking, status badges, animations
- **Props**: quest data, interaction handlers, display options

#### ProgressBar
- **Purpose**: Visual progress indication with medieval theming
- **Features**: Animated fills, glow effects, color variants
- **Colors**: gold, bronze, emerald, ruby, sapphire, silver

#### ThemeContext
- **Purpose**: Global theme management
- **Features**: Dark/light mode, accent color switching
- **Persistence**: Local storage integration

### Styling System
```css
/* CSS Variables for Dynamic Theming */
:root {
  --accent-color: 218, 165, 32;  /* Gold default */
  --bg-primary: 250, 245, 235;
  --bg-secondary: 240, 230, 210;
}
```

---

## 🔄 Data Flow

### Quest Completion Flow
1. **User navigates** to quest detail page
2. **Location-based** check-in validation
3. **API call** to record progress
4. **Real-time updates** to UI components
5. **Points calculation** and leaderboard updates

### State Management
- **React Context** for global theme state
- **Component state** for local UI interactions
- **API service layer** for data fetching
- **Local storage** for user preferences

---

## 🛠️ Development Setup

### Prerequisites
- **Node.js 18+** for frontend development
- **Ruby 3.4.6** for backend development
- **PostgreSQL 14+** for database
- **Git** for version control

### Environment Variables
```bash
# Backend (.env)
DATABASE_PASSWORD=your_password
DATABASE_USER=postgres
RAILS_ENV=development
```

### Quick Start
```bash
# Backend setup
cd backend
bundle install
rails db:setup
rails server -p 3001

# Frontend setup
cd frontend
npm install
npm start
```

---

## 🎯 Key Features Implemented

### ✅ Core Functionality
- **Quest listing** with medieval-themed cards
- **Progress tracking** with visual indicators
- **Leaderboard system** with rankings
- **Responsive design** for mobile/kiosk use
- **Theme customization** (6 medieval color schemes)
- **Smooth animations** throughout the app

### ✅ User Experience
- **Medieval RPG aesthetic** with authentic styling
- **Intuitive navigation** with clear visual hierarchy
- **Loading states** with themed spinners
- **Error handling** with user-friendly messages
- **Accessibility** considerations in component design

### ✅ Technical Excellence
- **Clean code architecture** with separation of concerns
- **Reusable components** with prop-based customization
- **Performance optimization** with React best practices
- **API design** following RESTful conventions
- **Database normalization** for scalability

---

## 🚀 Potential Features for Code Day

### High-Probability Additions
1. **User Authentication System**
   - JWT implementation already in Gemfile
   - User registration and login
   - Profile management

2. **Real-time Features**
   - WebSocket integration for live updates
   - Real-time leaderboard changes
   - Live quest completion notifications

3. **Enhanced Gamification**
   - Achievement badges system
   - Streak tracking
   - Bonus point multipliers
   - Quest difficulty levels

4. **Social Features**
   - Team/group quest completion
   - Photo sharing at checkpoints
   - Comments and reviews
   - Friend systems

5. **Administrative Interface**
   - Quest management dashboard
   - Analytics and reporting
   - User management tools
   - Content moderation

6. **Mobile Enhancements**
   - GPS-based check-in validation
   - Push notifications
   - Offline mode support
   - Camera integration

### Technical Enhancements
- **Testing infrastructure** (RSpec, Jest)
- **Performance monitoring**
- **Caching strategies**
- **API rate limiting**
- **Security hardening**

---

## 💡 Interview Preparation Tips

### Technical Talking Points
1. **Component Architecture**: Explain the medieval theming system and reusable component design
2. **State Management**: Discuss React Context vs local state decisions
3. **API Design**: Walk through RESTful endpoint structure
4. **Database Design**: Explain the quest-checkpoint-tracker relationships
5. **Performance**: Highlight animation optimizations and lazy loading

### Code Quality Highlights
- **Consistent naming conventions** across frontend and backend
- **Error boundary implementations** for graceful failures
- **Responsive design patterns** using modern CSS
- **Clean API responses** with proper status codes
- **Modular component structure** for maintainability

### Potential Discussion Areas
- **Scalability considerations** for larger user bases
- **Mobile-first design decisions** for kiosk deployment
- **Theme system architecture** for easy customization
- **Database optimization** for geographic queries
- **Security best practices** for location-based apps

---

## 🎯 Demo Script for Presentation

### 5-Minute Demo Flow
1. **Home Page** - Show dashboard with stats and medieval theming
2. **Quest Board** - Demonstrate filtering and quest card interactions
3. **Quest Detail** - Walk through check-in process and progress tracking
4. **Progress Page** - Highlight achievement system and user analytics
5. **Leaderboard** - Show competitive elements and ranking system
6. **Theme Controls** - Demonstrate color scheme switching
7. **Mobile Responsiveness** - Show adaptive design across devices

### Technical Deep-Dive Points
- **Animation system** using Framer Motion
- **CSS variable theming** for dynamic color changes
- **Component composition** patterns
- **API integration** with error handling
- **Progressive enhancement** approach

---

## 📚 Technologies Reference

### Frontend Dependencies
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.8.0",
  "framer-motion": "^10.0.0",
  "lucide-react": "^0.263.1"
}
```

### Backend Dependencies
```ruby
gem 'rails', '~> 8.0.3'
gem 'pg', '~> 1.1'
gem 'puma', '~> 6.0'
gem 'rack-cors'
gem 'bcrypt', '~> 3.1.7'
gem 'jwt'
```

---

## 🔧 Troubleshooting

### Common Issues
1. **Database Connection**: Ensure PostgreSQL is running and environment variables are set
2. **CORS Errors**: Check rack-cors configuration in Rails
3. **Build Errors**: Clear node_modules and reinstall dependencies
4. **Animation Performance**: Use `will-change` CSS property for complex animations

### Development Commands
```bash
# Rails
rails db:reset              # Reset database
rails routes                # Show all API endpoints
rails console               # Interactive Rails console

# React
npm run build               # Production build
npm run test                # Run test suite
npm run lint                # Code linting
```

---

*This documentation serves as a comprehensive reference for the Columbus Quest application architecture, implementation details, and interview preparation. Good luck with your Orange Barrel Media code day!* 🚀