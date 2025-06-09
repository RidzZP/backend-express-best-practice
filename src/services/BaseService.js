const { AppError } = require("../middlewares/errorHandler");
const logger = require("../utils/logger");

class BaseService {
    constructor(model) {
        this.model = model;
    }

    async create(data, options = {}) {
        try {
            logger.info(`Creating new ${this.model.name} record`);
            const record = await this.model.create(data, options);
            logger.info(`${this.model.name} record created with ID: ${record.id}`);
            return record;
        } catch (error) {
            logger.error(`Error creating ${this.model.name} record:`, error);
            throw new AppError(`Failed to create ${this.model.name.toLowerCase()}`, 500);
        }
    }

    async findAll(options = {}) {
        try {
            logger.info(`Finding all ${this.model.name} records`);
            const records = await this.model.findAll(options);
            logger.info(`Found ${records.length} ${this.model.name} records`);
            return records;
        } catch (error) {
            logger.error(`Error finding ${this.model.name} records:`, error);
            throw new AppError(
                `Failed to retrieve ${this.model.name.toLowerCase()} records`,
                500
            );
        }
    }

    async findByPk(id, options = {}) {
        try {
            logger.info(`Finding ${this.model.name} record with ID: ${id}`);
            const record = await this.model.findByPk(id, options);

            if (!record) {
                throw new AppError(`${this.model.name} not found`, 404);
            }

            logger.info(`${this.model.name} record found with ID: ${id}`);
            return record;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error(`Error finding ${this.model.name} record:`, error);
            throw new AppError(
                `Failed to retrieve ${this.model.name.toLowerCase()}`,
                500
            );
        }
    }

    async update(id, data, options = {}) {
        try {
            logger.info(`Updating ${this.model.name} record with ID: ${id}`);

            const record = await this.findByPk(id);
            const updatedRecord = await record.update(data, options);

            logger.info(`${this.model.name} record updated with ID: ${id}`);
            return updatedRecord;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error(`Error updating ${this.model.name} record:`, error);
            throw new AppError(`Failed to update ${this.model.name.toLowerCase()}`, 500);
        }
    }

    async delete(id, options = {}) {
        try {
            logger.info(`Deleting ${this.model.name} record with ID: ${id}`);

            const record = await this.findByPk(id);
            await record.destroy(options);

            logger.info(`${this.model.name} record deleted with ID: ${id}`);
            return { message: `${this.model.name} deleted successfully` };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error(`Error deleting ${this.model.name} record:`, error);
            throw new AppError(`Failed to delete ${this.model.name.toLowerCase()}`, 500);
        }
    }

    // Count records
    async count(options = {}) {
        try {
            logger.info(`Counting ${this.model.name} records`);
            const count = await this.model.count(options);
            logger.info(`${this.model.name} count: ${count}`);
            return count;
        } catch (error) {
            logger.error(`Error counting ${this.model.name} records:`, error);
            throw new AppError(
                `Failed to count ${this.model.name.toLowerCase()} records`,
                500
            );
        }
    }

    // Bulk create
    async bulkCreate(dataArray, options = {}) {
        try {
            logger.info(`Bulk creating ${dataArray.length} ${this.model.name} records`);
            const records = await this.model.bulkCreate(dataArray, options);
            logger.info(`${records.length} ${this.model.name} records created`);
            return records;
        } catch (error) {
            logger.error(`Error bulk creating ${this.model.name} records:`, error);
            throw new AppError(
                `Failed to create ${this.model.name.toLowerCase()} records`,
                500
            );
        }
    }
}

module.exports = BaseService;
