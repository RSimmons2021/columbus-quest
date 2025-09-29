class CreateReadStatuses < ActiveRecord::Migration[8.0]
  def change
    create_table :read_statuses do |t|
      t.references :article, null: false, foreign_key: true
      t.string :user_session_id, null: false
      t.datetime :read_at, null: false

      t.timestamps
    end

    add_index :read_statuses, [:article_id, :user_session_id], unique: true
    add_index :read_statuses, :user_session_id
  end
end
