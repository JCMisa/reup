import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const Users = pgTable(
  "users",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar("userId").notNull().unique(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    image: text("image"),
    credits: integer().default(2).notNull(),
    role: varchar("role").default("user").notNull(),
    createdAt: timestamp("createdAt")
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: timestamp("updatedAt")
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
    uniqueIndex("users_userId_idx").on(table.userId),
    index("users_role_idx").on(table.role),
  ]
);

export const AnalyzedResumes = pgTable(
  "analyzedResumes",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    analyzedResumeId: varchar("analyzedResumeId").notNull().unique(),
    createdBy: varchar("createdBy")
      .notNull()
      .references(() => Users.userId, { onDelete: "cascade" }),
    resumePath: text("resumePath"),
    imagePath: text("imagePath"),
    companyName: varchar("companyName"),
    jobTitle: varchar("jobTitle"),
    jobDescription: varchar("jobDescription"),
    feedback: jsonb("feedback"),
    createdAt: timestamp("createdAt")
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: timestamp("updatedAt")
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("analyzedResumes_analyzedResumeId_idx").on(
      table.analyzedResumeId
    ),
    index("analyzedResumes_createdBy_idx").on(table.createdBy),
  ]
);
