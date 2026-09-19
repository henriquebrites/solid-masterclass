CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"age" integer NOT NULL,
	"phone_number" varchar(255) NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"password" varchar(255) NOT NULL,
	"preferred_marketing_channel" varchar(255) DEFAULT 'email' NOT NULL
);
