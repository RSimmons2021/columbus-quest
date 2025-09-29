# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_09_29_143520) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "articles", force: :cascade do |t|
    t.bigint "feed_id", null: false
    t.string "title", null: false
    t.text "description"
    t.text "content"
    t.string "url", null: false
    t.string "image_url"
    t.string "author"
    t.datetime "published_at"
    t.string "guid"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index "to_tsvector('english'::regconfig, (((((title)::text || ' '::text) || COALESCE(description, ''::text)) || ' '::text) || COALESCE(content, ''::text)))", name: "articles_search_idx", using: :gin
    t.index ["feed_id"], name: "index_articles_on_feed_id"
    t.index ["guid"], name: "index_articles_on_guid", unique: true
    t.index ["published_at"], name: "index_articles_on_published_at"
    t.index ["url"], name: "index_articles_on_url"
  end

  create_table "checkpoints", force: :cascade do |t|
    t.bigint "quest_id", null: false
    t.string "name", null: false
    t.text "description"
    t.decimal "latitude", precision: 10, scale: 6
    t.decimal "longitude", precision: 10, scale: 6
    t.integer "order_number", default: 1
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["quest_id", "order_number"], name: "index_checkpoints_on_quest_id_and_order_number"
    t.index ["quest_id"], name: "index_checkpoints_on_quest_id"
  end

  create_table "feeds", force: :cascade do |t|
    t.string "name", null: false
    t.string "url", null: false
    t.text "description"
    t.datetime "last_fetched_at"
    t.boolean "active", default: true
    t.integer "refresh_interval", default: 3600
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_feeds_on_active"
    t.index ["url"], name: "index_feeds_on_url", unique: true
  end

  create_table "quests", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.integer "points_per_checkpoint", default: 10
    t.boolean "active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_quests_on_active"
  end

  create_table "read_statuses", force: :cascade do |t|
    t.bigint "article_id", null: false
    t.string "user_session_id", null: false
    t.datetime "read_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["article_id", "user_session_id"], name: "index_read_statuses_on_article_id_and_user_session_id", unique: true
    t.index ["article_id"], name: "index_read_statuses_on_article_id"
    t.index ["user_session_id"], name: "index_read_statuses_on_user_session_id"
  end

  create_table "trackers", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "checkpoint_id", null: false
    t.datetime "checked_in_at", default: -> { "CURRENT_TIMESTAMP" }
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["checked_in_at"], name: "index_trackers_on_checked_in_at"
    t.index ["checkpoint_id"], name: "index_trackers_on_checkpoint_id"
    t.index ["user_id", "checkpoint_id"], name: "index_trackers_on_user_id_and_checkpoint_id", unique: true
    t.index ["user_id"], name: "index_trackers_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "username", null: false
    t.string "email", null: false
    t.string "password_digest", null: false
    t.string "first_name"
    t.string "last_name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  add_foreign_key "articles", "feeds"
  add_foreign_key "checkpoints", "quests"
  add_foreign_key "read_statuses", "articles"
  add_foreign_key "trackers", "checkpoints"
  add_foreign_key "trackers", "users"
end
