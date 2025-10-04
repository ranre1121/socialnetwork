import { loadUsers } from "../utils/authUtils.js";
import { loadFriends, saveFriends } from "../utils/friendsUtils.js";
export function findFriends(req, res) {
    const users = loadUsers();
    const friends = loadFriends();
    const currentUsername = req.user.username;
    const query = req.query.query?.toLowerCase().trim() || "";
    if (!query) {
        return res.json([]);
    }
    const currentFriend = friends.find((f) => f.username === currentUsername);
    const tokens = query.split(/\s+/);
    const matches = users
        .filter((u) => {
        if (u.username === currentUsername)
            return false;
        if (currentFriend?.friends.includes(u.username))
            return false;
        return true;
    })
        .map((u) => {
        const name = u.name.toLowerCase();
        const username = u.username.toLowerCase();
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
        const alreadySent = currentFriend?.requestsSent.includes(u.username) ?? false;
        const alreadyReceived = currentFriend?.requestsReceived.includes(u.username) ?? false;
        return {
            name: u.name,
            username: u.username,
            score,
            alreadySent,
            alreadyReceived,
        };
    })
        .filter((u) => u.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    res.json(matches);
}
// ➕ Send friend request
export function addRequest(req, res) {
    const friends = loadFriends();
    const { senderUsername, receiverUsername } = req.body;
    const sender = friends.find((f) => f.username === senderUsername);
    const receiver = friends.find((f) => f.username === receiverUsername);
    if (!sender || !receiver) {
        return res.status(400).json({ error: "Invalid users" });
    }
    if (!sender.requestsSent.includes(receiverUsername)) {
        sender.requestsSent.push(receiverUsername);
    }
    if (!receiver.requestsReceived.includes(senderUsername)) {
        receiver.requestsReceived.push(senderUsername);
    }
    saveFriends(friends);
    res.json({ message: "Friend request sent" });
}
// ❌ Cancel request
export function cancelRequest(req, res) {
    const friends = loadFriends();
    const { senderUsername, receiverUsername } = req.body;
    const sender = friends.find((f) => f.username === senderUsername);
    const receiver = friends.find((f) => f.username === receiverUsername);
    if (!sender || !receiver) {
        return res.status(400).json({ error: "Invalid users" });
    }
    sender.requestsSent = sender.requestsSent.filter((u) => u !== receiverUsername);
    receiver.requestsReceived = receiver.requestsReceived.filter((u) => u !== senderUsername);
    saveFriends(friends);
    res.json({ message: "Friend request cancelled" });
}
// 📥 Get requests
export function getRequests(req, res) {
    const users = loadUsers();
    const friends = loadFriends();
    const username = req.user?.username;
    const type = req.query.type;
    if (!username)
        return res.status(401).json({ error: "Unauthorized" });
    if (!type)
        return res.status(400).json({ error: "Missing type parameter" });
    const currentFriend = friends.find((f) => f.username === username);
    if (!currentFriend)
        return res.status(404).json({ error: "Friend data not found" });
    let list = [];
    if (type === "received")
        list = currentFriend.requestsReceived || [];
    if (type === "sent")
        list = currentFriend.requestsSent || [];
    const result = list
        .map((uname) => users.find((u) => u.username === uname))
        .filter(Boolean)
        .map((u) => ({
        username: u.username,
        name: u.name,
    }));
    res.json(result);
}
// ✅ Accept request
export function acceptRequest(req, res) {
    const friends = loadFriends();
    const { receiverUsername, senderUsername } = req.body;
    const receiver = friends.find((f) => f.username === receiverUsername);
    const sender = friends.find((f) => f.username === senderUsername);
    if (!receiver || !sender) {
        return res.status(400).json({ error: "Invalid users" });
    }
    receiver.requestsReceived = receiver.requestsReceived.filter((u) => u !== senderUsername);
    sender.requestsSent = sender.requestsSent.filter((u) => u !== receiverUsername);
    if (!receiver.friends.includes(senderUsername)) {
        receiver.friends.push(senderUsername);
    }
    if (!sender.friends.includes(receiverUsername)) {
        sender.friends.push(receiverUsername);
    }
    saveFriends(friends);
    res.json({ message: "Friend request accepted" });
}
// 🚫 Decline request
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