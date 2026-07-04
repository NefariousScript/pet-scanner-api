// api/report.js
import { supabase } from "../lib/supabase.js";

// === PET CONFIGURATION DATABASE ===
const PET_DATABASE = {
    "Frog": {
        emoji: "🐸",
        ratio: "1 in 8",
        rarity: "⚪ Common",
        color: 0x98a0a6, // Gray
        price: "10K Sheckles",
        description: "Hops around your garden and boosts your jump height by +5",
        image: "https://i.imgur.com/3911075_frog.png"
    },
    "Bunny": {
        emoji: "🐰",
        ratio: "1 in 8",
        rarity: "⚪ Common",
        color: 0x98a0a6,
        price: "20K Sheckles",
        description: "Hops around the garden and boosts the walk speed by +5",
        image: "https://i.imgur.com/your-bunny.png"
    },
    "Owl": {
        emoji: "🦉",
        ratio: "1 in 12",
        rarity: "🟢 Uncommon",
        color: 0x57f287, // Green
        price: "25K Sheckles",
        description: "Extends your view distance by 12.5% at night, and hoots loudly when a rare pet spawns",
        image: "https://i.imgur.com/your-owl.png"
    },
    "Deer": {
        emoji: "🦌",
        ratio: "1 in 20",
        rarity: "🔵 Rare",
        color: 0x3498db, // Blue
        price: "50K Sheckles",
        description: "Trots around the garden and helps plants grow 10% faster",
        image: "https://i.imgur.com/your-deer.png"
    },
    "Turtle": {
        emoji: "🐢",
        ratio: "1 in 25",
        rarity: "🔵 Rare",
        color: 0x3498db,
        price: "70K Sheckles",
        description: "Adds +10 backpack space but slows your walk speed by 2 (Stacks)",
        image: "https://i.imgur.com/your-turtle.png"
    },
    "Robin": {
        emoji: "🐦",
        ratio: "1 in 50",
        rarity: "🟡 Legendary",
        color: 0xfee75c, // Yellow
        price: "75K Sheckles",
        description: "Flies around the garden, eating ripe fruits and dropping seeds",
        image: "https://i.imgur.com/your-robin.png"
    },
    "Bee": {
        emoji: "🐝",
        ratio: "1 in 100",
        rarity: "🟡 Legendary",
        color: 0xfee75c,
        price: "1M Sheckles",
        description: "Patrols your garden and swarms intruders to defend your fruit",
        image: "https://i.imgur.com/your-bee.png"
    },
    "Bear": {
        emoji: "🐻",
        ratio: "1 in 500",
        rarity: "🔴 Mythic",
        color: 0xed4245, // Red
        price: "5M Sheckles",
        description: "Tackles intruders by pinning them down and throwing them out of your garden",
        image: "https://i.imgur.com/your-bear.png"
    },
    "Monkey": {
        emoji: "🐵",
        ratio: "1 in 300",
        rarity: "🔴 Mythic",
        color: 0xed4245,
        price: "3M Sheckles",
        description: "Brings ripe fruits straight to you",
        image: "https://i.imgur.com/your-monkey.png"
    },
    "Golden Dragonfly": {
        emoji: "🧚",
        ratio: "1 in 900",
        rarity: "🔴 Mythic",
        color: 0xed4245,
        price: "9M Sheckles",
        description: "Increases the gold chance by 2 times",
        image: "https://i.imgur.com/your-dragonfly.png"
    },
    "Unicorn": {
        emoji: "🦄",
        ratio: "1 in 1200",
        rarity: "🔴 Mythic",
        color: 0xed4245,
        price: "12M Sheckles",
        description: "Trots around the garden and doubles the chance of fruits turning rainbow",
        image: "https://i.imgur.com/your-unicorn.png"
    },
    "Raccoon": {
        emoji: "🦝",
        ratio: "1 in 1500",
        rarity: "🟣 Super",
        color: 0x9b59b6, // Purple
        price: "15M Sheckles",
        description: "Sneaks out at night to attempt to steal from other players, and increases your steal capacity",
        image: "https://i.imgur.com/your-raccoon.png"
    },
    "Black Dragon": {
        emoji: "🐉",
        ratio: "1 in 2500",
        rarity: "🟣 Super",
        color: 0x9b59b6,
        price: "20M Sheckles",
        description: "A legendary dragon companion that defends your garden with destructive fire breath",
        image: "https://i.imgur.com/your-dragon.png"
    },
    "Ice Serpent": {
        emoji: "🐍",
        ratio: "Guild Reward",
        rarity: "🟣 Super",
        color: 0x9b59b6,
        price: "Guild Reward",
        description: "Protects your guard by hitting intruders with a frost breath, freezing them in place",
        image: "https://i.imgur.com/your-serpent.png"
    }
};

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method Not Allowed"
        });
    }

    const data = req.body;
    console.log("Received payload:", data);

    const { type, placeId, serverId, pet, scannerId, timestamp } = data;

    if (type === "heartbeat") {
        return res.status(200).json({
            success: true,
            message: "Heartbeat received!"
        });
    }

    if (type === "report" && pet) {
        
        // 1. DEDUPLICATION CHECK (Before inserting or sending Webhook)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

        try {
            const { data: existingSpawns, error: checkError } = await supabase
                .from("reports")
                .select("id")
                .eq("serverId", serverId)
                .eq("species", pet.species)
                .gte("created_at", fiveMinutesAgo);

            if (checkError) {
                console.error("[Supabase Error] Duplicate check failed:", checkError);
            }

            if (existingSpawns && existingSpawns.length > 0) {
                console.log(`[Deduplication] Suppressed duplicate alert: ${pet.species} on server ${serverId}`);
                return res.status(200).json({
                    success: true,
                    message: "Report suppressed (Duplicate detected inside 5-minute window)."
                });
            }
        } catch (err) {
            console.error("[Server Error] Failed during deduplication check:", err);
        }

        // 2. Insert report details into your Supabase Database (Only if it's unique)
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

        // 3. Fetch configured pet layout metadata
        const petConfig = PET_DATABASE[pet.species] || {
            emoji: "🐾",
            ratio: "1 in ?",
            rarity: "⚪ Unknown",
            color: 0x2b2d31,
            price: "N/A",
            description: "No description available.",
            image: ""
        };

        // Forward to Discord Webhook
        const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
        if (webhookUrl) {
            const customProtocolJoinLink = `https://pet-scanner-api.vercel.app/api/start?placeId=${placeId}&gameInstanceId=${serverId}`;
            const luaTeleportCode = `game:GetService("TeleportService"):TeleportToPlaceInstance(${placeId}, "${serverId}", game.Players.LocalPlayer)`;
            const relativeTimeStr = `<t:${timestamp || Math.floor(Date.now() / 1000)}:R>`;

            // Dynamic @everyone notification for Mythics and Supers
            let mentionContent = "";
            if (petConfig.rarity.includes("Mythic") || petConfig.rarity.includes("Super")) {
                mentionContent = "@everyone";
            }

            const embed = {
                title: `✦ ${petConfig.emoji} DISCOVERED: ${pet.species.toUpperCase()} ✦`,
                description: `*${petConfig.description}*\n\n` +
                             `**📋 PET SPECS**\n` +
                             `• **Rarity:** ${petConfig.rarity}\n` +
                             `• **Spawn Rate:** \`${petConfig.ratio}\` \n` +
                             `• **Cost:** \`${petConfig.price}\` \n` +
                             `• **Spawned:** ${relativeTimeStr}\n\n` +
                             `**🎮 CONNECTIVITY**\n` +
                             `• **[Instant Launch: Warp Directly to Server](${customProtocolJoinLink})**\n\n` +
                             `**💻 EXECUTOR JOIN CODE**\n` +
                             `\`\`\`lua\n${luaTeleportCode}\n\`\`\``,
                color: petConfig.color,
                thumbnail: petConfig.image ? { url: petConfig.image } : undefined
            };

            try {
                await fetch(webhookUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        content: mentionContent, 
                        embeds: [embed] 
                    })
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
