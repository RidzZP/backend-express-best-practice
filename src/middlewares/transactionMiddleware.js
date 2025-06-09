const { sequelize } = require("../config/database");
const logger = require("../utils/logger");

/**
 * Transaction middleware for secure data operations
 * Provides database transaction support with automatic rollback on errors
 */
const withTransaction = (asyncFunction) => {
    return async (req, res, next) => {
        // Skip if transaction already exists (from transactionManager)
        if (req.transaction) {
            try {
                return await asyncFunction(req, res, next);
            } catch (error) {
                // Ensure error is properly handled by Express error handler
                return next(error);
            }
        }

        const transaction = await sequelize.transaction();

        try {
            // Add transaction to request object for use in controllers/services
            req.transaction = transaction;

            // Execute the wrapped function
            await asyncFunction(req, res, next);

            // If we get here without throwing, commit the transaction
            if (!transaction.finished) {
                await transaction.commit();
                logger.info("Transaction committed successfully");
            }
        } catch (error) {
            // Rollback transaction on any error
            try {
                if (!transaction.finished) {
                    await transaction.rollback();
                    logger.error("Transaction rolled back due to error:", error.message);
                }
            } catch (rollbackError) {
                logger.error("Error during transaction rollback:", rollbackError);
            }

            // Ensure error is properly handled by Express error handler
            // This prevents unhandled promise rejections
            return next(error);
        }
    };
};

/**
 * Middleware to start a managed transaction
 * Automatically handles commit/rollback based on response status
 */
const transactionManager = async (req, res, next) => {
    // Skip transaction for GET requests (read-only operations)
    if (req.method === "GET") {
        return next();
    }

    const transaction = await sequelize.transaction();
    req.transaction = transaction;

    // Store original res.json and res.status methods
    const originalJson = res.json;
    const originalStatus = res.status;
    const originalSend = res.send;
    let statusCode = 200;
    let transactionHandled = false;

    // Override res.status to capture status code
    res.status = function (code) {
        statusCode = code;
        return originalStatus.call(this, code);
    };

    // Helper function to handle transaction
    const handleTransaction = async () => {
        if (transactionHandled || transaction.finished) {
            return;
        }

        transactionHandled = true;

        try {
            if (statusCode >= 200 && statusCode < 300) {
                // Success status - commit transaction
                await transaction.commit();
                logger.info(
                    `Transaction committed for ${req.method} ${req.path} with status ${statusCode}`
                );
            } else {
                // Error status - rollback transaction
                await transaction.rollback();
                logger.warn(
                    `Transaction rolled back for ${req.method} ${req.path} with status ${statusCode}`
                );
            }
        } catch (transactionError) {
            logger.error("Error handling transaction:", transactionError);
            if (!transaction.finished) {
                try {
                    await transaction.rollback();
                } catch (rollbackError) {
                    logger.error("Error during rollback:", rollbackError);
                }
            }
        }
    };

    // Override res.json to handle transaction commit/rollback
    res.json = async function (data) {
        await handleTransaction();
        return originalJson.call(this, data);
    };

    // Handle cases where response is sent without res.json
    res.send = async function (data) {
        await handleTransaction();
        return originalSend.call(this, data);
    };

    // Handle cleanup on response finish (fallback)
    res.on("finish", async () => {
        await handleTransaction();
    });

    // Handle errors that might occur before response
    res.on("close", async () => {
        if (!transactionHandled && !transaction.finished) {
            try {
                await transaction.rollback();
                logger.info("Transaction rolled back on connection close");
            } catch (error) {
                logger.error("Error rolling back transaction on close:", error);
            }
        }
    });

    next();
};

/**
 * Utility function to execute operations within a transaction
 */
const executeInTransaction = async (operation, transaction = null) => {
    // If transaction is provided, use it (from middleware)
    if (transaction) {
        return await operation(transaction);
    }

    // Otherwise create a new transaction
    const t = await sequelize.transaction();

    try {
        const result = await operation(t);
        await t.commit();
        logger.info("Transaction executed and committed successfully");
        return result;
    } catch (error) {
        if (!t.finished) {
            await t.rollback();
            logger.error("Transaction rolled back due to error:", error.message);
        }
        throw error;
    }
};

module.exports = {
    withTransaction,
    transactionManager,
    executeInTransaction,
};
