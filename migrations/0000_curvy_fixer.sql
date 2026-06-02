CREATE TABLE `bookmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`url` varchar(2048) NOT NULL,
	`title` text NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`category_id` int,
	`tags` text,
	`favicon` text,
	`screenshot` text,
	`overview` text,
	`why_startups` text,
	`alternatives` text,
	`pricing_type` text NOT NULL DEFAULT ('Paid'),
	`og_image` text,
	`og_title` text,
	`og_description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`last_visited` timestamp,
	`notes` text,
	`is_archived` boolean NOT NULL DEFAULT false,
	`is_favorite` boolean NOT NULL DEFAULT false,
	`is_dofollow` boolean NOT NULL DEFAULT false,
	`search_results` text,
	`key_features` json,
	`use_cases` json,
	`faqs` json,
	CONSTRAINT `bookmarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`slug` varchar(255) NOT NULL,
	`color` text,
	`icon` text,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` varchar(255) NOT NULL,
	`email` text,
	`name` text,
	`full_name` text,
	`avatar_url` text,
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`url` varchar(2048) NOT NULL,
	`title` text NOT NULL,
	`tagline` text,
	`description` text,
	`category_id` int,
	`user_id` varchar(255),
	`why_startups` text,
	`alternatives` text,
	`pricing_type` text NOT NULL DEFAULT ('Paid'),
	`logo` text,
	`cover` text,
	`submitter_email` text,
	`submitter_name` text,
	`submitter_ip` text,
	`has_badge` boolean NOT NULL DEFAULT false,
	`badge_verified` boolean NOT NULL DEFAULT false,
	`badge_verified_at` timestamp,
	`backlink_verified` boolean NOT NULL DEFAULT false,
	`backlink_verified_at` timestamp,
	`is_dofollow` boolean NOT NULL DEFAULT false,
	`publish_at` timestamp,
	`status` text NOT NULL DEFAULT ('pending'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`key_features` json,
	`use_cases` json,
	`faqs` json,
	CONSTRAINT `submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `bookmarks` ADD CONSTRAINT `bookmarks_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_user_id_profiles_id_fk` FOREIGN KEY (`user_id`) REFERENCES `profiles`(`id`) ON DELETE no action ON UPDATE no action;