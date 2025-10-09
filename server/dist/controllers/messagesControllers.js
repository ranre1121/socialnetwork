export function getConversations(req, res) {
    try {
        const sender = req.user?.username;
        if (!sender)
            return res.status(401).json({ message: "Unauthorized" });
    }
    catch (err) {
        console.error("getConversations error:", err);
        res.status(500).json({ message: "Server error" });
    }
}
export function getMessages(req, res) {
    try {
        const sender = req.user?.username;
        if (!sender)
            return res.status(401).json({ message: "Unauthorized" });
        const friendUsername = req.params.username;
        if (!friendUsername)
            return res.status(400).json({ message: "Missing friend username" });
    }
    catch (err) {
        console.error("getMessages error:", err);
        res.status(500).json({ message: "Server error" });
    }
}
//# sourceMappingURL=messagesControllers.js.map