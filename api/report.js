const reports = [];

export default function handler(req, res) {

    // VIEW DATA
    if (req.method === "GET") {
        return res.status(200).json({
            success: true,
            reports
        });
    }

    // SAVE DATA
    if (req.method === "POST") {
        const data = req.body;

        reports.push({
            id: Date.now(),
            data
        });

        return res.status(200).json({
            success: true,
            message: "Saved to memory",
            totalStored: reports.length
        });
    }

    return res.status(405).json({
        success: false,
        message: "Method Not Allowed"
    });
}
