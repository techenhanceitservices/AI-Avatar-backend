
const chatService = require('../services/chatService');

async function getChatResponse(req, res){
  const userMessage = req.body;
  try {
    // const userMessage = [messages];
    const response = await chatService.getChatCompletion( userMessage);
    console.log(response);
    res.status(200).json( response );
  } catch (error) {
    res.status(500).json({ error: 'Failed to get response from OpenAI' });
  }
};

module.exports = {
  getChatResponse,
};