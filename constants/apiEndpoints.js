require('dotenv').config();
module.exports = {
    API_ENDPOINTS: {
        BACKEND_PORT: process.env.BACKEND_PORT,
        GET_ASSISTANT_RESPONSE: process.env.GET_ASSISTANT_RESPONSE,
    },
    SUB_API_ENDPOINTS: {
        CHATS: process.env.CHATS,
    }
};