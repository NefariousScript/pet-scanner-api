// api/start.js
export default function handler(req, res) {
    // Bulletproof manual parameter extraction to avoid Vercel query-parsing errors
    const urlObj = new URL(req.url, `https://${req.headers.host}`);
    
    const placeId = urlObj.searchParams.get("placeId") 
        || urlObj.searchParams.get("placeid") 
        || req.query?.placeId 
        || req.query?.placeid;
        
    const gameInstanceId = urlObj.searchParams.get("gameInstanceId") 
        || urlObj.searchParams.get("gameinstanceid") 
        || req.query?.gameInstanceId 
        || req.query?.gameinstanceid;

    if (!placeId || !gameInstanceId) {
        return res.status(400).send("Missing placeId or gameInstanceId parameters.");
    }

    // Redirect to the public, native Server-Joiner lobby game on Roblox (Place: 16302670534).
    // This lobby reads the target Place ID and Server ID from 'launchData' and teleports the player instantly.
    const robloxJoinLobbyUrl = `https://www.roblox.com/games/start?placeId=16302670534&launchData=${placeId}/${gameInstanceId}`;

    // Perform an instant browser-level redirect to the official Roblox launch route
    res.writeHead(302, { Location: robloxJoinLobbyUrl });
    res.end();
}
