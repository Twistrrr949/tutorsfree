// This file runs securely on Netlify's server.
// It will hide your Groq API key and pass the LLM response back to the client.

// The Groq API key is securely accessed from Netlify's environment variables.
const GROQ_API_KEY = process.env.API;

exports.handler = async (event, context) => {

    // IMPORTANT: Define the prompt you want the LLM to process.
    // For simplicity, we are hardcoding a prompt. In a real app, you'd 
    // parse the prompt from event.body or event.queryStringParameters.
    const userPrompt = "Write a single, encouraging sentence about learning new web technologies.";

    if (!GROQ_API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Groq API Key not configured in Netlify environment variables." })
        };
    }

    // 1. Define the Groq API endpoint
    const groqApiUrl = 'https://api.groq.com/openai/v1/chat/completions';

    // 2. Define the payload (the JSON body of the request)
    const requestBody = {
        model: "llama3-8b-8192", // You can change this to another Groq model (e.g., mixtral-8x7b-32768)
        messages: [
            {
                "role": "user",
                "content": userPrompt,
            }
        ],
        temperature: 0.7,
        max_tokens: 100
    };

    try {
        // 3. Make the secure request to Groq using the hidden API key
        const response = await fetch(groqApiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`, // THIS is where the secret key is used
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const groqData = await response.json();

        if (!response.ok) {
            // Handle API errors (e.g., invalid key, bad request structure)
            console.error("Groq API Error:", groqData);
            return {
                statusCode: response.status,
                body: JSON.stringify({ message: "Error from Groq API", details: groqData })
            };
        }

        // 4. Extract the generated text from Groq's standard response format
        const generatedText = groqData.choices[0].message.content;

        // 5. Return ONLY the generated text back to your client-side JavaScript
        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ 
                success: true, 
                llmResponse: generatedText 
            })
        };

    } catch (error) {
        console.error("Fetch call failed:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal serverless function error." })
        };
    }
};
