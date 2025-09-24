class CreateCheckpoints < ActiveRecord::Migration[7.0]
  def change
    create_table :checkpoints do |t|
      t.references :quest, null: false, foreign_key: true
      t.string :name, null: false
      t.text :description
      t.decimal :latitude, precision: 10, scale: 6
      t.decimal :longitude, precision: 10, scale: 6
      t.integer :order_number, default: 1

      t.timestamps
    end

    add_index :checkpoints, [:quest_id, :order_number]
  end
end