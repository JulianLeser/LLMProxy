import express from 'express';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = 9003;

app.use(cors());
app.use(bodyParser.json());

let languageModelURL = 'http://localhost:11434/api/generate'; //Ollama default api url
let outputURL = '/proxy/generate';

app.post(outputURL, async (req, res) => {
    try {
        const { prompt, model } = req.body;

        console.log(req);
        console.log('Prompt received:', prompt);

        const response = await fetch(languageModelURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ model: model, prompt })
        });

        console.log('Response status:', response.status);
        if (!response.ok) {
            return res.status(response.status).json({ error: 'Failed to fetch from LLM API', details: await response.text() });
        }
        const responseText = await response.text();
        
        const ndjsonLines = responseText.split('\n').filter(line => line.trim() !== '');

        const concatenatedResponse = ndjsonLines.map(line => {
            const jsonLine = JSON.parse(line);
            return jsonLine.response;
        }).join('');

        console.log(concatenatedResponse);
        res.json(concatenatedResponse);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}${outputURL}`);
});

/* Made by Julian Noah Leser, found at https://leser.io/ */