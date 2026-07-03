// api/report.js
import { supabase } from "../lib/supabase.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method Not Allowed"
        });
    }

    const data = req.body;
    console.log("Received payload:", data);

    const { type, placeId, serverId, pet, scannerId } = data;

    if (type === "heartbeat") {
        return res.status(200).json({
            success: true,
            message: "Heartbeat received!"
        });
    }

    if (type === "report" && pet) {
        // 1. Insert report details into your Supabase Database
        const { error: dbError } = await supabase
            .from("reports")
            .insert([
                {
                    scannerId: scannerId,
                    species: pet.species,
                    serverId: serverId
                }
            ]);

        if (dbError) {
            console.error("[Supabase Error] Failed to log spawn:", dbError);
        } else {
            console.log("[Supabase] Successfully logged spawn for:", pet.species);
        }

        // 2. Forward to Discord Webhook with clickable Join Links
        const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
        if (webhookUrl) {
            const attributesText = Object.keys(pet.attributes).length > 0 
                ? Object.entries(pet.attributes).map(([k, v]) => `• **${k}**: ${v}`).join("\n") 
                : "None";

            // Roblox deep-linking formats to join a specific JobID server:
            const appJoinLink = `roblox://experiences/start?placeId=${placeId}&gameInstanceId=${serverId}`;
            const webJoinLink = `https://www.roblox.com/games/start?placeId=${placeId}&gameInstanceId=${serverId}`;

            const embed = {
                title: `🚨 Wild Pet Spawned: ${pet.species}!`,
                // Adding clickable markdown links right inside the embed description
                description: `🎮 **[Click to Join Server (Roblox App)](${appJoinLink})**\n🌐 **[Click to Join Server (Browser)](${webJoinLink})**`,
                color: 3462041,
                fields: [
                    { name: "Species", value: pet.species, inline: true },
                    { name: "Distance", value: `${pet.distance} studs`, inline: true },
                    { name: "Position", value: `\`X: ${Math.round(pet.position.x)}, Y: ${Math.round(pet.position.y)}, Z: ${Math.round(pet.position.z)}\`` },
                    { name: "Attributes", value: attributesText },
                    { name: "Place ID", value: String(placeId), inline: true },
                    { name: "Server ID", value: `\`${serverId}\`` }
                ],
                timestamp: new Date().toISOString()
            };

            try {
                await fetch(webhookUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ embeds: [embed] })
                });
            } catch (err) {
                console.error("Error forwarding to Discord:", err);
            }
        }
    }

    return res.status(200).json({
        success: true,
        message: "Report received!"
    });
}
