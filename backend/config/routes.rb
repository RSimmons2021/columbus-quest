Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      # Authentication
      post '/auth/login', to: 'authentication#login'
      post '/auth/signup', to: 'authentication#signup'

      # Users
      resources :users, only: [:show, :update] do
        member do
          get :profile
          get :leaderboard_position
        end
      end

      # Quests
      resources :quests, only: [:index, :show] do
        member do
          post :check_in
        end
        collection do
          get :nearby
        end
      end

      # Check-ins
      resources :check_ins, only: [:create, :index]

      # Leaderboard
      get '/leaderboard', to: 'leaderboard#index'

      # RSS Articles
      resources :articles, only: [:index, :show] do
        member do
          patch :mark_as_read
        end
      end

      # RSS Feeds
      resources :feeds, only: [:index] do
        member do
          post :refresh
        end

        collection do
          post :refresh_all
        end
      end
    end
  end

  # Admin interface for RSS feeds
  namespace :admin do
    resources :feeds
  end

  # Defines the root path route ("/")
  # root "posts#index"
end
