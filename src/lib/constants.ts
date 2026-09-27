export const PRICING_TIERS = [
    {
        name: "Free",
        price: "$0",
        limit: "1 file",
        fileLimit: 1,
        features: ["Real-time collab", "Basic editor", "1 Project File", "Community Support"],
        tierKey: "FREE" as const
    },
    {
        name: "Pro",
        price: "$9",
        limit: "7 files",
        fileLimit: 7,
        features: ["Everything in Free", "7 Project Files", "Priority Support", "Advanced Auto-complete"],
        tierKey: "PRO" as const,
        recommended: true
    },
    {
        name: "Ultra",
        price: "$29",
        limit: "20 files",
        fileLimit: 20,
        features: ["Everything in Pro", "20 Project Files", "Dedicated Support", "Early Access Features"],
        tierKey: "ULTRA" as const
    }
];
