# OBM Code Day - Interview Preparation Guide 🎯

## 🕒 Timeline & Logistics
- **Arrival**: 9:30 AM
- **Duration**: Full day until ~4:00 PM
- **Structure**: Individual work + pair programming + presentation
- **Lunch**: Break included
- **Slack**: Team communication channel for async questions

---

## 🚀 Most Likely Features They'll Ask You to Build

### 1. **User Authentication System** (High Probability - 90%)
**Why**: JWT gem already in Gemfile, foundational for any app
**What to build**:
- User registration and login endpoints
- JWT token generation and validation
- Protected routes in React
- User profile management

**Prep Strategy**:
```ruby
# Backend: User model and auth controller ready
class User < ApplicationRecord
  has_secure_password
  validates :email, presence: true, uniqueness: true
end

# Controller action structure
def login
  user = User.find_by(email: params[:email])
  if user&.authenticate(params[:password])
    token = JWT.encode({user_id: user.id}, Rails.application.secret_key_base)
    render json: {token: token, user: user}
  else
    render json: {error: 'Invalid credentials'}, status: 401
  end
end
```

**Frontend prep**:
- Know how to store JWT in localStorage
- Implement protected route wrapper
- Add auth context to React

### 2. **Real-time Features** (High Probability - 85%)
**Why**: Modern apps need live updates, shows WebSocket knowledge
**What to build**:
- Live leaderboard updates
- Real-time quest completion notifications
- Active user indicators

**Prep Strategy**:
- Review Action Cable in Rails 8
- Know WebSocket basics
- Understand React useEffect for WebSocket connections

### 3. **Administrative Dashboard** (Medium Probability - 70%)
**Why**: Kiosks need content management
**What to build**:
- Quest creation interface
- User management panel
- Analytics dashboard
- Content moderation tools

**Prep Strategy**:
- Think about Rails admin gems (rails_admin, active_admin)
- Plan CRUD operations for quests
- Design admin-only routes

### 4. **Enhanced GPS/Location Features** (Medium Probability - 65%)
**Why**: Core to location-based app functionality
**What to build**:
- GPS validation for check-ins
- Distance calculation
- Location accuracy requirements
- Offline mode support

**Prep Strategy**:
```javascript
// Know the Geolocation API
navigator.geolocation.getCurrentPosition((position) => {
  const {latitude, longitude} = position.coords;
  // Calculate distance to checkpoint
  const distance = calculateDistance(latitude, longitude, checkpoint.lat, checkpoint.lng);
  if (distance < 50) { // 50 meters
    // Allow check-in
  }
});
```

### 5. **Advanced Gamification** (Medium Probability - 60%)
**Why**: Makes the app more engaging
**What to build**:
- Achievement badge system
- Streak tracking
- Bonus point multipliers
- Difficulty-based rewards

**Prep Strategy**:
- Design Achievement model
- Think about trigger events
- Plan badge UI components

---

## 🎯 Technical Challenges They Might Present

### Database Optimization
**Challenge**: "This app will have 10,000+ users. How do you optimize queries?"
**Prep**:
- Know about database indexing
- Understand N+1 query problems
- Review Rails `includes()` and `joins()`
- Geographic queries with PostGIS

### Security Considerations
**Challenge**: "How do you prevent location spoofing?"
**Prep**:
- Understand HTTPS requirements
- Know about rate limiting
- GPS accuracy validation
- User input sanitization

### Performance Optimization
**Challenge**: "The app feels slow on mobile. What do you do?"
**Prep**:
- React optimization techniques (useMemo, useCallback)
- Image optimization strategies
- Lazy loading implementation
- Bundle size analysis

### API Design
**Challenge**: "Design an API for team-based quests"
**Prep**:
- RESTful endpoint design
- Nested resource relationships
- Pagination strategies
- API versioning

---

## ⚡ Quick Implementation Templates

### 1. User Authentication (15-20 minutes)

**Backend Model**:
```ruby
# Add to existing migration or create new
class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :email, null: false
      t.string :password_digest
      t.string :first_name
      t.string :last_name
      t.timestamps
    end
    add_index :users, :email, unique: true
  end
end
```

**Backend Controller**:
```ruby
class Api::V1::AuthController < ApplicationController
  def register
    user = User.new(user_params)
    if user.save
      token = JWT.encode({user_id: user.id}, Rails.application.secret_key_base)
      render json: {token: token, user: user}
    else
      render json: {errors: user.errors}, status: 400
    end
  end

  def login
    user = User.find_by(email: params[:email])
    if user&.authenticate(params[:password])
      token = JWT.encode({user_id: user.id}, Rails.application.secret_key_base)
      render json: {token: token, user: user}
    else
      render json: {error: 'Invalid credentials'}, status: 401
    end
  end

  private
  def user_params
    params.require(:user).permit(:email, :password, :first_name, :last_name)
  end
end
```

**Frontend Auth Context**:
```javascript
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = async (email, password) => {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, password})
    });
    const data = await response.json();
    if (data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
    }
    return data;
  };

  return (
    <AuthContext.Provider value={{user, token, login}}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 2. Real-time Updates (20-25 minutes)

**Backend Channel**:
```ruby
class QuestChannel < ApplicationCable::Channel
  def subscribed
    stream_from "quest_updates"
  end

  def unsubscribed
    stop_all_streams
  end
end

# In controller after quest completion
ActionCable.server.broadcast("quest_updates", {
  type: 'quest_completed',
  user: user.name,
  quest: quest.name,
  leaderboard: updated_leaderboard
})
```

**Frontend WebSocket**:
```javascript
useEffect(() => {
  const cable = createCable();
  const subscription = cable.subscriptions.create("QuestChannel", {
    received: (data) => {
      if (data.type === 'quest_completed') {
        // Update leaderboard
        setLeaderboard(data.leaderboard);
        // Show notification
        showNotification(`${data.user} completed ${data.quest}!`);
      }
    }
  });

  return () => subscription.unsubscribe();
}, []);
```

### 3. GPS Validation (10-15 minutes)

```javascript
const validateLocation = async (checkpointId) => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Get checkpoint coordinates from API or props
        const distance = calculateDistance(userLat, userLng, checkpoint.latitude, checkpoint.longitude);

        if (distance <= 50) { // 50 meter radius
          resolve({valid: true, distance});
        } else {
          resolve({valid: false, distance, required: 50});
        }
      },
      (error) => reject(error),
      {enableHighAccuracy: true, timeout: 10000}
    );
  });
};

// Haversine formula for distance calculation
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lng2-lng1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};
```

---

## 🗣️ Communication & Soft Skills

### What They Want to See
1. **Clear thinking process** - Verbalize your approach
2. **Question asking** - Clarify requirements before coding
3. **Problem-solving methodology** - Break down complex tasks
4. **Code explanation** - Walk through your decisions
5. **Collaboration** - Be receptive to feedback during pairing

### Sample Responses to Common Questions

**"How would you approach this feature?"**
> "First, I'd want to understand the user flow and requirements. Then I'd think about the data model changes needed, design the API endpoints, implement the backend logic, and finally build the frontend components. Should I start with the backend or would you prefer to see the UI mockup first?"

**"This code isn't working, what do you think?"**
> "Let me read through this step by step. I'd first check the browser console for any errors, then verify the API endpoint is returning the expected data structure. Would you like me to add some console.log statements to debug the data flow?"

**"How would you make this more performant?"**
> "I'd look at a few areas: database query optimization with proper indexing, frontend bundle size reduction, implementing pagination for large datasets, and adding caching where appropriate. Which area would be most impactful for this specific use case?"

---

## 🛠️ Technical Setup Checklist

### Before You Arrive
- [ ] Laptop fully charged + bring charger
- [ ] PostgreSQL installed and running
- [ ] Ruby 3.4.6 installed
- [ ] Node.js 18+ installed
- [ ] Git configured with your credentials
- [ ] Code editor configured (VS Code recommended)
- [ ] Browser dev tools familiar
- [ ] Terminal/command line ready

### Environment Test
```bash
# Verify everything works
cd columbus-quest/backend
bundle install
rails db:create db:migrate
rails server -p 3001

# In another terminal
cd columbus-quest/frontend
npm install
npm start
```

### Debugging Tools
- **Rails console**: `rails console`
- **Database access**: `rails dbconsole`
- **Route checking**: `rails routes | grep api`
- **Log monitoring**: `tail -f log/development.log`
- **React dev tools**: Browser extension
- **API testing**: Postman or curl commands

---

## 📝 Code Style & Best Practices

### Ruby/Rails Style
```ruby
# Good
class Api::V1::QuestsController < ApplicationController
  before_action :set_quest, only: [:show, :update]

  def show
    render json: @quest.as_json(include: :checkpoints)
  end

  private

  def set_quest
    @quest = Quest.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {error: 'Quest not found'}, status: 404
  end
end
```

### React/JavaScript Style
```javascript
// Good
const QuestCard = ({ quest, onComplete }) => {
  const handleCheckIn = useCallback(async (checkpointId) => {
    try {
      const response = await api.checkIn(quest.id, checkpointId);
      onComplete(response.data);
    } catch (error) {
      console.error('Check-in failed:', error);
      // Handle error appropriately
    }
  }, [quest.id, onComplete]);

  return (
    <MedievalCard>
      {/* Component JSX */}
    </MedievalCard>
  );
};
```

---

## 🎯 Final Tips for Success

### Do's
- ✅ Ask clarifying questions upfront
- ✅ Start with the simplest implementation that works
- ✅ Explain your thought process out loud
- ✅ Write clean, readable code
- ✅ Test as you go (manual testing is fine)
- ✅ Show enthusiasm for the problem
- ✅ Be honest about what you know/don't know

### Don'ts
- ❌ Don't dive into coding without understanding requirements
- ❌ Don't over-engineer solutions
- ❌ Don't stay silent when stuck
- ❌ Don't ignore error messages
- ❌ Don't be afraid to start over if needed
- ❌ Don't forget to commit your work regularly

### If You Get Stuck
1. **Read error messages carefully**
2. **Check the browser console**
3. **Verify API responses with network tab**
4. **Add console.log/puts statements for debugging**
5. **Ask for help - they want you to succeed!**

---

## 🏆 Success Metrics

They're evaluating:
- **Technical competency** - Can you write clean, working code?
- **Problem-solving** - How do you approach unknown challenges?
- **Communication** - Can you explain your thinking clearly?
- **Collaboration** - How do you work with others?
- **Learning ability** - How quickly do you adapt to feedback?
- **Product thinking** - Do you consider user experience?

Remember: **They want you to succeed!** This is about seeing how you work and think, not about trick questions or impossible challenges.

---

*You've got this! Your Columbus Quest app already demonstrates strong full-stack skills. Trust your abilities, communicate clearly, and enjoy the collaborative coding experience.* 🚀

**Final advice**: Get a good night's sleep, arrive refreshed, and remember that showing your thinking process is just as important as the final code. Good luck! 🍀