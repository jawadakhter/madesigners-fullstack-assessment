const express = require('express');
const { OpenAI } = require('openai');
const router = express.Router();

// OpenAI config - API key .env file se aayegi
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1", // Yeh line lazmi add karni hai
    apiKey: process.env.OPENAI_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": "http://localhost:5000", // OpenRouter ke liye zaroori hota hai
        "X-Title": "Ad Agency Assessment", // Koi bhi naam de dein
    }
});

// GET /health - Service status [cite: 82]
router.get('/health', (req, res) => {
    res.json({ status: 'active', model: 'gpt-3.5-turbo' });
});

// POST /generate/copy - SSE STREAMING SUPPORT ADDED
router.post('/generate/copy', async (req, res) => {
    const { product, tone, platform, word_limit, stream } = req.body;
    
    // Agar client ne stream=true bheja toh SSE use karo
    if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        try {
            const prompt = `Write an ad copy for ${product}. Tone: ${tone}. Platform: ${platform}. Max words: ${word_limit}. Format output strictly as JSON with keys: headline, body, cta.`;
            
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                stream: true,
            });

            for await (const chunk of response) {
                const content = chunk.choices[0]?.delta?.content || "";
                if (content) {
                    res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
                }
            }
            res.write('data: [DONE]\n\n');
            res.end();
        } catch (error) {
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
            res.end();
        }
        return; // Early return for streaming
    }

    // Non-streaming (original code)
    try {
        const prompt = `Write an ad copy for ${product}. Tone: ${tone}. Platform: ${platform}. Max words: ${word_limit}. Format output strictly as JSON with keys: headline, body, cta.`;
        
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
        });

        const aiData = JSON.parse(response.choices[0].message.content);
        res.json(aiData);
    } catch (error) {
        res.status(500).json({ error: "AI Generation failed", details: error.message });
    }
});

// POST /generate/social - 5 Captions generate karne ke liye [cite: 81]
router.post('/generate/social', async (req, res) => {
    const { platform, campaign_goal, brand_voice } = req.body;
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: `Generate 5 separate social media captions for ${platform} aiming for ${campaign_goal} using a ${brand_voice} voice. Return as JSON array of strings.` }]
        });
        res.json({ options: JSON.parse(response.choices[0].message.content) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /generate/hashtags - 10 Hashtags ke liye [cite: 82]
router.post('/generate/hashtags', async (req, res) => {
    const { content, industry } = req.body;
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: `Give me 10 trending hashtags for the ${industry} industry related to this content: "${content}". Return as a comma-separated list.` }]
        });
        const tags = response.choices[0].message.content.split(',').map(t => t.trim());
        res.json({ hashtags: tags });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// POST /generate - Campaign Brief Generate karne ke liye (Frontend Task 1.2 connect)
router.post('/generate', async (req, res) => {
    const formData = req.body;
    
    try {
        const prompt = `
        You are an expert advertising strategist. Generate a structured creative brief based on:
        
        Client: ${formData.clientName}
        Industry: ${formData.industry}
        Website: ${formData.website}
        Key Competitors: ${formData.competitors}
        Campaign Objective: ${formData.objective}
        Target Audience: ${formData.targetAudience}
        Budget: ${formData.budget}
        Tone: ${formData.tone}
        Imagery Style: ${formData.imageryStyle}
        Color Direction: ${formData.colorDirection}
        Do's: ${formData.dos}
        Don'ts: ${formData.donts}
        
        Respond ONLY in this exact JSON format, no extra markdown formatting, no extra text:
        {
          "title": "Campaign title suggestion",
          "headlines": ["Headline 1", "Headline 2", "Headline 3"],
          "toneGuide": "Tone of voice description",
          "channels": [
            {"name": "Instagram", "percentage": 40},
            {"name": "Google Ads", "percentage": 35},
            {"name": "YouTube", "percentage": 25}
          ],
          "visual": "Hero image concept description"
        }
        `;
        
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
        });

        // AI kabhi kabhi ```json aur ``` laga deta hai response mein, usko remove karna zaroori hai
        let aiText = response.choices[0].message.content.trim();
        if (aiText.startsWith("```json")) {
            aiText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
        } else if (aiText.startsWith("```")) {
            aiText = aiText.replace(/```/g, "").trim();
        }

        const aiData = JSON.parse(aiText);
        res.json(aiData);
    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ error: "AI Generation failed", details: error.message });
    }
});


// POST /generate/stream (Server-Sent Events)
router.post('/generate/stream', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const { prompt } = req.body;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt || "Generate a creative ad idea." }],
            stream: true, // STREAMING ENABLED
        });

        for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                // SSE format require karta hai ke data 'data: ' se start ho aur '\n\n' par end ho
                res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
            }
        }
        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
    }
});



module.exports = router;