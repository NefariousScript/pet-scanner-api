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

    // The active, open-source community redirector lobby is: 17118259388
    // It expects the target PlaceId and JobId merged together: <PlaceId><JobId>
    const combinedLaunchData = `${placeId}${gameInstanceId}`;
    const robloxJoinLobbyUrl = `https://www.roblox.com/games/start?placeId=17118259388&launchData=${combinedLaunchData}`;

    // Perform an instant browser-level redirect to the official Roblox launch route
    res.writeHead(302, { Location: robloxJoinLobbyUrl });
    res.end();
}
