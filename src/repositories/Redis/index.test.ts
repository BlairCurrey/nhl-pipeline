import { Redis } from '.';


describe('Redis', () => {
  const redis = new Redis();
  const testQueueName = 'test_queue';

  afterAll(async () => {
    await redis.client.quit();
  });

  it('Can connect and read/write/delete', async () => {
    const value = "value";
    const key = "testKey";
    await redis.client.set("testKey", value);
    let testKey = await redis.client.get(key);
    expect(testKey).toEqual(value)

    await redis.client.del(key)
    testKey = await redis.client.get(key);
    expect(testKey).toBe(null);
  });

  it('Can enqueue and dequeue', async () => {
    const redis = new Redis(testQueueName);
    const first = 'first';
    const second = 'second';
    
    await redis.enqueue(first);
    await redis.enqueue(second);

    expect(await redis.client.lindex(testQueueName, 0)).toEqual(first)
    expect(await redis.client.llen(testQueueName)).toBe(2);
    expect(await redis.dequeue()).toBe(first);
    expect(await redis.dequeue()).toBe(second);
    expect(await redis.client.llen(testQueueName)).toBe(0);
    await redis.client.quit();
  });
});