import { supabase } from "../lib/supabase.js";

export default async function handler(req, res) {

    if (req.method === "POST") {
        const { scannerId, species, serverId } = req.body;

        const { error } = await supabase
            .from("reports")
            .insert([{ scannerId, species, serverId }]);

        if (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        return res.status(200).json({
            success: true,
            message: "Saved to Supabase"
        });
    }

    if (req.method === "GET") {
        const { data, error } = await supabase
            .from("reports")
            .select("*")
            .order("id", { ascending: false });

        if (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        return res.status(200).json({
            success: true,
            data
        });
    }

    return res.status(405).json({
        success: false,
        message: "Method not allowed"
    });
} 
