const { PrismaClient } = require('@prisma/client');

class PrismaPool {
  constructor(poolSize = 10) {
    this.pool = [];
    this.poolSize = poolSize;
    this.initialize();
  }

  initialize() {
    for (let i = 0; i < this.poolSize; i++) {
      this.pool.push(new PrismaClient());
    }
  }

  async withClient(callback) {
    const client = this.pool[Math.floor(Math.random() * this.pool.length)];
    try {
      return await callback(client);
    } catch (error) {
      throw error;
    }
  }

  async disconnect() {
    await Promise.all(this.pool.map(client => client.$disconnect()));
  }
}

module.exports = new PrismaPool(); 