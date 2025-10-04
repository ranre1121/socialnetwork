import prisma from "../prisma.js";
export async function findFriends(req, res) {
    try {
        const currentUsername = req.user?.username;
        if (!currentUsername)
            return res.status(400).json({ msg: "Not authenticated" });
        const query = req.query.query?.toLowerCase().trim() || "";
        if (!query)
            return res.json([]);
        const currentUser = await prisma.user.findUnique({
            where: { username: currentUsername },
        });
        if (!currentUser)
            return res.status(404).json({ message: "User not found" });
        const userId = currentUser.id;
        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [{ requesterId: userId }, { addresseeId: userId }],
            },
        });
        const friendsIds = friendships
            .filter((f) => f.status === "ACCEPTED")
            .map((f) => (f.requesterId === userId ? f.addresseeId : f.requesterId));
        const requestsSentIds = friendships
            .filter((f) => f.status === "PENDING" && f.requesterId === userId)
            .map((f) => f.addresseeId);
        const requestsReceivedIds = friendships
            .filter((f) => f.status === "PENDING" && f.addresseeId === userId)
            .map((f) => f.requesterId);
        const users = await prisma.user.findMany({
            where: {
                id: { notIn: [userId, ...friendsIds] },
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
                alreadySent: requestsSentIds.includes(user.id),
                alreadyReceived: requestsReceivedIds.includes(user.id),
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
        if (!senderUsername) {
            return res.status(401).json({ msg: "Not authenticated" });
        }
        const { receiverUsername } = req.body;
        //sender
        const sender = await prisma.user.findUnique({
            where: { username: senderUsername },
        });
        if (!sender) {
            return res.status(400).json({ msg: "User not found" });
        }
        const senderId = sender.id;
        //receiver
        const receiver = await prisma.user.findUnique({
            where: { username: receiverUsername },
        });
        if (!receiver) {
            return res.status(400).json({ error: "User not found" });
        }
        const receiverId = receiver.id;
        //creating friendship
        const newFriendship = await prisma.friendship.create({
            data: { requesterId: senderId, addresseeId: receiverId },
        });
        return res.json({ newFriendship });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}
export async function cancelRequest(req, res) {
    try {
        const senderUsername = req.user?.username;
        if (!senderUsername) {
            return res.status(401).json({ msg: "Not authenticated" });
        }
        const { receiverUsername } = req.body;
        const sender = await prisma.user.findUnique({
            where: { username: senderUsername },
        });
        if (!sender) {
            return res.status(400).json({ msg: "Sender not found" });
        }
        const senderId = sender.id;
        const receiver = await prisma.user.findUnique({
            where: { username: receiverUsername },
        });
        if (!receiver) {
            return res.status(400).json({ error: "Receiver not found" });
        }
        const receiverId = receiver.id;
        const deleted = await prisma.friendship.deleteMany({
            where: {
                requesterId: senderId,
                addresseeId: receiverId,
                status: "PENDING",
            },
        });
        if (deleted.count === 0) {
            return res.status(404).json({ msg: "Friend request not found" });
        }
        return res.status(200).json({ msg: "Friend request cancelled" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Server error" });
    }
}
export async function getRequests(req, res) {
    try {
        const username = req.user?.username;
        if (!username)
            return res.status(400).json({ msg: "Not authenticated" });
        const type = req.query.type;
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user)
            return res.status(400).json({ msg: "User not found" });
        const userId = user.id;
        let requests = [];
        let usersId = [];
        if (type === "received") {
            requests = await prisma.friendship.findMany({
                where: { addresseeId: userId, status: "PENDING" },
                select: { requesterId: true },
            });
            usersId = requests?.map((r) => r.requesterId);
        }
        else if (type === "sent") {
            requests = await prisma.friendship.findMany({
                where: { requesterId: userId, status: "PENDING" },
                select: { addresseeId: true },
            });
            usersId = requests?.map((r) => r.addresseeId);
        }
        else {
            return res.status(400).json({ msg: "Invalid type" });
        }
        const users = await prisma.user.findMany({
            where: { id: { in: usersId } },
            select: { username: true, name: true },
        });
        return res.status(200).json(users);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Server error" });
    }
}
export async function acceptRequest(req, res) {
    try {
        const receiverUsername = req.user?.username;
        const { senderUsername } = req.body;
        if (!receiverUsername)
            return res.status(400).json({ msg: "Not authenticated" });
        const sender = await prisma.user.findUnique({
            where: { username: senderUsername },
        });
        if (!sender) {
            return res.status(400).json({ msg: "Sender not found" });
        }
        const senderId = sender.id;
        const receiver = await prisma.user.findUnique({
            where: { username: receiverUsername },
        });
        if (!receiver) {
            return res.status(400).json({ error: "Receiver not found" });
        }
        const receiverId = receiver.id;
        const updatedFriendship = await prisma.friendship.update({
            where: {
                //@ts-ignore
                requesterId_addresseeId: {
                    requesterId: senderId,
                    addresseeId: receiverId,
                },
            },
            data: {
                status: "ACCEPTED",
            },
        });
        res.json({ updatedFriendship });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Server error" });
    }
}
export function declineRequest(req, res) {
    const friends = loadFriends();
    const { receiverUsername, senderUsername } = req.body;
    const receiver = friends.find((f) => f.username === receiverUsername);
    const sender = friends.find((f) => f.username === senderUsername);
    if (!receiver || !sender) {
        return res.status(400).json({ error: "Invalid users" });
    }
    receiver.requestsReceived = receiver.requestsReceived.filter((u) => u !== senderUsername);
    sender.requestsSent = sender.requestsSent.filter((u) => u !== receiverUsername);
    saveFriends(friends);
    res.json({ message: "Friend request declined" });
}
// 📋 List friends
export function listFriends(req, res) {
    const users = loadUsers();
    const friends = loadFriends();
    const username = req.user?.username;
    if (!username)
        return res.status(401).json({ message: "Unauthorized" });
    const currentFriend = friends.find((f) => f.username === username);
    if (!currentFriend)
        return res.status(404).json({ message: "Friend data not found" });
    const result = currentFriend.friends.map((uname) => {
        const user = users.find((u) => u.username === uname);
        return {
            username: uname,
            name: user?.name || "",
        };
    });
    res.json(result);
}
// 🗑️ Delete friend
export function deleteFriend(req, res) {
    const friends = loadFriends();
    const { username, friendUsername } = req.body;
    const user = friends.find((f) => f.username === username);
    const friend = friends.find((f) => f.username === friendUsername);
    if (!user || !friend) {
        return res.status(400).json({ error: "Invalid users" });
    }
    user.friends = user.friends.filter((u) => u !== friendUsername);
    friend.friends = friend.friends.filter((u) => u !== username);
    saveFriends(friends);
    res.json({ message: "Friend deleted" });
}
//# sourceMappingURL=friendsControllers.js.map