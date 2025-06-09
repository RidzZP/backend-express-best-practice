const ExcelJS = require("exceljs");
const { Transform } = require("stream");

/**
 * Reusable Excel Exporter with Streaming Support
 * Supports large datasets by processing data in chunks
 */
class ExcelExporter {
    constructor(options = {}) {
        this.defaultOptions = {
            sheetName: "Sheet1",
            headerStyle: {
                font: { bold: true, color: { argb: "FFFFFF" } },
                fill: { type: "pattern", pattern: "solid", fgColor: { argb: "4472C4" } },
                alignment: { horizontal: "center", vertical: "middle" },
                border: {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                },
            },
            dataStyle: {
                alignment: { horizontal: "left", vertical: "middle" },
                border: {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                },
            },
            columnWidth: 15,
            autoFitColumns: true,
        };
        this.options = { ...this.defaultOptions, ...options };
    }

    /**
     * Export data to Excel file using streaming for large datasets
     * @param {Object} config - Export configuration
     * @param {Array|Function|AsyncGenerator} config.data - Data source (array, function, or async generator)
     * @param {Array} config.columns - Column definitions [{ header: 'Name', key: 'name', width: 20 }]
     * @param {string} config.filename - Output filename
     * @param {Object} config.sheetOptions - Sheet-specific options
     * @param {Function} config.dataTransform - Optional data transformation function
     * @param {number} config.chunkSize - Number of rows to process at once (default: 1000)
     * @returns {Promise<Buffer>} Excel file buffer
     */
    async exportToBuffer(config) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(
            config.sheetOptions?.name || this.options.sheetName
        );

        // Set up columns
        this._setupColumns(worksheet, config.columns);

        // Add data using streaming approach
        await this._addDataToWorksheet(worksheet, config);

        // Auto-fit columns if enabled
        if (this.options.autoFitColumns) {
            this._autoFitColumns(worksheet, config.columns);
        }

        // Generate buffer
        return await workbook.xlsx.writeBuffer();
    }

    /**
     * Export data directly to response stream (for HTTP responses)
     * @param {Object} config - Export configuration
     * @param {Object} res - Express response object
     */
    async exportToResponse(config, res) {
        try {
            // Set response headers
            const filename = config.filename || "export.xlsx";
            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(
                config.sheetOptions?.name || this.options.sheetName
            );

            // Set up columns
            this._setupColumns(worksheet, config.columns);

            // Add data using streaming approach
            await this._addDataToWorksheet(worksheet, config);

            // Auto-fit columns if enabled
            if (this.options.autoFitColumns) {
                this._autoFitColumns(worksheet, config.columns);
            }

            // Stream to response
            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            throw new Error(`Excel export failed: ${error.message}`);
        }
    }

    /**
     * Create a transform stream for processing data chunks
     * @param {Array} columns - Column definitions
     * @param {Function} dataTransform - Optional data transformation function
     * @returns {Transform} Transform stream
     */
    createTransformStream(columns, dataTransform = null) {
        return new Transform({
            objectMode: true,
            transform(chunk, encoding, callback) {
                try {
                    let processedData = chunk;

                    // Apply data transformation if provided
                    if (dataTransform && typeof dataTransform === "function") {
                        processedData = dataTransform(chunk);
                    }

                    // Ensure data matches column structure
                    const row = {};
                    columns.forEach((col) => {
                        row[col.key] = processedData[col.key] || "";
                    });

                    callback(null, row);
                } catch (error) {
                    callback(error);
                }
            },
        });
    }

    /**
     * Set up worksheet columns with styling
     * @param {Object} worksheet - ExcelJS worksheet
     * @param {Array} columns - Column definitions
     */
    _setupColumns(worksheet, columns) {
        worksheet.columns = columns.map((col) => ({
            header: col.header,
            key: col.key,
            width: col.width || this.options.columnWidth,
        }));

        // Style header row
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell) => {
            Object.assign(cell, this.options.headerStyle);
        });
        headerRow.commit();
    }

    /**
     * Add data to worksheet with streaming support
     * @param {Object} worksheet - ExcelJS worksheet
     * @param {Object} config - Export configuration
     */
    async _addDataToWorksheet(worksheet, config) {
        const { data, dataTransform, chunkSize = 1000 } = config;

        if (Array.isArray(data)) {
            // Handle array data
            await this._processArrayData(worksheet, data, dataTransform, chunkSize);
        } else if (typeof data === "function") {
            // Handle function that returns data (could be async)
            const result = await data();
            if (result && Symbol.asyncIterator in result) {
                // Handle async generator
                await this._processAsyncIterator(worksheet, result, dataTransform);
            } else if (Array.isArray(result)) {
                await this._processArrayData(worksheet, result, dataTransform, chunkSize);
            }
        } else if (data && Symbol.asyncIterator in data) {
            // Handle async iterator/generator directly
            await this._processAsyncIterator(worksheet, data, dataTransform);
        }
    }

    /**
     * Process array data in chunks
     * @param {Object} worksheet - ExcelJS worksheet
     * @param {Array} data - Data array
     * @param {Function} dataTransform - Data transformation function
     * @param {number} chunkSize - Chunk size
     */
    async _processArrayData(worksheet, data, dataTransform, chunkSize) {
        for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize);
            const processedChunk = dataTransform
                ? chunk.map((item) => dataTransform(item))
                : chunk;

            processedChunk.forEach((item) => {
                const row = worksheet.addRow(item);
                this._styleDataRow(row);
            });

            // Allow other operations to process (prevent blocking)
            await new Promise((resolve) => setImmediate(resolve));
        }
    }

    /**
     * Process async iterator data
     * @param {Object} worksheet - ExcelJS worksheet
     * @param {AsyncIterator} iterator - Async iterator
     * @param {Function} dataTransform - Data transformation function
     */
    async _processAsyncIterator(worksheet, iterator, dataTransform) {
        for await (const item of iterator) {
            const processedItem = dataTransform ? dataTransform(item) : item;
            const row = worksheet.addRow(processedItem);
            this._styleDataRow(row);
        }
    }

    /**
     * Apply styling to data rows
     * @param {Object} row - ExcelJS row object
     */
    _styleDataRow(row) {
        row.eachCell((cell) => {
            Object.assign(cell, this.options.dataStyle);
        });
        row.commit();
    }

    /**
     * Auto-fit column widths based on content
     * @param {Object} worksheet - ExcelJS worksheet
     * @param {Array} columns - Column definitions
     */
    _autoFitColumns(worksheet, columns) {
        columns.forEach((col, index) => {
            const column = worksheet.getColumn(index + 1);
            let maxLength = col.header ? col.header.length : 10;

            column.eachCell({ includeEmpty: false }, (cell) => {
                if (cell.value && cell.value.toString().length > maxLength) {
                    maxLength = cell.value.toString().length;
                }
            });

            column.width = Math.min(Math.max(maxLength + 2, 10), 50);
        });
    }
}

/**
 * Data source helpers for common scenarios
 */
class DataSourceHelpers {
    /**
     * Create async generator from database query with pagination
     * @param {Function} queryFn - Function that accepts (offset, limit) and returns data
     * @param {number} batchSize - Number of records per batch
     */
    static async *createDatabaseIterator(queryFn, batchSize = 1000) {
        let offset = 0;
        let hasMore = true;

        while (hasMore) {
            const batch = await queryFn(offset, batchSize);

            if (!batch || batch.length === 0) {
                hasMore = false;
                break;
            }

            for (const item of batch) {
                yield item;
            }

            offset += batchSize;
            hasMore = batch.length === batchSize;
        }
    }

    /**
     * Create async generator from Sequelize model with pagination
     * @param {Object} model - Sequelize model
     * @param {Object} options - Query options (where, include, etc.)
     * @param {number} batchSize - Number of records per batch
     */
    static async *createSequelizeIterator(model, options = {}, batchSize = 1000) {
        let offset = 0;
        let hasMore = true;

        while (hasMore) {
            const batch = await model.findAll({
                ...options,
                offset,
                limit: batchSize,
                raw: true, // For better performance
            });

            if (!batch || batch.length === 0) {
                hasMore = false;
                break;
            }

            for (const item of batch) {
                yield item;
            }

            offset += batchSize;
            hasMore = batch.length === batchSize;
        }
    }
}

module.exports = {
    ExcelExporter,
    DataSourceHelpers,
};
