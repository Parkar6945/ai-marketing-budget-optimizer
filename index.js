import { GoogleGenAI } from "@google/genai";
import fs from "fs";

async function main() {
    if (!process.env.GEMINI_API_KEY) {
        console.error("Error: GEMINI_API_KEY environment variable not found.");
        return;
    }

    const client = new GoogleGenAI();

    // Read the sample data
    const rawData = fs.readFileSync("./data.json", "utf-8");

    console.log("Analyzing marketing data with Gemini AI...\n");
    
    const prompt = `
You are an expert AI Marketing Analyst. 
A company is spending heavily across multiple marketing channels, but management cannot determine which campaigns generate profitable customers. 

Analyze the following campaign, conversion, and revenue data:
${rawData}

Based on this data, please generate a comprehensive report that:
1. Identifies inefficient spending (which campaigns are losing money or have poor ROI).
2. Estimates campaign effectiveness (calculate rough ROI, Cost Per Acquisition, etc.).
3. Recommends how the marketing budget should be reallocated for maximum profitability.

Format the output clearly using Markdown headers and bullet points.
    `;

    const interaction = await client.interactions.create({
        model: "gemini-3.8-flash",
        input: prompt,
    });
    
    console.log("==========================================");
    console.log("      MARKETING BUDGET OPTIMIZATION       ");
    console.log("==========================================\n");
    console.log(interaction.output_text);
}

main().catch(console.error);
