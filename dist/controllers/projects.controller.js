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
import { Project, Client, User } from '../models/index.js';
import mongoose from 'mongoose';
import { serverResponse } from '../util/response.js';
import { apiMessages } from '../config/messages.js';
export const createProject = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res
            .status(422)
            .json({ message: 'Validation failed', errors: errors.array() });
    }
    const newProject = new Project(req.body);
    try {
        const project = yield newProject.save();
        const client = yield Client.findById(req.body.client);
        const userIds = req.body.projectTeam.members.map((memberId) => new mongoose.Types.ObjectId(memberId));
        const users = yield User.find({ _id: { $in: userIds } });
        users.forEach((user) => {
            user.projects.push(project._id);
            user.save();
        });
        if (client) {
            client.projects.push(project._id);
            client.save();
        }
        // @ts-ignore
        serverResponse.sendSuccess(res, apiMessages.SUCCESSFUL, project);
    }
    catch (err) {
        // Check to ensure no response has been sent
        if (!res.headersSent) {
            return next(err);
        }
    }
});
