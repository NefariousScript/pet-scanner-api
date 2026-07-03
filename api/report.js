const reports = []; // temporary storage (resets when server restarts)

export default function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method Not Allowed"
        });
    }

    const data = req.body;

    console.log("Incoming:", data);

    // Save report
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
