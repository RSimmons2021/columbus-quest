class CreateArticles < ActiveRecord::Migration[8.0]
  def change
    create_table :articles do |t|
      t.references :feed, null: false, foreign_key: true
      t.string :title, null: false
      t.text :description
      t.text :content
      t.string :url, null: false
      t.string :image_url
      t.string :author
      t.datetime :published_at
      t.string :guid

      t.timestamps
    end

    add_index :articles, :published_at
    add_index :articles, :guid, unique: true
    add_index :articles, :url

    # PostgreSQL full-text search index
    execute <<-SQL
      CREATE INDEX articles_search_idx ON articles
      USING gin(to_tsvector('english',
        title || ' ' ||
        coalesce(description, '') || ' ' ||
        coalesce(content, '')
      ))
    SQL
  end
end
