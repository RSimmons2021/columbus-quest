class CreateQuests < ActiveRecord::Migration[7.0]
  def change
    create_table :quests do |t|
      t.string :name, null: false
      t.text :description
      t.integer :points_per_checkpoint, default: 10
      t.boolean :active, default: true

      t.timestamps
    end

    add_index :quests, :active
  end
end