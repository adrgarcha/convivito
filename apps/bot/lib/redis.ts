import { createClient } from 'redis';
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from './constants';

export const client = createClient({
   username: 'default',
   password: REDIS_PASSWORD,
   socket: {
      host: REDIS_HOST,
      port: Number(REDIS_PORT),
   },
});

client.on('error', err => console.log('Redis Client Error', err));

export const connectRedis = async () => {
   await client.connect();
};
