# unsplash-server


### Download

```sh
> git clone https://github.com/proIT324/unsplash-server.git

> cd unsplash-server

> git checkout -b main origin/main

> git pull
```


### Setup PostgreSQL

https://www.postgresql.org/download/

I highly recommend to use pgAdmin v4.0. Once pgAdmin is installed and open, you need to create a DB named "bright_images" using it.



### Configure environment variables

```sh
> touch .env
```

Add the followings to this `.env` file.

```
NODE_ENV=development
VERSION=v1
SERVER_PORT=8080
PG_HOST=localhost
PG_USER=YOUR_DB_USER
PG_DATABASE=bright_images
PG_PASSWORD=YOUR_PASSWORD
PG_PORT=5432
UNSPLASH_ACCESS_KEY=YOUR_UNSPLASH_ACCESS_KEY
```



### Initialize the database

```sh
> npm i

> npm run initdb
```



### Run server

```sh
> npm run dev
```
