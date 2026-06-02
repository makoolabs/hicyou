CREATE TABLE `collection_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`collection_id` int NOT NULL,
	`title` text NOT NULL,
	`url` varchar(2048) NOT NULL,
	`description` text,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `collection_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `collections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`slug` varchar(255) NOT NULL,
	`cover_image` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `collections_id` PRIMARY KEY(`id`),
	CONSTRAINT `collections_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `collection_items` ADD CONSTRAINT `collection_items_collection_id_collections_id_fk` FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON DELETE cascade ON UPDATE no action;