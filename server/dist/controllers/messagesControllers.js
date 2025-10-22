import prisma from "../prisma.js";
export async function getConversations(req, res) {
    try {
        const currentUsername = req.user?.username;
        return res.status(200).json(conversations);
    }
    catch (err) {
        console.error("getConversations error:", err);
        res.status(500).json({ message: "Server error" });
    }
}
export async function addMessage(sender, receiver, content) {
    try {
    }
    catch (err) {
        console.error("addMessage error:", err);
        return null;
    }
}
export async function getMessages(req, res) {
    try {
        res.status(200).json(updatedMessages);
    }
    catch (err) {
        console.error("getMessages error:", err);
        res.status(500).json({ message: "Server error" });
    }
}
//# sourceMappingURL=messagesControllers.js.map