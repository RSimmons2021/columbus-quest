class CreateTrackers < ActiveRecord::Migration[7.0]
  def change
    create_table :trackers do |t|
      t.references :user, null: false, foreign_key: true
      t.references :checkpoint, null: false, foreign_key: true
      t.datetime :checked_in_at, default: -> { 'CURRENT_TIMESTAMP' }

      t.timestamps
    end

    add_index :trackers, [:user_id, :checkpoint_id], unique: true
    add_index :trackers, :checked_in_at
  end
end