let reports = []; // temporary storage

export default function handler(req, res) {

    // GET = view stored data
    if (req.method === "GET") {
        return res.status(200).json({
            success: true,
            reports: reports
        });
    }

    // POST = add new data
    if (req.method === "POST") {
        const data = req.body;

        reports.push({
            id: Date.now(),
            data: data
        });

        return res.status(200).json({
            success: true,
            message: "Saved",
            total: reports.length
        });
    }

    return res.status(405).json({
        success: false,
        message: "Method Not Allowed"
    });
}
