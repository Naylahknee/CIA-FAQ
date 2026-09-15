ALTER TABLE `community_users` ADD `password_iterations` integer DEFAULT 210000 NOT NULL;
--> statement-breakpoint
CREATE TABLE `auth_rate_limits` (
  `key` text PRIMARY KEY NOT NULL,
  `attempts` integer DEFAULT 0 NOT NULL,
  `window_start` integer NOT NULL
);
