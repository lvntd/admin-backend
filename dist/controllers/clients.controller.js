var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { validationResult } from 'express-validator';
import { Client } from '../models/index.js';
import io from '../socket.js';
import { serverResponse } from '../util/response.js';
import { apiMessages } from '../config/messages.js';
export const addClient = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res
            .status(422)
            .json({ message: 'Validation failed', errors: errors.array() });
    }
    const { name, taxId, legalForm, active, imageUrl } = req.body;
    try {
        const existingClient = yield Client.findOne({ taxId });
        if (existingClient) {
            return serverResponse.sendError(res, apiMessages.ALREADY_EXIST);
        }
        const newClient = new Client({
            name,
            taxId,
            legalForm,
            active,
            imageUrl,
        });
        const client = yield newClient.save();
        if (client) {
            io.getIO().emit('invalidate', { qk: ['clients'] });
            // @ts-ignore
            return serverResponse.sendSuccess(res, apiMessages.SUCCESSFUL, client);
        }
    }
    catch (err) {
        if (!res.headersSent) {
            return next(err);
        }
    }
});
export const editClient = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
    }
    const { clientId } = req.params;
    try {
        const updatedClient = yield Client.findByIdAndUpdate(clientId, Object.assign({}, req.body), { new: true });
        return res
            .status(200)
            .json({ message: 'Client was updated', data: updatedClient });
    }
    catch (err) {
        return next(err);
    }
});
export const getClients = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
    }
    const page = Number(req.query.page);
    const perPage = Number(req.query.perPage) || 5;
    const skip = (page - 1) * perPage;
    let totalItems = 0;
    // Search params
    const active = req.query.active;
    const query = {};
    if (active) {
        query.active = active;
    }
    try {
        const totalItems = yield Client.find(query).countDocuments();
        const clients = yield Client.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(perPage);
        return res.status(200).json({
            message: 'Success',
            data: clients,
            total: totalItems,
            hasNextPage: perPage * page < totalItems,
            hasPreviousPage: page > 1,
            currentPage: page || 1,
            nextPage: page + 1,
            prevPage: page - 1,
            lastPage: Math.ceil(totalItems / perPage),
            perPage: perPage,
        });
    }
    catch (err) {
        return next(err);
    }
});
export const getClient = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
    }
    const clientId = req.params.clientId;
    try {
        const client = Client.findById(clientId);
        return res.status(200).json({ data: client });
    }
    catch (err) {
        return next(err);
    }
});
export const deleteClient = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
    }
    const clientId = req.params.clientId;
    try {
        yield Client.deleteOne({ _id: clientId });
        io.getIO().emit('invalidate', { qk: ['clients'] });
        res.status(200).json({ message: 'Successfully deleted' });
    }
    catch (err) {
        return next(err);
    }
});
