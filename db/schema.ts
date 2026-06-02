import { mysqlTable, int, varchar, text, timestamp, boolean, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// Profiles table (extends Supabase Auth)
export const profiles = mysqlTable("profiles", {
  id: varchar("id", { length: 255 }).primaryKey(), // References auth.users.id
  email: text("email"),
  name: text("name"), // User's display name
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories table
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  color: text("color"), // For UI customization
  icon: text("icon"), // For UI customization
  parentId: int("parent_id").references((): any => categories.id), // Self-referencing for subcategories
  defaultExpanded: boolean("default_expanded").notNull().default(false), // Auto-expand children on frontend
  sortOrder: int("sort_order").notNull().default(0), // For ordering categories
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

// Bookmarks table
export const bookmarks = mysqlTable("bookmarks", {
  // Core fields
  id: int("id").autoincrement().primaryKey(),
  url: varchar("url", { length: 2048 }).notNull(),
  title: text("title").notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"), // Tagline

  // Organization
  categoryId: int("category_id").references(() => categories.id),
  tags: text("tags"), // Comma-separated tags

  // Metadata
  favicon: text("favicon"), // Logo Image URL
  screenshot: text("screenshot"), // URL to a screenshot
  overview: text("overview"), // Description
  whyStartups: text("why_startups"), // Why do startups need this tool?
  alternatives: text("alternatives"), // Comma-separated list of alternative tools
  pricingType: text("pricing_type").notNull().default("Paid"), // Pricing

  // SEO and sharing
  ogImage: text("og_image"), // Cover Image URL
  ogTitle: text("og_title"), // Open Graph title
  ogDescription: text("og_description"), // Open Graph description

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastVisited: timestamp("last_visited"),

  // User data
  notes: text("notes"), // Personal notes
  isArchived: boolean("is_archived").notNull().default(false),
  isFavorite: boolean("is_favorite").notNull().default(false),
  isRecommended: boolean("is_recommended").notNull().default(false),
  isDofollow: boolean("is_dofollow").notNull().default(false),
  search_results: text("search_results"),
  source: varchar("source", { length: 50 }), // "github", "hackernews", "manual", "other"
  sourceId: varchar("source_id", { length: 255 }), // External ID from discovery source

  // AI Generated Content
  keyFeatures: json("key_features"), // Array of strings or objects
  useCases: json("use_cases"), // Array of strings
  faqs: json("faqs"), // Array of { question: string, answer: string }
});

// Submissions table
export const submissions = mysqlTable("submissions", {
  id: int("id").autoincrement().primaryKey(),
  url: varchar("url", { length: 2048 }).notNull(),
  title: text("title").notNull(),
  tagline: text("tagline"),
  description: text("description"),
  categoryId: int("category_id").references(() => categories.id),

  // User association
  userId: varchar("user_id", { length: 255 }).references(() => profiles.id),

  // Additional content
  whyStartups: text("why_startups"),
  alternatives: text("alternatives"),
  pricingType: text("pricing_type").notNull().default("Paid"),

  // Images
  logo: text("logo"),
  cover: text("cover"),

  // Submitter information
  submitterEmail: text("submitter_email"),
  submitterName: text("submitter_name"),
  submitterIp: text("submitter_ip"),

  // Badge verification
  hasBadge: boolean("has_badge").notNull().default(false),
  badgeVerified: boolean("badge_verified").notNull().default(false),
  badgeVerifiedAt: timestamp("badge_verified_at"),

  // Backlink verification
  backlinkVerified: boolean("backlink_verified").notNull().default(false),
  backlinkVerifiedAt: timestamp("backlink_verified_at"),

  // Dofollow status
  isDofollow: boolean("is_dofollow").notNull().default(false),

  // Auto-publish timing
  publishAt: timestamp("publish_at"),

  // Status
  status: text("status").notNull().default("pending"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  // AI Generated Content
  keyFeatures: json("key_features"),
  useCases: json("use_cases"),
  faqs: json("faqs"),
});

// Friendly Links table
export const friendlyLinks = mysqlTable("friendly_links", {
  id: int("id").autoincrement().primaryKey(),
  title: text("title").notNull(),
  url: varchar("url", { length: 2048 }).notNull(),
  description: text("description"),
  sortOrder: int("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Backlink Resources table (SEO backlink database)
export const backlinkResources = mysqlTable("backlink_resources", {
  id: int("id").autoincrement().primaryKey(),
  name: text("name").notNull(),
  url: varchar("url", { length: 2048 }).notNull(),
  drScore: int("dr_score").notNull().default(0),
  linkType: varchar("link_type", { length: 20 }).notNull().default("dofollow"), // dofollow / nofollow
  category: varchar("category", { length: 100 }).notNull().default("General"), // General, GameDev, AI, Directory, etc.
  cost: varchar("cost", { length: 20 }).notNull().default("Free"), // Free / Paid
  description: text("description"),
  sortOrder: int("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  category: one(categories, {
    fields: [bookmarks.categoryId],
    references: [categories.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  bookmarks: many(bookmarks),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
  category: one(categories, {
    fields: [submissions.categoryId],
    references: [categories.id],
  }),
}));

// Type definitions
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;

export type FriendlyLink = typeof friendlyLinks.$inferSelect;
export type NewFriendlyLink = typeof friendlyLinks.$inferInsert;

export type BacklinkResource = typeof backlinkResources.$inferSelect;
export type NewBacklinkResource = typeof backlinkResources.$inferInsert;

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

// Collections table (curated topic groups)
export const collections = mysqlTable("collections", {
  id: int("id").autoincrement().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  coverImage: text("cover_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Collection items (links within a collection)
export const collectionItems = mysqlTable("collection_items", {
  id: int("id").autoincrement().primaryKey(),
  collectionId: int("collection_id").references(() => collections.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  url: varchar("url", { length: 2048 }).notNull(),
  description: text("description"),
  sortOrder: int("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type definitions for collections
export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;
export type CollectionItem = typeof collectionItems.$inferSelect;
export type NewCollectionItem = typeof collectionItems.$inferInsert;
