export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed. Use POST."
        });
    }

    try {
        const { scannerId, species, serverId } = req.body || {};

        if (!scannerId || !species || !serverId) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
                received: req.body
            });
        }

        console.log("📥 Received:", req.body);

        return res.status(200).json({
            success: true,
            message: "API working correctly",
            data: {
                scannerId,
                species,
                serverId
            }
        });

    } catch (err) {
        console.error("Server error:", err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}
