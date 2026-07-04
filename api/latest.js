// api/latest.js
import { supabase } from "../lib/supabase.js";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    try {
        // Query the single newest row inside your Supabase "reports" table
        const { data, error } = await supabase
            .from("reports")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(1);

        if (error) {
            return res.status(500).json({ success: false, error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(200).json({ success: true, latest: null });
        }

        return res.status(200).json({ success: true, latest: data[0] });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
}
