import { apiMessages } from '../config/index.js';
import { serverResponse } from '../util/response.js';
export const get404 = (req, res, next) => {
    serverResponse.sendError(res, apiMessages.NOT_FOUND);
};
