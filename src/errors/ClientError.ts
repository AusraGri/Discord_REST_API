import { StatusCodes } from 'http-status-codes';

export default class ClientError extends Error {
    public status: number;
  
    constructor(message: string, status: number = StatusCodes.BAD_REQUEST) {
      super(message);
      this.status = status;
      this.name = 'ClientError';
    }
  }