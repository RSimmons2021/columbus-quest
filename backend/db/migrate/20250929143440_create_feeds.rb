class CreateFeeds < ActiveRecord::Migration[8.0]
  def change
    create_table :feeds do |t|
      t.string :name, null: false
      t.string :url, null: false
      t.text :description
      t.datetime :last_fetched_at
      t.boolean :active, default: true
      t.integer :refresh_interval, default: 3600

      t.timestamps
    end

    add_index :feeds, :url, unique: true
    add_index :feeds, :active
  end
end
