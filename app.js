const express = require('express');
const dotenv = require('dotenv');
const Groq = require('groq-sdk');
const cors = require('cors');
const log = require('./logger');

dotenv.config();

const app = express();

// app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(
  cors({
    origin: "https://blogsummarizer.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    credentials: true // Allow credentials if needed
  })
);
app.use(log); // logging method and url of all incomming request

// Home route
//app.get('/', (req, res) => {
//    try {
//        res.status(200).json({
//            messag: "home route"
//        });
//    } catch (error) {
//        console.error('[-] Error in home route:', error.message);
//        res.status(500).json({
//            error: error.message
//        });
//    }
//});


const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

chat_history = [
    {
        "role": "system",
        "content": `
        You are a helpful assistant that summarizes blogs efficiently, capturing all key points and features of the blog.

        - Your response should be formatted in HTML tags (similar to Markdown but using pure HTML).
        - Ensure proper structuring with necessary styles for code blocks, which should:
            - Have a dark background.
            - Be placed on a separate line.
            - Appear only when necessary (do not force code blocks).
        - Do not apply colors to any content.
        - Do not include anything other than text, HTML tags, and inline styles.
        - Do not use <script> or <link> tags for styles or scripts.
        - The response should be in properly structured HTML format.

        - Response Format: Return the output in valid JSON format as shown below:
            {
                "title": "[Actual title of the blog]",
                "summary": \`[Formatted blog summary in HTML tags]\`
            }
        `
    }
]

app.post('/summarize', async (req, res) => {
    try {
        let blogLink = req.body.url;
        console.log(blogLink)

        const completion = await groq.chat.completions
            .create({
                messages: [
                    {
                        "role": "system",
                        "content": `
                        You are a helpful assistant that summarizes blogs efficiently, capturing all key points and features of the blog.

                        - Your response should be formatted in HTML tags (similar to Markdown but using pure HTML).
                        - Ensure proper structuring with necessary styles for code blocks, which should:
                            - Have a dark background.
                            - Be placed on a separate line.
                            - Appear only when necessary (do not force code blocks).
                        - All the key points should be in bullet points with proper headings.
                        - Do proper formating like md like bold heading, sub heading, italic text, etc whenever needed.
                        - Do not apply colors to any content.
                        - Do not include anything other than text, HTML tags, and inline styles.
                        - Do not use <script> or <link> tags for styles or scripts.
                        - The response should be in properly structured HTML format.

                        - Response Format: Return the output in valid JSON format as shown below:
                            {
                                "title": "[Actual title of the blog]",
                                "summary": "[Formatted blog summary in HTML tags]"
                            }
                            - The whole summary text should be present only in one line and enclose it with double quotes ""
                        `
                    },
                    {
                        role: "user",
                        content: `Summarize this blog ${blogLink}`,
                    },
                ],
                model: "llama-3.3-70b-versatile",
            })
        // console.log(completion.choices[0].message.content.trim())
        let content = JSON.parse(completion.choices[0].message.content.trim());
        console.log(content);
        res.status(200).json({
            title: content.title,
            summary: content.summary
        })
    } catch (error) {
        console.error('[-] Error in summarize route:', error.message);
        res.status(500).json({
            error: error.message
        });
    }
})

app.use(express.static(__dirname + '/views'));
// app.use(express.urlencoded({ extended: true })); 
app.get('/', (req, res) => {
	res.status(200).sendFile(path.json(__dirname, '/views/index.html'));
});

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
