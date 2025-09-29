# PostgreSQL Database Setup Instructions 🗄️

## 🚨 Current Status
PostgreSQL is **installed** but the service is **not running**. You'll need to start it before your interview tomorrow.

---

## ⚡ Quick Fix (5 minutes)

### Option 1: Windows Services (Recommended)
1. **Press** `Win + R`
2. **Type** `services.msc` and press Enter
3. **Find** `postgresql-x64-17` in the list
4. **Right-click** → Start
5. **Set** Startup type to "Automatic" (right-click → Properties)

### Option 2: Command Line (Run as Administrator)
```cmd
net start postgresql-x64-17
```

### Option 3: PostgreSQL Service Manager
1. **Navigate to** `C:\Program Files\PostgreSQL\17\bin\`
2. **Run** `pg_ctl.exe` as administrator
3. **Start** the service

---

## 🧪 Test Database Connection

Once PostgreSQL is running, test the connection:

```bash
# Test basic connection
psql -U postgres -h localhost

# Create the development database
cd columbus-quest/backend
DATABASE_PASSWORD=your_password_here rails db:create
rails db:migrate
rails db:seed  # If you have seed data
```

### Sample Rails Test
```bash
cd columbus-quest/backend
rails console

# In Rails console, test the connection:
>> ActiveRecord::Base.connection.active?
=> true  # This should return true if connected

>> Quest.count
=> 0     # Should return without errors
```

---

## 🔧 Common PostgreSQL Issues & Solutions

### Issue 1: "Connection refused"
**Solution**: PostgreSQL service isn't running
```bash
# Start the service (run as admin)
net start postgresql-x64-17
```

### Issue 2: "fe_sendauth: no password supplied"
**Solution**: Set the DATABASE_PASSWORD environment variable
```bash
# Option 1: Set temporarily
set DATABASE_PASSWORD=your_password

# Option 2: Create .env file in backend/
echo DATABASE_PASSWORD=your_password > backend/.env
```

### Issue 3: "database does not exist"
**Solution**: Create the database
```bash
cd columbus-quest/backend
rails db:create
```

### Issue 4: "role 'postgres' does not exist"
**Solution**: Create the postgres user
```bash
# Connect as superuser and create user
createuser -s postgres
```

---

## 📋 Pre-Interview Database Checklist

### ✅ Before Your Interview
- [ ] PostgreSQL service is running
- [ ] Can connect via `psql -U postgres -h localhost`
- [ ] Rails can connect: `rails db:create` works
- [ ] Database is migrated: `rails db:migrate` completes
- [ ] Rails server starts without errors: `rails server`
- [ ] API endpoints respond: Test `GET /api/v1/quests`

### 🧪 Quick Smoke Test
```bash
# This should all work without errors:
cd columbus-quest/backend
rails db:create
rails db:migrate
rails server -p 3001 &

# In another terminal:
curl http://localhost:3001/api/v1/quests
# Should return JSON response (even if empty array)
```

---

## 🛠️ Database Configuration Reference

### Current Configuration (`config/database.yml`)
```yaml
development:
  adapter: postgresql
  encoding: unicode
  database: columbus_quest_development
  username: postgres
  password: <%= ENV['DATABASE_PASSWORD'] %>
  host: localhost
  pool: 5
```

### Environment Variables Needed
```bash
DATABASE_PASSWORD=your_postgres_password
```

---

## 📊 Sample Data for Demo

If you want to add some demo data for the interview:

### Create Sample Migration
```bash
cd columbus-quest/backend
rails generate migration AddSampleData
```

### Sample Seeds (`db/seeds.rb`)
```ruby
# Clear existing data
Quest.destroy_all

# Create sample quests
quest1 = Quest.create!(
  name: "Historic Downtown Discovery",
  description: "Explore the heart of Columbus and discover its rich history.",
  points_per_checkpoint: 10,
  difficulty: "Easy"
)

quest1.checkpoints.create!([
  {
    name: "Statehouse",
    description: "Ohio's beautiful state capitol building.",
    latitude: 39.9612,
    longitude: -82.9988,
    order_number: 1
  },
  {
    name: "Scioto Mile",
    description: "Scenic riverfront park and fountain.",
    latitude: 39.9584,
    longitude: -83.0009,
    order_number: 2
  }
])

quest2 = Quest.create!(
  name: "Short North Adventure",
  description: "Experience Columbus's arts district.",
  points_per_checkpoint: 15,
  difficulty: "Medium"
)

quest2.checkpoints.create!([
  {
    name: "Gallery Hop",
    description: "Monthly arts event in the Short North.",
    latitude: 39.9734,
    longitude: -83.0018,
    order_number: 1
  }
])

puts "Created #{Quest.count} quests with #{Checkpoint.count} checkpoints"
```

### Run Seeds
```bash
rails db:seed
```

---

## 🚨 Emergency Backup Plan

If PostgreSQL won't start, you can quickly switch to SQLite for the interview:

### Quick SQLite Setup
1. **Edit** `config/database.yml`:
```yaml
development:
  adapter: sqlite3
  database: db/development.sqlite3
  pool: 5
  timeout: 5000
```

2. **Update** `Gemfile`:
```ruby
# Replace pg gem with:
gem 'sqlite3', '~> 1.4'
```

3. **Run**:
```bash
bundle install
rails db:create db:migrate db:seed
```

**Note**: Only use SQLite as a last resort. PostgreSQL shows better production readiness.

---

## 🎯 PostgreSQL Commands Cheat Sheet

### Service Management
```bash
net start postgresql-x64-17    # Start service
net stop postgresql-x64-17     # Stop service
net restart postgresql-x64-17  # Restart service
```

### Database Operations
```bash
psql -U postgres -h localhost  # Connect to PostgreSQL
\l                             # List databases
\c database_name               # Connect to database
\dt                            # List tables
\q                             # Quit psql
```

### Rails Database Tasks
```bash
rails db:create                # Create databases
rails db:drop                  # Drop databases
rails db:migrate               # Run migrations
rails db:rollback              # Rollback last migration
rails db:reset                 # Drop, create, and migrate
rails db:seed                  # Load seed data
```

---

## ⏰ Interview Day Database Priority

### High Priority (Must Work)
1. ✅ PostgreSQL service running
2. ✅ Rails can connect to database
3. ✅ API endpoints return data
4. ✅ Basic CRUD operations work

### Medium Priority (Nice to Have)
- Sample data populated
- All migrations applied
- Performance optimization
- Proper indexing

### Low Priority (If Time Permits)
- Advanced PostgreSQL features
- Database backup/restore
- Connection pooling tuning

---

**🚀 You're almost ready! Just get PostgreSQL running and you'll be all set for a successful interview tomorrow. The technical documentation and preparation guides will serve you well.**

**Final tip**: If you run into issues tomorrow morning, mention it early to the team. They'll likely help you get it sorted quickly so you can focus on the coding challenges.