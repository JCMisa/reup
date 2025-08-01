import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const inviteCodes = pgTable(
  "invite_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    expiresAt: timestamp("expires_at"),
    used: boolean("used").default(false).notNull(),
    usedBy: varchar("used_by"),
    firstUsedAt: timestamp("first_used_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("invite_codes_code_idx").on(table.code),
    index("invite_codes_used_idx").on(table.used),
    index("invite_codes_used_by_idx").on(table.usedBy),
  ]
);

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
    freeGranted: boolean("free_granted")
      .$defaultFn(() => false)
      .notNull(),
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
