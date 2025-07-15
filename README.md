# Gator a blog aggregator

### Description
Gator is a simple RSS blog aggregator written in TypeScript. It allows you to add RSS feeds and view them in the CLI.

### Requirements
- Node Version 22.4.0
- postgresql
- npm

### Instructions
1. Clone this repository `git clone ortensutanto/blog-aggregator`
2. Install npm modules `npm install`
3. Create the postgres database called gator
4. Create a config file in your home directory called `.gatorconfig.json`
    - Containing `{"db_url":"<username>://<password>:postgres@localhost:5432/gator?sslmode=disable"}`
    - Fill username and password according to your database settings
5. Run `npx drizzle-kit migrate`
6. To run commands use `npm run start <commands>`

### Commands
- register "username": Registers a user in the database
- login "username": Sets current user in .gatorconfig.json
- reset: Resets all tables in the database
- users: Shows all users in the database, and highlights the current logged in user
- addfeed "feedName" "feedUrl": Adds an RSS feed with a certain name and url, current user is automatically following
- agg "duration": Aggregates all feeds in certain duration (10ms or 10s or 10m or 10h) or any number
- follow "url": Follows a feed that wasn't created by user
- following: Shows all feeds user is currently following
- unfollow "url": Unfollows a feed
- browse "limit": Gets the title description url of a feed, limit is the amount that is shown. It defaults to 2



