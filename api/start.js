// api/start.js
export default function handler(req, res) {
    const { placeId, gameInstanceId } = req.query;

    if (!placeId || !gameInstanceId) {
        return res.status(400).send("Missing placeId or gameInstanceId parameters.");
    }

    // Using the modern, official Roblox universal deep-link protocol
    const robloxProtocolUrl = `roblox://experiences/start?placeId=${placeId}&gameInstanceId=${gameInstanceId}`;

    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Launching Roblox...</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    background-color: #141416;
                    color: #ffffff;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                }
                .container {
                    text-align: center;
                    padding: 20px;
                }
                .loader {
                    border: 4px solid #1a1a1e;
                    border-top: 4px solid #34d399;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin: 20px auto;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                a {
                    color: #34d399;
                    text-decoration: none;
                    font-weight: bold;
                }
            </style>
            <script>
                window.onload = function() {
                    // Instantly trigger the modern Roblox protocol launch
                    window.location.href = "${robloxProtocolUrl}";
                    
                    // Fallback: close the tab after a few seconds once launched
                    setTimeout(function() {
                        window.close();
                    }, 5000);
                }
            </script>
        </head>
        <body>
            <div class="container">
                <h2>Launching Roblox Player...</h2>
                <div class="loader"></div>
                <p>If the game didn't open automatically, <a href="${robloxProtocolUrl}">click here to launch</a>.</p>
            </div>
        </body>
        </html>
    `);
}
