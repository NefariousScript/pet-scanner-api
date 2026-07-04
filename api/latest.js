// api/latest.js
import { supabase } from "../lib/supabase.js";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    try {
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

        const latest = data[0];
        
        // Calculate age
        const createdAtTime = new Date(latest.created_at).getTime();
        const ageInSeconds = Math.floor((Date.now() - createdAtTime) / 1000);

        return res.status(200).json({ 
            success: true, 
            latest: {
                id: latest.id,
                scannerId: latest.scannerId, // Changed back to capital 'Id'
                species: latest.species,
                serverId: latest.serverId,   // Changed back to capital 'Id'
                age: ageInSeconds
            } 
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
}
