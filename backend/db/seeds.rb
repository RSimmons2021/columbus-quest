# Clear existing data
Tracker.destroy_all
Checkpoint.destroy_all
Quest.destroy_all
User.destroy_all

# Create sample users
users = [
  { username: 'sarah_explorer', email: 'sarah@example.com', password: 'password123', first_name: 'Sarah', last_name: 'Johnson' },
  { username: 'mike_adventurer', email: 'mike@example.com', password: 'password123', first_name: 'Mike', last_name: 'Davis' },
  { username: 'jenny_quest', email: 'jenny@example.com', password: 'password123', first_name: 'Jenny', last_name: 'Wilson' }
]

created_users = users.map { |user_data| User.create!(user_data) }
puts "Created #{created_users.count} users"

# Create sample quest
coffee_quest = Quest.create!(
  name: "Downtown Coffee Tour",
  description: "Explore Columbus's best coffee shops in the downtown area",
  points_per_checkpoint: 15
)

# Create checkpoints for the coffee quest
checkpoints_data = [
  { name: "Starbucks Downtown", description: "The classic chain coffee", latitude: 39.9612, longitude: -82.9988, order_number: 1 },
  { name: "Local Grounds Cafe", description: "Artisan coffee roasted locally", latitude: 39.9622, longitude: -82.9968, order_number: 2 },
  { name: "Columbus Roasters", description: "Premium beans from around the world", latitude: 39.9632, longitude: -82.9948, order_number: 3 }
]

checkpoints = checkpoints_data.map do |checkpoint_data|
  coffee_quest.checkpoints.create!(checkpoint_data)
end

puts "Created quest: #{coffee_quest.name} with #{checkpoints.count} checkpoints"

# Create a second quest
art_quest = Quest.create!(
  name: "Public Art Discovery",
  description: "Find and appreciate Columbus's amazing public art installations",
  points_per_checkpoint: 20
)

art_checkpoints = [
  { name: "Bicentennial Park Sculptures", description: "Beautiful riverside art", latitude: 39.9512, longitude: -83.0088, order_number: 1 },
  { name: "Short North Gallery Hop", description: "Galleries and street art", latitude: 39.9712, longitude: -82.9888, order_number: 2 }
]

art_checkpoints.each { |data| art_quest.checkpoints.create!(data) }

puts "Created quest: #{art_quest.name} with #{art_quest.checkpoints.count} checkpoints"

# Create RSS feeds
Feed.destroy_all

atlas_obscura = Feed.create!(
  name: "Atlas Obscura",
  url: "https://www.atlasobscura.com/feeds/latest",
  description: "Curious and wondrous travel destinations",
  active: true,
  refresh_interval: 3600 # 1 hour
)

puts "Created RSS feed: #{atlas_obscura.name}"

# Try to fetch initial articles
begin
  atlas_obscura.fetch_and_parse!
  puts "Successfully fetched articles from Atlas Obscura"
rescue => e
  puts "Warning: Could not fetch initial articles: #{e.message}"
end

puts "Seed data complete!"
