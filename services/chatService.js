const { AZURE_OPENAI_CONFIG } = require('../constants/apiKeys')
const { AzureOpenAI } = require('openai');
const { systemPrompt } = require('../utils/constants');
const { aadharVerification, OTPVerification } = require('../utils/functionCalling/customFunctions');


async function getChatCompletion( userMessage) {
  try {
    const client = new AzureOpenAI({
      apiKey: AZURE_OPENAI_CONFIG.PARAMS_AZURE_OPENAI_API_KEY, 
      deployment: AZURE_OPENAI_CONFIG.PARAMS_AZURE_OPENAI_DEPLOYMENT_NAME,
      apiVersion: AZURE_OPENAI_CONFIG.PARAMS_AZURE_OPENAI_DEPLOYMENT_VERSION,
      endpoint: AZURE_OPENAI_CONFIG.PARAMS_AZURE_OPENAI_ENDPOINT
    });
    
    
    let completionsInput = [ systemPrompt ]
    chatHistory = userMessage.messages;
    chatHistory.forEach((chat) => {
      completionsInput.push({
          role: chat.role,
          content: chat.content
      })});
    
     // Step 1: send the conversation and available functions to the model
    console.log('------------STEP1');
    const response = await client.chat.completions.create({
      messages:  completionsInput,
      model: AZURE_OPENAI_CONFIG.PARAMS_AZURE_OPENAI_DEPLOYMENT_NAME,
      tools:[
          {
            type: "function",
            function: {
              name: "aadharVerification",
              description: "Generate OTP for Aadhar Number",
              parameters: {
                type: "object",
                properties: {
                  aadharNumber: {
                    type: "string",
                    description: "Generate OTP for Aadhar Number"
                  }
                },
                required: ["aadharNumber"]
              }
            },
          },
          {
            type: "function",
            function: {
              name: "OTPVerification",
              description: "Verify OTP for Aadhar Number",
              parameters: {
                type: "object",
                properties: {
                  otp: {
                    type: "string",
                    description: "Verify OTP for Aadhar Number"
                  }
                },
                required: ["otp"]
              }
            },
          }
        ],
        tool_choice: "auto"
    });
    const responseMessage = response.choices[0].message.content;
    console.log('------------responseMessage',responseMessage);
    // Step 2: check if the model wanted to call a function 
    console.log('------------STEP2');
    const toolCalls = response.choices[0].message.tool_calls;
    console.log('------------toolCalls',toolCalls);
    let secondResponse;
    if (response.choices[0].message.tool_calls) {
    // Step 3: call the function
    console.log('------------STEP3');
    // Note: the JSON response may not always be valid; be sure to handle errors
      const availableFunctions = {
        aadharVerification: aadharVerification,
        OTPVerification: OTPVerification
      }; 
      let functionResponse;
      let functionName;
      let functionArgs;
      for (const toolCall of toolCalls) {
        functionName = toolCall.function.name;
        const functionToCall = availableFunctions[functionName];
        functionArgs = JSON.parse(toolCall.function.arguments);
        if (functionName === 'aadharVerification') {
          functionResponse = await functionToCall(
            functionArgs.aadharNumber,
          );
        }
        if (functionName === 'OTPVerification') {
          functionResponse = await functionToCall(
            userMessage.aadharNumber,
            functionArgs.otp,
          );
        }
      }
      console.log('------------functionName',functionName);
      console.log('------------functionResponse',functionResponse);
      if (functionName === 'aadharVerification') {
        let completionsInput02 = [{ 
          role: "system", 
          content:`You are a helpful assistant that helps in verifying aadhar card number verification.
          Generate Response based on the context: ${functionResponse.response}`
        }];
        chatHistory.forEach((chat) => {
          completionsInput02.push({
              role: chat.role,
              content: chat.content
          })});
      console.log('------------chatHistory',completionsInput02);
      secondResponse = await client.chat.completions.create({
        model: AZURE_OPENAI_CONFIG.PARAMS_AZURE_OPENAI_DEPLOYMENT_NAME,
        messages: completionsInput02,
      }); // get a new response from the model where it can see the function response
    
      if (secondResponse) {
        console.log('------------secondResponse',secondResponse.choices[0].message.content);
        return {
          response: secondResponse.choices[0].message.content,
          functionArgs: functionArgs
        };
      } else {
        console.log('------------responseMessage',responseMessage);
        return {response: responseMessage};
      }
  }
   if (functionName === 'OTPVerification') {
    let completionsInput03 = [{ 
      role: "system", 
      content:`You are a helpful assistant that helps in verifying OTP.
        - If the OTP verification is successful:
            Example: "Your OTP has been successfully verified. Congratulations, your Aadhaar card verification is now complete."
        - If the OTP verification fails:
            Example: "The OTP you entered is incorrect. Please try again."
          Generate Response based on the context: ${functionResponse.response}`}];
      chatHistory.forEach((chat) => {
        completionsInput03.push({
            role: chat.role,
            content: chat.content
        })});
    console.log('------------chatHistory',completionsInput03);
    secondResponse = await client.chat.completions.create({
      model: AZURE_OPENAI_CONFIG.PARAMS_AZURE_OPENAI_DEPLOYMENT_NAME,
      messages: completionsInput03,
    }); // get a new response from the model where it can see the function response
  
  if (secondResponse) {
    console.log('------------secondResponse',secondResponse.choices[0].message.content);
    return {
      response: secondResponse.choices[0].message.content,
      functionArgs: functionArgs
    };
  } else {
    console.log('------------responseMessage',responseMessage);
    return {response: responseMessage};
  }
}
} else {
  return {response: responseMessage};
}}catch (error) {
  console.log(error);
  throw new Error(error);
  }
};
module.exports = {
  getChatCompletion,
};