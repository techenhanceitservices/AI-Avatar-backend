// app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const chatRoute = require('./routes/chatRoute');
const {API_ENDPOINTS} = require('./constants/apiEndpoints');

const app = express();
app.use(cors());

app.use(bodyParser.json());

app.use(API_ENDPOINTS.GET_ASSISTANT_RESPONSE, chatRoute );

module.exports = app;
