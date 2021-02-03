import dotenv from "dotenv";
import express from "express";
import { body, query, validationResult } from "express-validator";
import cors from "cors";
import pgPromise from "pg-promise";
import { createApi } from "unsplash-js";
import "isomorphic-fetch";

dotenv.config();

const PORT = process.env.SERVER_PORT;

const app = express();

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cors());
app.options('*', cors());

const pgConfig = {
  database: process.env.PG_DATABASE || "postgres",
  host: process.env.PG_HOST || "localhost",
  port: parseInt(process.env.PG_PORT || "5432", 10),
  user: process.env.PG_USER || "postgres",
  password: process.env.PG_PASSWORD
};

const pgp = pgPromise();
const db = pgp(pgConfig);

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY,
});

app.get(
  "/",
  (req, res) => {
    res.send("Hello world!");
  });

app.get(
  "/pin",
  async (req, res) => {
    try {
      const pinnedPhotos = await db.any('SELECT * FROM pinned ORDER BY pinned_at DESC');
      res.json({ photos: pinnedPhotos.map(photo => {
        return {
          photoId: photo.photo_id,
          blurHash: photo.blur_hash,
          rawUrl: photo.raw_url,
          smallUrl: photo.small_url,
        };
      }) });
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(error);
      res.json({ error: error.message || error });
    }
  });

app.post(
  "/pin",
  body("photoId").isString(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { photoId } = req.body;
      const result = await unsplash.photos.get({ photoId });
      if (result.type === "success") {
        const photo = result.response;
        await db.none(
          'INSERT INTO pinned(photo_id, blur_hash, raw_url, small_url) VALUES($1, $2, $3, $4) ON CONFLICT(photo_id) DO NOTHING',
          [photo.id, photo.blur_hash, photo.urls.raw, photo.urls.small]
        );
        res.json({ photoId });
      } else {
        res.json({ error: result.errors[0] });
      }
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(error);
      res.json({ error: error.message || error });
    }
  });

app.delete(
  "/pin",
  body("photoId").isString(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { photoId } = req.body;
      await db.none('DELETE from pinned where photo_id = $1', photoId);
      res.json({ photoId });
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(error);
      res.json({ error: error.message || error });
    }
  });

app.get(
  "/search",
  query("query").isString(),
  query("page").isNumeric(),
  query("perPage").isNumeric(),
  async (req: any, res) => {
    try {
      const q = req.query.query;
      const page = parseInt(req.query.page, 10) || 1;
      const perPage = parseInt(req.query.perPage, 10) || 30;

      // invoke Unsplash's search api request
      const result = await unsplash.search.getPhotos({ query: q, page, perPage });

      // destructure the response
      const { total, total_pages: totalPages, results } = result.response;

      const photos = results.map((photo) => {
        return {
          photoId: photo.id,
          blurHash: photo.blur_hash,
          rawUrl: photo.urls.raw,
          smallUrl: photo.urls.small,
        };
      });

      res.json({ total, totalPages, photos });
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(error);
      res.json({ error: error.message || error });
    }
  });

app.listen(
  PORT,
  () => {
    // tslint:disable-next-line:no-console
    console.log(`Server is running at http://localhost:${PORT}`);
  });