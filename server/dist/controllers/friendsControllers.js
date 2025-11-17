import prisma from "../prisma.js";
export async function findFriends(req, res) {
    try {
        const currentUsername = req.user?.username;
        if (!currentUsername)
            return res.status(401).json({ msg: "Not authenticated" });
        const query = req.query.query?.toLowerCase().trim() || "";
        if (!query)
            return res.json([]);
        const currentUser = await prisma.user.findUnique({
            where: { username: currentUsername },
        });
        if (!currentUser)
            return res.status(404).json({ message: "User not found" });
        const friendRequests = await prisma.friendRequest.findFirst({
            where: {
                OR: [{ requesterId: currentUser.id }, { receiverId: currentUser.id }],
            },
            include: { requester: true, receiver: true },
        });
        const friends = await prisma.user.findMany({
            where: { id: currentUser.id },
            select: { friends: { select: { id: true } } },
        });
        const friendIds = friends.flatMap((user) => user.friends.map((f) => f.id));
        const users = await prisma.user.findMany({
            where: {
                id: { notIn: friendIds },
            },
        });
        const tokens = query.split(/\s+/);
        const matches = users
            .map((user) => {
            const name = user.name.toLowerCase();
            const username = user.username.toLowerCase();
            let score = 0;
            for (const token of tokens) {
                if (name.startsWith(token))
                    score += 2;
                if (username.startsWith(token))
                    score += 3;
                if (name.includes(token))
                    score += 1;
                if (username.includes(token))
                    score += 2;
            }
            return {
                name: user.name,
                username: user.username,
                score,
                profilePicture: user.profilePicture,
                alreadySent: friendRequests?.requester.id === currentUser.id,
                alreadyReceived: friendRequests?.receiver.id === currentUser.id,
            };
        })
            .filter((u) => u.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
        return res.json(matches);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}
export async function addRequest(req, res) {
    try {
        const senderUsername = req.user?.username;
        if (!senderUsername)
            return res.status(401).json({ msg: "Not authenticated" });
        const { receiverUsername } = req.body;
        if (!receiverUsername)
            return res.status(400).json({ msg: "Receiver username required" });
        const sender = await prisma.user.findUnique({
            where: { username: senderUsername },
        });
        const receiver = await prisma.user.findUnique({
            where: { username: receiverUsername },
        });
        if (!sender || !receiver)
            return res.status(400).json({ msg: "Invalid users" });
        const existing = await prisma.friendRequest.findFirst({
            where: {
                OR: [
                    { requesterId: sender.id, receiverId: receiver.id },
                    { requesterId: receiver.id, receiverId: sender.id },
                ],
            },
        });
        if (existing)
            return res
                .status(400)
                .json({ msg: "Friendship or request already exists" });
        const newFriendship = await prisma.friendRequest.create({
            data: { requesterId: sender.id, receiverId: receiver.id },
        });
        return res.status(200).json({ newFriendship });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}
export async function cancelRequest(req, res) {
    try {
        const senderUsername = req.user?.username;
        if (!senderUsername)
            return res.status(401).json({ msg: "Not authenticated" });
        const { receiverUsername } = req.body;
        if (!receiverUsername)
            return res.status(400).json({ msg: "Receiver username required" });
        const sender = await prisma.user.findUnique({
            where: { username: senderUsername },
        });
        const receiver = await prisma.user.findUnique({
            where: { username: receiverUsername },
        });
        if (!sender || !receiver)
            return res.status(400).json({ msg: "Invalid users" });
        const deleted = await prisma.friendRequest.deleteMany({
            where: {
                requesterId: sender.id,
                receiverId: receiver.id,
            },
        });
        if (deleted.count === 0)
            return res.status(404).json({ msg: "Friend request not found" });
        return res.status(200).json({ msg: "Friend request cancelled" });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "Server error" });
    }
}
export async function getRequests(req, res) {
    try {
        const username = req.user?.username;
        if (!username)
            return res.status(401).json({ msg: "Not authenticated" });
        const type = req.query.type;
        if (!["sent", "received"].includes(type))
            return res.status(400).json({ msg: "Invalid type" });
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user)
            return res.status(400).json({ msg: "User not found" });
        const requests = await prisma.friendRequest.findMany({
            where: type === "sent" ? { requesterId: user.id } : { receiverId: user.id },
            include: {
                requester: type === "received" && true,
                receiver: type === "sent" && true,
            },
        });
        return res.status(200).json(requests);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "Server error" });
    }
}
export async function acceptRequest(req, res) {
    try {
        const receiverUsername = req.user?.username;
        const { senderUsername } = req.body;
        if (!receiverUsername)
            return res.status(401).json({ msg: "Not authenticated" });
        if (!senderUsername)
            return res.status(400).json({ msg: "Sender username required" });
        const sender = await prisma.user.findUnique({
            where: { username: senderUsername },
        });
        const receiver = await prisma.user.findUnique({
            where: { username: receiverUsername },
        });
        if (!sender || !receiver)
            return res.status(400).json({ msg: "Invalid users" });
        await prisma.friendRequest.deleteMany({
            where: {
                requesterId: sender.id,
                receiverId: receiver.id,
            },
        });
        await prisma.user.update({
            where: { username: receiverUsername },
            data: { friends: { connect: { id: sender.id } } },
        });
        await prisma.user.update({
            where: { username: senderUsername },
            data: { friends: { connect: { id: receiver.id } } },
        });
        await prisma.chat.create({
            data: {
                participant1Id: sender.id,
                participant2Id: receiver.id,
            },
        });
        return res.status(200).json({ msg: "Friend request accepted" });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "Server error" });
    }
}
export async function declineRequest(req, res) {
    try {
        const receiverUsername = req.user?.username;
        const { senderUsername } = req.body;
        if (!receiverUsername)
            return res.status(401).json({ msg: "Not authenticated" });
        if (!senderUsername)
            return res.status(400).json({ msg: "Sender username required" });
        const sender = await prisma.user.findUnique({
            where: { username: senderUsername },
        });
        const receiver = await prisma.user.findUnique({
            where: { username: receiverUsername },
        });
        if (!sender || !receiver)
            return res.status(400).json({ msg: "Invalid users" });
        const deleted = await prisma.friendRequest.deleteMany({
            where: {
                requesterId: sender.id,
                receiverId: receiver.id,
            },
        });
        if (deleted.count === 0)
            return res.status(404).json({ msg: "Request not found" });
        return res.status(200).json({ msg: "Friend request declined" });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "Server error" });
    }
}
export async function listFriends(req, res) {
    try {
        const currentUser = req.user?.username;
        if (!currentUser)
            return res.status(401).json({ message: "Unauthorized" });
        const username = req.params.username;
        if (!username)
            return res.status(400).json({ msg: "No username provided" });
        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                friends: {
                    select: { name: true, username: true, profilePicture: true },
                },
            },
        });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        return res.status(200).json(user.friends);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}
export async function deleteFriend(req, res) {
    try {
        const username = req.user?.username;
        const { friendUsername } = req.body;
        if (!username)
            return res.status(401).json({ message: "Unauthorized" });
        if (!friendUsername)
            return res.status(400).json({ message: "Friend username required" });
        const user = await prisma.user.findUnique({ where: { username } });
        const friend = await prisma.user.findUnique({
            where: { username: friendUsername },
        });
        if (!user || !friend)
            return res.status(400).json({ error: "Invalid users" });
        await prisma.user.update({
            where: {
                username: username,
            },
            data: { friends: { disconnect: { username: friend.username } } },
        });
        await prisma.user.update({
            where: { username: friend.username },
            data: { friends: { disconnect: { username: user.username } } },
        });
        return res.status(200).json({ message: "Friend deleted" });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}
//# sourceMappingURL=friendsControllers.js.map