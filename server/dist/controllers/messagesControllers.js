import prisma from "../prisma.js";
export async function getConversations(req, res) {
    try {
        const currentUsername = req.user?.username;
        if (!currentUsername)
            return res.status(200).json({ msg: "no username provided" });
        const currentUser = await prisma.user.findUnique({
            where: { username: currentUsername },
        });
        if (!currentUser)
            return res.status(200).json({ msg: "user was not found" });
        const c = await prisma.chat.findMany({
            where: {
                OR: [
                    { participant1Id: currentUser?.id },
                    { participant2Id: currentUser.id },
                ],
            },
            include: {
                participant1: { select: { username: true, name: true } },
                participant2: { select: { username: true, name: true } },
            },
        });
        const conversations = c.map((c) => ({
            ...c,
            companion: c.participant1Id === currentUser.id ? c.participant2 : c.participant1,
        }));
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