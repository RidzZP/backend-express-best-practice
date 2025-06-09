const redisConfig = require("../config/redis");
const logger = require("../utils/logger");

class RedisService {
    constructor() {
        this.client = null;
    }

    // Initialize Redis service
    async initialize() {
        try {
            await redisConfig.connect();
            this.client = redisConfig.getClient();
            logger.info("Redis service initialized successfully");
        } catch (error) {
            logger.error("Failed to initialize Redis service:", error);
            // Continue without Redis if connection fails
        }
    }

    // Check if Redis is available
    isAvailable() {
        return this.client && redisConfig.isRedisConnected();
    }

    // Get cache key with prefix
    getCacheKey(prefix, key) {
        return `${prefix}:${key}`;
    }

    // Set cache with TTL (Time To Live)
    async set(key, value, ttlSeconds = 3600) {
        if (!this.isAvailable()) {
            logger.warn("Redis not available, skipping cache set");
            return false;
        }

        try {
            const serializedValue = JSON.stringify(value);
            await this.client.setEx(key, ttlSeconds, serializedValue);
            logger.debug(`Cache set for key: ${key}, TTL: ${ttlSeconds}s`);
            return true;
        } catch (error) {
            logger.error("Redis set error:", error);
            return false;
        }
    }

    // Get cache
    async get(key) {
        if (!this.isAvailable()) {
            logger.warn("Redis not available, skipping cache get");
            return null;
        }

        try {
            const value = await this.client.get(key);
            if (value) {
                logger.debug(`Cache hit for key: ${key}`);
                return JSON.parse(value);
            }
            logger.debug(`Cache miss for key: ${key}`);
            return null;
        } catch (error) {
            logger.error("Redis get error:", error);
            return null;
        }
    }

    // Delete cache
    async del(key) {
        if (!this.isAvailable()) {
            logger.warn("Redis not available, skipping cache delete");
            return false;
        }

        try {
            const result = await this.client.del(key);
            logger.debug(`Cache deleted for key: ${key}, result: ${result}`);
            return result > 0;
        } catch (error) {
            logger.error("Redis delete error:", error);
            return false;
        }
    }

    // Delete multiple keys by pattern
    async delPattern(pattern) {
        if (!this.isAvailable()) {
            logger.warn("Redis not available, skipping pattern delete");
            return false;
        }

        try {
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(keys);
                logger.debug(`Deleted ${keys.length} keys matching pattern: ${pattern}`);
                return true;
            }
            return false;
        } catch (error) {
            logger.error("Redis pattern delete error:", error);
            return false;
        }
    }

    // Check if key exists
    async exists(key) {
        if (!this.isAvailable()) {
            return false;
        }

        try {
            const result = await this.client.exists(key);
            return result === 1;
        } catch (error) {
            logger.error("Redis exists error:", error);
            return false;
        }
    }

    // Set TTL for existing key
    async expire(key, ttlSeconds) {
        if (!this.isAvailable()) {
            return false;
        }

        try {
            const result = await this.client.expire(key, ttlSeconds);
            return result === 1;
        } catch (error) {
            logger.error("Redis expire error:", error);
            return false;
        }
    }

    // Get TTL for key
    async ttl(key) {
        if (!this.isAvailable()) {
            return -1;
        }

        try {
            return await this.client.ttl(key);
        } catch (error) {
            logger.error("Redis TTL error:", error);
            return -1;
        }
    }

    // Increment value
    async incr(key) {
        if (!this.isAvailable()) {
            return null;
        }

        try {
            return await this.client.incr(key);
        } catch (error) {
            logger.error("Redis incr error:", error);
            return null;
        }
    }

    // Decrement value
    async decr(key) {
        if (!this.isAvailable()) {
            return null;
        }

        try {
            return await this.client.decr(key);
        } catch (error) {
            logger.error("Redis decr error:", error);
            return null;
        }
    }

    // Flush all cache (use with caution)
    async flushAll() {
        if (!this.isAvailable()) {
            return false;
        }

        try {
            await this.client.flushAll();
            logger.warn("Redis cache flushed completely");
            return true;
        } catch (error) {
            logger.error("Redis flush error:", error);
            return false;
        }
    }

    // Get Redis info
    async getInfo() {
        if (!this.isAvailable()) {
            return null;
        }

        try {
            return await this.client.info();
        } catch (error) {
            logger.error("Redis info error:", error);
            return null;
        }
    }
}

// Create singleton instance
const redisService = new RedisService();

module.exports = redisService;
