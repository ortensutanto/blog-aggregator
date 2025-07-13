import { pgTable, timestamp, uuid, text, unique } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
    name: text("name").notNull().unique(),
});

export const feeds = pgTable("feeds", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
    name: text("name").notNull().unique(),
    url: text("url").notNull().unique(),
    userId: uuid("userId").references(() => users.id, {onDelete: 'cascade'}).notNull(),
});

export const feed_follows = pgTable("feed_follows", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
    userId: uuid("userId").references(() => users.id, {onDelete: 'cascade'}).notNull(),
    feedId: uuid("feedId").references(() => feeds.id, {onDelete: 'cascade'}).notNull(),
}, (t) => [
        unique("user_feed").on(t.userId, t.feedId),
    ]
);


export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;
export type FeedFollows = typeof feed_follows.$inferSelect;
