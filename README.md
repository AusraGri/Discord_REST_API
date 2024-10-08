## Setup

**Note:** For this project, I have provided an `.env.example` file with the required database globals to run the API.

You need to create your Discord Bot first and obtain the bot token, channel ID, and provide **ALL** required information in the `.env` file (see the provided `.env.example`).

#### Included
 - database will be injected with some Sprints and Templates
 - once you set up your discord bot in your discord server, you can get valid usernames by using /users endpoint (check the description of endpoints)

When you successfully start the server, you should see:
```
[INFO]: Images fetched and stored in the database successfully.

[INFO]: Server is running at http://localhost:3001

[INFO]: Discord bot logged in as {discord bot name} in #{your channel name}

[INFO]: status - [READY]
```
If you don't see this, try to restart the server.  


### Discord Bot Creation and Necessary KEYS for API to Work

1. **Create a Discord Account**  
   You must have a Discord account. If you don't, create one.  

3. **Create a Discord Bot**

   - Visit [Discord Developer Portal](https://discord.com/developers/applications) and create a new bot.
   - Follow this [video tutorial](https://youtu.be/Q0JlD7gCZRs?si=7zfC9zj2791Jursq&t=350) from 5:50 to 7:50 to learn how to create the bot.

   Add your bot token to the `.env` file as `DISCORD_BOT_TOKEN`.

   **Important:** Make sure to check the "Required for your bot to receive events listed under GUILD_MEMBERS" option for the bot to work properly.

4. **Get the Channel ID**

   - Your Discord bot should be already in your Discord server.
   - Create a channel (if none exists).
   - Enable Discord Developer Mode:  
     In your Discord App -> User Settings -> App Settings -> Advanced -> Enable Developer Mode.
   - Right-click on the channel and select "Copy Channel ID".

   Add this value to the `.env` file as `CHANNEL_ID`.  

5. **Get Giphy API Key**

   - Visit [Giphy Developers](https://developers.giphy.com/) and create an account if needed.
   - Generate an API key and add it to the `.env` file as `GIPHY_API_KEY`.

6. Once you have provided **DISCORD_BOT_TOKEN**, **CHANNEL_ID**, and **GIPHY_API_KEY** in the `.env` file, you're ready to proceed to the next steps.

**Note**: If you're having trouble obtaining any of the keys or facing issues with the Discord bot setup, feel free to reach out for help!

## Dependencies

Before running the API, you need to install all dependencies:

```bash
npm i
```

## Migrations

Now lets create a database. You can do this by running the following command:

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
## Endpoints

### Messages

- **POST** `/messages`  
  Send a congratulatory message to a user on Discord.
  **Request payload( in JSON format)**:

  ```json
  {
    "username": "johndoe",
    "sprintCode": "Sprint1"
  }
  ```

  **Notes**:

  - `username` should be valid Discord user username.  
  - `sprintCode` should be valid sprintCode from the database.  

  **Response ( in JSON format)**:
  ```json
  {
  "message": "Message to the Discord user: {username} was sent at: {timestamp}"
  }
  ```

- **GET** `/messages`  
  Get a list of all congratulatory messages.

  **Optional Query Parameters**:

  - `username`: Filter messages by username  
    Example: `/messages?username=johdoe`
  - `sprint`: Filter messages by sprint code  
    Example: `/messages?sprint=WD-1.1`
  - `limit`: Limit the number of messages returned  
    Example: `/messages?limit=5`
  
   **Response ( in JSON format)**:
  ```json
  [
  {
    "id": "number",
    "username": "string",
    "sprintCode": "string",
    "sprintId": "number | null",
    "sprintTitle": "string",
    "originalMessage": "string",
    "templateId": "number | null",
    "templateText": "string",
    "gifUrl": "string",
    "createdAt": "timestamp"
  },
  ]
  ```

### Templates

- **POST** `/templates`  
  Create a new congratulatory message template.
  Request payload( in JSON format):

  ```json
  {
    "text": "Congratulations {username} for finishing the {sprint}"
  }
  ```

  **Notes**:

  - {username} and {sprint} are required to be included in the congratulation text.  

- **GET** `/templates`  
  Retrieve all congratulatory message templates.

  **Optional Query Parameters**:

  - `id`: Filter templates by template ID  
    Example: `/templates?id=3`
  - `limit`: Limit the number of templates returned  
    Example: `/templates?limit=1`

  **Notes**:

  - `id` must be a valid template ID number.
  - `limit` must be a valid number to specify how many templates to retrieve.

   **Response (in JSON format)**:
  ```json
  [
  {
    "id": "number",
    "text": "string"
  },
  ]
  ```

- **PATCH** `/templates/:id`  
  Update a specific congratulatory message template.  
   Request payload( in JSON format):

  ```json
  {
    "text" : "Congratulations {username} for finishing the {sprint}"
  }
  ```

  **Response (in JSON format)**:
  ```json
  {
    "id": "number",
    "text": "string"
  }
  ```

- **DELETE** `/templates/:id`  
  Delete a specific congratulatory message template. 

   **Response (in JSON format)**:
  ```json
  {
    "message": "Template deleted successfully"
  }
  ```

### Sprints

- **POST** `/sprints`  
  Create a new sprint.
  Request payload( in JSON format):

  ```json
  {
    "sprintCode": "Sprint1",
    "fullTitle": "Sprint One Full Title"
  }
  ```

- **GET** `/sprints`  
  Retrieve all sprints.

  **Optional Query Parameters**:

  - `id`: Filter sprints by sprint ID  
    Example: `/sprints?id=3`
  - `limit`: Limit the number of sprints returned  
    Example: `/sprints?limit=1`
  - `sprintCode` : Filter sprints by sprint code  
    Example: `/sprints?sprintCode=WD-1.1`

  **Response (in JSON format)**:
  ```json
  [
  {
    "id": "number",
    "sprintCode": "string",
    "fullTitle": "string"
  },
  ]
  ```

- **PATCH** `/sprints/:id`
  Update a specific sprint.
  Request payload( in JSON format):

  ```json
  {
    "sprintCode": "Sprint1",
    "fullTitle": "Sprint One Full Title"
  }
  ```

  **Note**:

  - At least one editable field should be provided (either sprint code or full title or both)  

  **Response (in JSON format)**:
  ```json
  {
    "id": "number",
    "sprintCode": "string",
    "fullTitle": "string"
  }
  ```

- **DELETE** `/sprints/:id`  
  Delete a specific sprint.  

   **Response (in JSON format)**:
  ```json
  {
    "message": "Sprint deleted successfully"
  }
  ```

### Users

- **GET** `/users`
  This endpoint will get all users from the database. Users are saved in the database once discord bot starts. 
  Users are retrieved from discord channel that bot is in.  
  This endpoint is just for checking the users and this can help you to get valid Discord usernames to form a proper congratulation message.

  **Response (in JSON format)**:
  ```json
  [
  {
    "id": "string",
    "username": "string"
  },
  ]
  ```


### Commands

- **Run the tests:**
  ```bash
  npm run test
  ```

- **Get tests coverage report:**
  ```bash
  npm run coverage
  ```

- **Format the code:**
  ```bash
  npm run format
  ```

- **Lint the code:**
  ```bash
  npm run lint
  ```

- **Migrate database to the latest migration:**
  ```bash
  npm run migrate:latest
  ```

- **Generate database types:**
  ```bash
  npm run gen:types
  ```

- **Migrate database to the latest migration and generate database types:**
  ```bash
  npm run migrate:gen
  ```

- **Make a new database migration file:**
  ```bash
  npm run migrate:make 'migration name'
  ```


## Project Structure

```bash
Discord-Bot-API
├── data
│   └── database.db
├── src
│   ├── app.ts
│   ├── index.ts
│   ├── config
│   ├── database
│   │   ├── data
│   │   ├── migrate
│   │   └── migrations
│   ├── middleware
│   ├── modules
│   │   ├── discord
│   │   ├── images
│   │   ├── messages
│   │   ├── sprints
│   │   ├── templates
│   │   └── users
│   └── utils
│       ├── errors
│       └── tests
├── tests
│   ├── index.test.ts
│   └── utils
│       ├── createTestDatabase
│       ├── discord.ts
│       └── records.ts
├── .env
├── package-lock.json
├── package.json
├── tsconfig.eslint.json
├── tsconfig.json
└── vitest.config.js
```


**Peer programming exercise**
[GitHub Repository](https://github.com/AusraGri/server-template-task) 


**Additional note**:  
If you will find a 'cat' - you are lucky!