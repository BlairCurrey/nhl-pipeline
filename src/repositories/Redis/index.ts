import _Redis from 'ioredis';

export class Redis {
  client: _Redis;
  queueName: string

  constructor(queueName: string = 'live_game_ingestion_queue') {
    this.queueName = queueName;
    this.client = new _Redis();
    this.client.on("connect", () => {
      console.info("Connected to Redis server");
    });
    this.client.on("error", (err) => {
      console.error(`Redis error: ${err}`);
    });
  }

  async enqueue(item: string): Promise<void> {
    await this.client.rpush(this.queueName, item);
  }

  async dequeue(): Promise<string | null> {
    return await this.client.lpop(this.queueName);
  }
}