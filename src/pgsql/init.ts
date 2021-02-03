import dotenv from "dotenv";
import { Client } from "pg";
import fs from "fs-extra";

const init = async () => {
  dotenv.config();

  const client = new Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: parseInt(process.env.PG_PORT, 10),
  });

  try {
    await client.connect();

    const sql = await fs.readFile("./src/pgsql/db.sql", { encoding: "UTF-8" });

    const statements = sql.split(/;\s*$/m);

    for (const statement of statements) {
      if (statement.length > 3) {
        await client.query(statement);
      }
    }
  } catch (error) {
    throw error;
  } finally {
    await client.end();
  }
};

init().then(() => {
  // tslint:disable-next-line:no-console
  console.log('finished');
}).catch(() => {
  // tslint:disable-next-line:no-console
  console.log('finished with errors');
});