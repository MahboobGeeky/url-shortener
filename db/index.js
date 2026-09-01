// stablish connection to db 
// this code stablish connection of DB with drizzle-orm

import 'dotenv/config';
import {drizzle} from 'drizzle-orm/node-postgres';

export const db = drizzle(process.env.DATABASE_URL);

export default db;