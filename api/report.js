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
        image: "https://pet-scanner-api.vercel.app/frog.gif"
    },
    "Bunny": {
        emoji: "🐰",
        ratio: "1 in 8",
        rarity: "⚪ Common",
        color: 0x98a0a6,
        price: "20K Sheckles",
        description: "Hops around the garden and boosts the walk speed by +5",
        image: "https://pet-scanner-api.vercel.app/bunny.gif"
    },
    "Owl": {
        emoji: "🦉",
        ratio: "1 in 12",
        rarity: "🟢 Uncommon",
        color: 0x57f287, // Green
        price: "25K Sheckles",
        description: "Extends your view distance by 12.5% at night, and hoots loudly when a rare pet spawns",
        image: "https://pet-scanner-api.vercel.app/owl.gif"
    },
    "Deer": {
        emoji: "🦌",
        ratio: "1 in 20",
        rarity: "🔵 Rare",
        color: 0x3498db, // Blue
        price: "50K Sheckles",
        description: "Trots around the garden and helps plants grow 10% faster",
        image: "https://pet-scanner-api.vercel.app/deer.gif"
    },
    "Turtle": {
        emoji: "🐢",
        ratio: "1 in 25",
        rarity: "🔵 Rare",
        color: 0x3498db,
        price: "70K Sheckles",
        description: "Adds +10 backpack space but slows your walk speed by 2 (Stacks)",
        image: "https://pet-scanner-api.vercel.app/turtle.gif"
    },
    "Butterfly": {
        emoji: "🦋",
        ratio: "1 in 42",
        rarity: "🟡 Legendary",
        color: 0xfee75c, // Yellow
        price: "Sheckles",
        description: "Flutters around and helps everyone's plants grow 3% faster",
        image: "https://pet-scanner-api.vercel.app/butterfly.gif"
    },
    "Robin": {
        emoji: "🐦",
        ratio: "1 in 50",
        rarity: "🟡 Legendary",
        color: 0xfee75c,
        price: "75K Sheckles",
        description: "Flies around the garden, eating ripe fruits and dropping seeds",
        image: "https://pet-scanner-api.vercel.app/robin.gif"
    },
    "Bee": {
        emoji: "🐝",
        ratio: "1 in 100",
        rarity: "🟡 Legendary",
        color: 0xfee75c,
        price: "1M Sheckles",
        description: "Patrols your garden and swarms intruders to defend your fruit",
        image: "https://pet-scanner-api.vercel.app/bee.gif"
    },
    "Bald Eagle": {
        emoji: "🦅",
        ratio: "1 in 444",
        rarity: "🔴 Mythic",
        color: 0xed4245, // Red
        price: "Sheckles",
        description: "Snatches intruders and flies them out of your garden",
        image: "https://pet-scanner-api.vercel.app/bald%20eagle.gif"
    },
    "Bear": {
        emoji: "🐻",
        ratio: "1 in 500",
        rarity: "🔴 Mythic",
        color: 0xed4245,
        price: "5M Sheckles",
        description: "Tackles intruders by pinning them down and throwing them out of your garden",
        image: "https://pet-scanner-api.vercel.app/bear.gif"
    },
    "Monkey": {
        emoji: "🐵",
        ratio: "1 in 300",
        rarity: "🔴 Mythic",
        color: 0xed4245,
        price: "3M Sheckles",
        description: "Brings ripe fruits straight to you",
        image: "https://pet-scanner-api.vercel.app/monkey.gif"
    },
    "Golden Dragonfly": {
        emoji: "🧚",
        ratio: "1 in 900",
        rarity: "🔴 Mythic",
        color: 0xed4245,
        price: "9M Sheckles",
        description: "Increases the gold chance by 2 times",
        image: "https://pet-scanner-api.vercel.app/dragon%20fly.gif"
    },
    "Unicorn": {
        emoji: "🦄",
        ratio: "1 in 1200",
        rarity: "🔴 Mythic",
        color: 0xed4245,
        price: "12M Sheckles",
        description: "Trots around the garden and doubles the chance of fruits turning rainbow",
        image: "https://pet-scanner-api.vercel.app/unicorn.gif"
    },
    "Raccoon": {
        emoji: "🦝",
        ratio: "1 in 1500",
        rarity: "🟣 Super",
        color: 0x9b59b6, // Purple
        price: "15M Sheckles",
        description: "Sneaks out at night to attempt to steal from other players, and increases your steal capacity",
        image: "https://pet-scanner-api.vercel.app/raccon.gif"
    },
    "Black Dragon": {
        emoji: "🐉",
        ratio: "1 in 2500",
        rarity: "🟣 Super",
        color: 0x9b59b6,
        price: "20M Sheckles",
        description: "A legendary dragon companion that defends your garden with destructive fire breath",
        image: "https://pet-scanner-api.vercel.app/dragon.gif"
    },
    "Ice Serpent": {
        emoji: "🐍",
        ratio: "Guild Reward",
        rarity: "🟣 Super",
        color: 0x9b59b6,
        price: "Guild Reward",
        description: "Protects your guard by hitting intruders with a frost breath, freezing them in place",
        image: "https://pet-scanner-api.vercel.app/serpent.gif"
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
        
        // 1. DEDUPLICATION CHECK
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

        try {
            const { data: existingSpawns, error: checkError } = await supabase
                .from("reports")
                .select("id")
                .eq("serverId", serverId) // Changed back to capital 'I'
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

        // 2. Insert report details into your Supabase Database
        // Note: Column names changed back to match exact capital 'Id'
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
        let baseSpecies = "Unknown";
        for (const key of Object.keys(PET_DATABASE)) {
            if (pet.species.toLowerCase().includes(key.toLowerCase())) {
                baseSpecies = key;
                break;
            }
        }

        const petConfig = PET_DATABASE[baseSpecies] || {
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

            // Extract Mutations & Sizes from database string
            const isRainbow = pet.species.toLowerCase().includes("rainbow");
            const isHuge = pet.species.toLowerCase().includes("huge");
            const isBig = pet.species.toLowerCase().includes("big") && !isHuge;

            // Determine Rarity Colors and Mentions
            let embedColor = petConfig.color;
            let mentionContent = "";

            if (petConfig.rarity.includes("Mythic") || petConfig.rarity.includes("Super")) {
                mentionContent = "@everyone";
            }

            if (isRainbow || isHuge || isBig) {
                mentionContent = "@everyone";
                embedColor = 0xff00ff;
            }

            let embedTitle = `✦ ${petConfig.emoji} DISCOVERED: ${baseSpecies.toUpperCase()} ✦`;
            if (isRainbow || isHuge || isBig) {
                const variantName = `${isRainbow ? "RAINBOW" : ""} ${isHuge ? "HUGE" : isBig ? "BIG" : ""}`.trim();
                embedTitle = `✨ ${petConfig.emoji} ${variantName} ${baseSpecies.toUpperCase()} DISCOVERED ✨`;
            }

            let specsBlock = `• **Rarity:** ${petConfig.rarity}\n`;
            if (isRainbow) {
                specsBlock += `• **Mutation:** 🌈 \`RAINBOW\`\n`;
            }
            if (isHuge || isBig) {
                specsBlock += `• **Size Variant:** 📏 \`${isHuge ? "HUGE" : "BIG"}\`\n`;
            }
            specsBlock += `• **Spawn Rate:** \`${petConfig.ratio}\` \n` +
                         `• **Cost:** \`${petConfig.price}\` \n` +
                         `• **Time Left:** ⏳ ${relativeTimeStr}`;

            const embed = {
                title: embedTitle,
                description: `*${petConfig.description}*\n\n` +
                             `**📋 PET SPECS**\n` +
                             specsBlock + `\n\n` +
                             `**🎮 CONNECTIVITY**\n` +
                             `• **[Instant Launch: Warp Directly to Server](${customProtocolJoinLink})**\n\n` +
                             `**💻 EXECUTOR JOIN CODE**\n` +
                             `\`\`\`lua\n${luaTeleportCode}\n\`\`\``,
                color: embedColor,
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
