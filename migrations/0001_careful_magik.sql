CREATE TABLE "analyzedResumes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "analyzedResumes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"analyzedResumeId" varchar NOT NULL,
	"createdBy" varchar NOT NULL,
	"resumePath" text,
	"imagePath" text,
	"companyName" varchar,
	"jobTitle" varchar,
	"jobDescription" varchar,
	"feedback" jsonb,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "analyzedResumes_analyzedResumeId_unique" UNIQUE("analyzedResumeId")
);
--> statement-breakpoint
ALTER TABLE "analyzedResumes" ADD CONSTRAINT "analyzedResumes_createdBy_users_userId_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "analyzedResumes_analyzedResumeId_idx" ON "analyzedResumes" USING btree ("analyzedResumeId");--> statement-breakpoint
CREATE INDEX "analyzedResumes_createdBy_idx" ON "analyzedResumes" USING btree ("createdBy");