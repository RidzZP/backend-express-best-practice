const redisService = require("../services/RedisService");
const logger = require("../utils/logger");

/**
 * Cache middleware factory
 * @param {Object} options - Cache configuration options
 * @param {string} options.prefix - Cache key prefix (e.g., 'products', 'users')
 * @param {number} options.ttl - Time to live in seconds (default: 3600 = 1 hour)
 * @param {Function} options.keyGenerator - Custom key generator function
 * @param {boolean} options.skipCache - Skip cache for this request
 * @returns {Function} Express middleware function
 */
function cacheMiddleware(options = {}) {
    const {
        prefix = "api",
        ttl = 3600, // 1 hour default
        keyGenerator = null,
        skipCache = false,
    } = options;

    return async (req, res, next) => {
        // Skip cache if specified or if method is not GET
        if (skipCache || req.method !== "GET") {
            return next();
        }

        try {
            // Generate cache key
            let cacheKey;
            if (keyGenerator && typeof keyGenerator === "function") {
                cacheKey = keyGenerator(req);
            } else {
                // Default key generation: prefix:route:query
                const route = req.route ? req.route.path : req.path;
                const queryString = JSON.stringify(req.query);
                const params = JSON.stringify(req.params);
                cacheKey = redisService.getCacheKey(
                    prefix,
                    `${route}:${params}:${queryString}`
                );
            }

            // Try to get from cache
            const cachedData = await redisService.get(cacheKey);

            if (cachedData) {
                logger.info(`Cache hit for key: ${cacheKey}`);
                return res.json({
                    ...cachedData,
                    cached: true,
                    cacheTimestamp: new Date().toISOString(),
                });
            }

            // Cache miss - continue to actual route handler
            logger.debug(`Cache miss for key: ${cacheKey}`);

            // Override res.json to cache the response
            const originalJson = res.json;
            res.json = function (data) {
                // Only cache successful responses
                if (res.statusCode === 200 && data) {
                    redisService.set(cacheKey, data, ttl).catch((error) => {
                        logger.error("Failed to cache response:", error);
                    });
                }

                // Call original json method
                return originalJson.call(this, data);
            };

            next();
        } catch (error) {
            logger.error("Cache middleware error:", error);
            // Continue without cache if there's an error
            next();
        }
    };
}

/**
 * Cache invalidation middleware
 * Invalidates cache patterns after successful write operations
 * @param {Object} options - Invalidation options
 * @param {string|string[]} options.patterns - Cache key patterns to invalidate
 * @param {string[]} options.methods - HTTP methods that trigger invalidation (default: ['POST', 'PUT', 'PATCH', 'DELETE'])
 * @returns {Function} Express middleware function
 */
function cacheInvalidationMiddleware(options = {}) {
    const { patterns = [], methods = ["POST", "PUT", "PATCH", "DELETE"] } = options;

    return async (req, res, next) => {
        // Only invalidate on specified methods
        if (!methods.includes(req.method)) {
            return next();
        }

        // Override res.json to invalidate cache after successful response
        const originalJson = res.json;
        res.json = function (data) {
            // Only invalidate cache on successful operations
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const patternsArray = Array.isArray(patterns) ? patterns : [patterns];

                patternsArray.forEach((pattern) => {
                    redisService.delPattern(pattern).catch((error) => {
                        logger.error(
                            `Failed to invalidate cache pattern ${pattern}:`,
                            error
                        );
                    });
                });

                logger.info(
                    `Cache invalidated for patterns: ${patternsArray.join(", ")}`
                );
            }

            // Call original json method
            return originalJson.call(this, data);
        };

        next();
    };
}

/**
 * Specific cache middleware for products
 * @param {number} ttl - Time to live in seconds (default: 1800 = 30 minutes)
 * @returns {Function} Express middleware function
 */
function productCacheMiddleware(ttl = 1800) {
    return cacheMiddleware({
        prefix: "products",
        ttl,
        keyGenerator: (req) => {
            const route = req.route ? req.route.path : req.path;
            const queryString =
                Object.keys(req.query).length > 0
                    ? JSON.stringify(req.query)
                    : "no-query";
            const params =
                Object.keys(req.params).length > 0
                    ? JSON.stringify(req.params)
                    : "no-params";

            return redisService.getCacheKey(
                "products",
                `${route}:${params}:${queryString}`
            );
        },
    });
}

/**
 * Product cache invalidation middleware
 * Invalidates all product-related cache when products are modified
 */
function productCacheInvalidation() {
    return cacheInvalidationMiddleware({
        patterns: ["products:*"],
        methods: ["POST", "PUT", "PATCH", "DELETE"],
    });
}

module.exports = {
    cacheMiddleware,
    cacheInvalidationMiddleware,
    productCacheMiddleware,
    productCacheInvalidation,
};
