CREATE TABLE "invite_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"expires_at" timestamp,
	"used" boolean DEFAULT false NOT NULL,
	"used_by" varchar,
	"first_used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invite_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "free_granted" boolean;
--> statement-breakpoint
UPDATE "users" SET "free_granted" = false WHERE "free_granted" IS NULL;
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "free_granted" SET NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX "invite_codes_code_idx" ON "invite_codes" USING btree ("code");
--> statement-breakpoint
CREATE INDEX "invite_codes_used_idx" ON "invite_codes" USING btree ("used");
--> statement-breakpoint
CREATE INDEX "invite_codes_used_by_idx" ON "invite_codes" USING btree ("used_by");