import express from 'express';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

app.get('/api/data', (req, res) => {
    const rawData = fs.readFileSync(path.join(__dirname, 'data.json'), 'utf-8');
    res.json(JSON.parse(rawData));
});

app.get('/api/analyze', async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "GEMINI_API_KEY is missing." });
        }

        const client = new GoogleGenAI();
        const rawData = fs.readFileSync(path.join(__dirname, 'data.json'), 'utf-8');

        const prompt = `
        You are an expert AI Marketing Analyst. 
        A company is spending heavily across multiple marketing channels, but management cannot determine which campaigns generate profitable customers. 
        
        Analyze the following campaign, conversion, and revenue data:
        ${rawData}
        
        Based on this data, please generate a comprehensive report that:
        1. Identifies inefficient spending (which campaigns are losing money or have poor ROI).
        2. Estimates campaign effectiveness (calculate rough ROI, Cost Per Acquisition, etc.).
        3. Recommends how the marketing budget should be reallocated for maximum profitability.
        
        Format the output clearly using HTML (use <h2>, <h3>, <ul>, <li>, <strong>, etc) so it can be directly injected into a web page.
        Do NOT wrap the response in markdown code blocks, just return raw HTML.
        `;

        const interaction = await client.interactions.create({
            model: "gemini-3.8-flash",
            input: prompt,
        });

        // Strip out markdown code blocks if the model accidentally included them
        let htmlResponse = interaction.output_text;
        htmlResponse = htmlResponse.replace(/```html/g, '').replace(/```/g, '');

        res.json({ report: htmlResponse });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate analysis." });
    }
});

app.listen(port, () => {
    console.log(`AI Marketing Optimizer app listening at http://localhost:${port}`);
});
