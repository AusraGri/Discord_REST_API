import supertest from 'supertest';
import controller from '../controller';
import { Database } from '@/database'; // Adjust import as necessary
import supertest from 'supertest'
import createTestDatabase from '@tests/utils/createTestDatabase'
import { createFor } from '@tests/utils/records'
import cleanDatabase from '@tests/utils/createTestDatabase/cleanDatabase'
import createApp from '@/app'
import * as fixtures from './fixtures'
import MockDiscordBotService from '@tests/utils/discord'

const db = await createTestDatabase()
const app = createApp(db)
const mockDiscordBotService = new MockDiscordBotService();

app.use(express.json()); // Middleware to parse JSON
app.use('/messages', controller(db, mockDiscordBotService)); // Attach the controller

describe('POST /messages', () => {
  beforeEach(() => {
    // Reset mock calls before each test
    mockDiscordBotService.sendMessage.mockClear();
  });

  it('should send a congratulatory message and respond with 200', async () => {
    const messagePayload = { username: 'Bob', sprintCode: 'WD-1.1' }; // Your expected payload

    const response = await supertest(app)
      .post('/messages')
      .send(messagePayload); // Send the payload as request body

    expect(response.status).toBe(200); // Check if response status is 200
    expect(mockDiscordBotService.sendMessage).toHaveBeenCalledWith(
      expect.any(String), // Expecting a string message; adjust if you know the exact format
    );
  });
});
