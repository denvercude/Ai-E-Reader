import OpenAI from 'openai'; // 
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use the OpenAI API key from environment variables
});

/*
 - controller function to handle text explanation requests using OpenAI's GPT model.
 - It receives a text input from the request body, validates it, and sends it to the OpenAI API for processing.
 - If the text is valid, it constructs a prompt to explain the text in simple terms.
 - The response from OpenAI is then returned as a JSON object containing the explanation.
 - If the text is invalid or if there is an error during the API call, appropriate error responses are sent back to the client.
 - This function is designed to be used in an Express.js
 */ 

export const explainText = async (req, res) => {
    const { text } = req.body; // Extract the text to be explained from the request body

    if (!text || typeof text !== 'string' || text.trim() === '') {
        return res.status(400).json({ error: 'Invalid text provided' }); // Return an error if the text is invalid
    }

    try {
        // send the prompt to OpenAI's Chat completion API
        const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo', // Specify the model to use
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that explains text in simple terms.',
                },
                {
                    role: 'user',
                    content: `Explain the following text in simple terms:\n\n${text}`,
                },
            ],
    });

    const explanation = completion.choices[0]?.message?.content?.trim();

    return res.status(200).json({ explanation }); // Return the explanation in the response
} catch (error) {
    console.error('Error from OpenAI:', error); // Log the error for debugging
    return res.status(500).json({ error: 'Failed to get explanation from GPT' }); // Return a server error response
    }
}