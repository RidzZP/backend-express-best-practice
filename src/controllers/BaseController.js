const { asyncHandler } = require("../middlewares/errorHandler");

class BaseController {
    constructor(service) {
        this.service = service;
    }

    getAll = asyncHandler(async (req, res) => {
        const { page = 1, limit = 10, ...filters } = req.query;

        const options = {
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            where: filters,
        };

        const records = await this.service.findAll(options);

        res.status(200).json({
            status: "success",
            data: records,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
            },
        });
    });

    getById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const record = await this.service.findByPk(id);

        res.status(200).json({
            status: "success",
            data: record,
        });
    });

    create = asyncHandler(async (req, res) => {
        const record = await this.service.create(req.body);

        res.status(201).json({
            status: "success",
            message: "Record created successfully",
            data: record,
        });
    });

    update = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const record = await this.service.update(id, req.body);

        res.status(200).json({
            status: "success",
            message: "Record updated successfully",
            data: record,
        });
    });

    delete = asyncHandler(async (req, res) => {
        const { id } = req.params;
        await this.service.delete(id);

        res.status(200).json({
            status: "success",
            message: "Record deleted successfully",
        });
    });
}

module.exports = BaseController;
