const redis = require("redis");
const logger = require("../utils/logger");

class RedisConfig {
    constructor() {
        this.client = null;
        this.isConnected = false;
    }

    // Initialize Redis connection
    async connect() {
        try {
            // Redis configuration with your WSL IP
            const redisConfig = {
                socket: {
                    host: "172.17.78.119",
                    port: 6379,
                    connectTimeout: 60000,
                    lazyConnect: true,
                },
                // Optional: Add password if your Redis has authentication
                // password: process.env.REDIS_PASSWORD,
            };

            this.client = redis.createClient(redisConfig);

            // Event listeners
            this.client.on("connect", () => {
                logger.info("Redis client connecting...");
            });

            this.client.on("ready", () => {
                logger.info("Redis client ready and connected successfully!");
                this.isConnected = true;
            });

            this.client.on("error", (err) => {
                logger.error("Redis client error:", err);
                this.isConnected = false;
            });

            this.client.on("end", () => {
                logger.warn("Redis client disconnected");
                this.isConnected = false;
            });

            // Connect to Redis
            await this.client.connect();

            return this.client;
        } catch (error) {
            logger.error("Failed to connect to Redis:", error);
            this.isConnected = false;
            throw error;
        }
    }

    // Get Redis client instance
    getClient() {
        if (!this.client || !this.isConnected) {
            throw new Error("Redis client not connected. Call connect() first.");
        }
        return this.client;
    }

    // Close Redis connection
    async disconnect() {
        if (this.client) {
            await this.client.quit();
            this.isConnected = false;
            logger.info("Redis client disconnected successfully");
        }
    }

    // Check if Redis is connected
    isRedisConnected() {
        return this.isConnected;
    }
}

// Create singleton instance
const redisConfig = new RedisConfig();

module.exports = redisConfig;
