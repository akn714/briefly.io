const express = require('express');
const dotenv = require('dotenv');
const Groq = require('groq-sdk');
const cors = require('cors');
const log = require('./logger');

dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(log); // logging method and url of all incomming request

// Home route
app.get('/', (req, res) => {
    try {
        res.status(200).json({
            messag: "home route"
        });
    } catch (error) {
        console.error('[-] Error in home route:', error.message);
        res.status(500).json({
            error: error.message
        });
    }
});


const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

chat_history = [
    {
        "role": "system",
        "content": "You are a helpful assistant which summarizes the blogs in a very efficient way explaining all the key points and key featur of the blog, Your response should be converted to html tags means should be md formate but not actually md but in html tags, you have to include necessary styles to display code block and other contents the code block should have dark background (all code blocks should be in a different line), and do not colors any content, and also do include anything in the reponse other than text, html tag and styles, and also do not include script tags of link tags for style sheets and scripts."
    }
]

app.post('/summarize', async (req, res) => {
    try {
        let blogLink = req.body.url;

        const completion = await groq.chat.completions
            .create({
                messages: [
                    {
                        "role": "system",
                        "content": "You are a helpful assistant which summarizes the blogs in a very efficient way explaining all the key points and key featur of the blog, Your response should be converted to html tags means should be md formate but not actually md but in html tags, you have to include necessary styles to display code block and other contents the code block should have dark background (all code blocks should be in a different line), and do not colors any content, and also do include anything in the reponse other than text, html tag and styles, and also do not include script tags of link tags for style sheets and scripts, and the contents should be in a proper formate."
                    },
                    {
                        role: "user",
                        content: `Summarize this blog ${blogLink}`,
                    },
                ],
                model: "llama-3.3-70b-versatile",
            })
        // let content = completion.choices[0].message.content.trim().split('\n').join('<br>');
        res.status(200).json({
            summary: completion.choices[0].message.content
        })
    } catch (error) {
        console.error('[-] Error in summarize route:', error.message);
        res.status(500).json({
            error: error.message
        });
    }
})

// Handle 404 errors
app.use((req, res) => {
    res.status(404).json({
        message: '404 Not Found!'
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[+] App running on http://localhost:${PORT}`);
});
