// this contains schema
import {varchar, text, pgTable, integer, uuid, timestamp} from 'drizzle-orm/pg-core';

export const usersTable = pgTable("users", {
    id: uuid().primaryKey().defaultRandom(),

    name: varchar('first_name',{length: 55}).notNull(),
    lastname: varchar('last_name',{length: 55}).notNull().unique(),
    
    email: varchar({length: 255}).notNull(),
    password: text().notNull(),
    salt: text().notNull(),
    
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),

}); 

