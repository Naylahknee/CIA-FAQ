CREATE TABLE `corrections` (
	`id` text PRIMARY KEY NOT NULL,
	`topic` text NOT NULL,
	`message` text NOT NULL,
	`source_url` text,
	`submitter_email` text,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_corrections_status_created` ON `corrections` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `wall_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`caption` text NOT NULL,
	`student_name` text,
	`submitter_email` text NOT NULL,
	`consent_name` text NOT NULL,
	`image_key` text NOT NULL,
	`image_type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`reviewed_at` integer
);
--> statement-breakpoint
CREATE INDEX `idx_wall_submissions_status_created` ON `wall_submissions` (`status`,`created_at`);