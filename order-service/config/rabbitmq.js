const amqp = require('amqplib');

class RabbitMQService {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
  }

  async connect() {
    try {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();
      console.log('Connected to RabbitMQ');
      return this.channel;
    } catch (error) {
      console.error('Error connecting to RabbitMQ:', error);
      // Implement retry logic or throw error as needed
      setTimeout(() => this.connect(), 5000);
    }
  }

  async publishMessage(exchange, routingKey, message) {
    try {
      if (!this.channel) await this.connect();
      
      await this.channel.assertExchange(exchange, 'direct', { durable: true });
      
      this.channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );
      
      console.log(`Message sent to exchange ${exchange} with routing key ${routingKey}`);
    } catch (error) {
      console.error('Error publishing message:', error);
      throw error;
    }
  }

  async consumeMessage(exchange, queue, routingKey, callback) {
    try {
      if (!this.channel) await this.connect();
      
      await this.channel.assertExchange(exchange, 'direct', { durable: true });
      const q = await this.channel.assertQueue(queue, { durable: true });
      
      await this.channel.bindQueue(q.queue, exchange, routingKey);
      
      console.log(`Waiting for messages in queue: ${queue}`);
      
      this.channel.consume(
        q.queue,
        (msg) => {
          if (msg) {
            const content = JSON.parse(msg.content.toString());
            callback(content);
            this.channel.ack(msg);
          }
        },
        { noAck: false }
      );
    } catch (error) {
      console.error('Error consuming message:', error);
      throw error;
    }
  }

  async closeConnection() {
    try {
      await this.channel.close();
      await this.connection.close();
      console.log('RabbitMQ connection closed');
    } catch (error) {
      console.error('Error closing RabbitMQ connection:', error);
    }
  }
}

module.exports = new RabbitMQService();
