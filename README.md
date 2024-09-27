## Setup

**Note:** For this project, I have provided an `.env.example` file with the database required globals to be able to run the API.

You need to create your Discord Bot first and get bot token key, channel id and provide ALL required information in the .env file (example is uploaded '.env.example')

I am still a bit on process on finishing, so if you will have issues, please contact me.

## Migrations

Before running the API, you need to create a database. You can do this by running the following command:

```bash
npm run migrate:gen
```

## Running the server

In development mode:

```bash
npm run dev
```

In production mode:

```bash
npm run start
```

