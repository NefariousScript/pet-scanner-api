// api/start.js
export default function handler(req, res) {
    const { placeId, gameInstanceId } = req.query;

    if (!placeId || !gameInstanceId) {
        return res.status(400).send("Missing placeId or gameInstanceId parameters.");
    }

    // Redirect to the official Roblox games launch route using 'jobId'
    const robloxUrl = `https://www.roblox.com/games/start?placeId=${placeId}&jobId=${gameInstanceId}`;

    // Perform an instant browser-level redirect
    res.writeHead(302, { Location: robloxUrl });
    res.end();
}
