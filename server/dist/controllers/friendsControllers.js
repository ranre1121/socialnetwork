import { loadUsers, saveUser } from "../utils/authUtils.js";
export function findFriends(req, res) {
    const users = loadUsers();
    const currentUsername = req.body.currentUser; // who is searching
    const query = req.body.query?.toLowerCase() || "";
    if (!query.trim()) {
        return res.json([]);
    }
    const currentUser = users.find((u) => u.username === currentUsername);
    const matches = users
        .filter((u) => {
        // 🔹 hide self
        if (u.username === currentUsername)
            return false;
        // 🔹 hide existing friends
        if (currentUser?.friends.includes(u.username))
            return false;
        return true; // keep everyone else, even if requests exist
    })
        .map((u) => {
        const name = u.name.toLowerCase();
        const surname = u.surname?.toLowerCase() || "";
        const username = u.username.toLowerCase();
        let score = 0;
        if (name.startsWith(query))
            score += 2;
        if (surname.startsWith(query))
            score += 2;
        if (username.startsWith(query))
            score += 3;
        if (name.includes(query))
            score += 1;
        if (surname.includes(query))
            score += 1;
        if (username.includes(query))
            score += 2;
        const alreadySent = currentUser?.requestsSent.includes(u.username) ?? false;
        const alreadyReceived = currentUser?.requestsReceived.includes(u.username) ?? false;
        return {
            name: u.name,
            surname: u.surname,
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
export function addRequest(req, res) {
    const users = loadUsers();
    const { senderUsername, receiverUsername } = req.body;
    const sender = users.find((u) => u.username === senderUsername);
    const receiver = users.find((u) => u.username === receiverUsername);
    if (!sender || !receiver) {
        return res.status(400).json({ error: "Invalid users" });
    }
    // Make sure arrays exist
    sender.requestsSent = sender.requestsSent || [];
    receiver.requestsReceived = receiver.requestsReceived || [];
    // Avoid duplicates
    if (!sender.requestsSent.includes(receiverUsername)) {
        sender.requestsSent.push(receiverUsername);
    }
    if (!receiver.requestsReceived.includes(senderUsername)) {
        receiver.requestsReceived.push(senderUsername);
    }
    // ✅ Save all users back to file
    saveUser(users);
    res.json({ message: "Friend request sent" });
}
//# sourceMappingURL=friendsControllers.js.map