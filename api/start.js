// api/start.js
export default function handler(req, res) {
    // Bulletproof fallback: manually parse the URL parameters to ensure 100% accuracy
    const urlObj = new URL(req.url, `https://${req.headers.host}`);
    
    const placeId = urlObj.searchParams.get("placeId") 
        || urlObj.searchParams.get("placeid") 
        || req.query?.placeId 
        || req.query?.placeid;
        
    const gameInstanceId = urlObj.searchParams.get("gameInstanceId") 
        || urlObj.searchParams.get("gameinstanceid") 
        || req.query?.gameInstanceId 
        || req.query?.gameinstanceid;

    // These will print to your Vercel Logs to help you verify what's being sent
    console.log("[Launcher Debug] Parsed Place ID:", placeId);
    console.log("[Launcher Debug] Parsed Game Instance ID (JobId):", gameInstanceId);

    if (!placeId || !gameInstanceId) {
        return res.status(400).send(`
            <div style="font-family: sans-serif; padding: 20px; background-color: #141416; color: #fff; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <h2>Roblox Launch Error</h2>
                <p>Missing required parameters. Ensure your link contains both <strong>placeId</strong> and <strong>gameInstanceId</strong>.</p>
                <div style="background-color: #1e1e24; padding: 15px; border-radius: 8px; width: 100%; max-width: 400px; text-align: left;">
                    <p>• <strong>placeId:</strong> ${placeId || "<span style='color: #ef4444;'>Missing</span>"}</p>
                    <p>• <strong>gameInstanceId (JobId):</strong> ${gameInstanceId || "<span style='color: #ef4444;'>Missing</span>"}</p>
                </div>
            </div>
        `);
    }

    // Modern universal deep-link protocol
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
                    // Trigger the modern Roblox protocol launch
                    window.location.href = "${robloxProtocolUrl}";
                    
                    // Close the tab after a few seconds once launched
                    setTimeout(function() {
                        window.close();
                    }, 6000);
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
