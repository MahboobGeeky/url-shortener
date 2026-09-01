// this contains schema
import {varchar, text, pgTable, integer, uuid} from 'drizzle-orm/pg-core';

export const usersTable = pgTable("users", {
    // id: uuid().primaryKey(),
    // name: varchar({length: 255}).notNull(),
    // email: varchar({length: 255}).notNull().unique(),
    // password: text().notNull()
}); 