import fs from "fs";
import path from "path";
const messagesFile = path.join(process.cwd(), "data", "messages.json");
// Load all messages
export function loadMessages() {
    if (!fs.existsSync(messagesFile)) {
        return [];
    }
    const data = fs.readFileSync(messagesFile, "utf-8");
    try {
        return JSON.parse(data);
    }
    catch {
        return [];
    }
}
// Save all messages
export function saveMessages(messages) {
    fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
}
// Add a new message
export function addMessage(sender, receiver, content) {
    const messages = loadMessages();
    const newMessage = {
        //@ts-ignore
        id: messages.length > 0 ? messages[messages.length - 1].id + 1 : 1,
        sender,
        receiver,
        content,
        createdAt: new Date().toISOString(),
    };
    messages.push(newMessage);
    saveMessages(messages);
    return newMessage;
}
// Get chat history between two users
export function getChat(sender, receiver) {
    const messages = loadMessages();
    return messages.filter((m) => (m.sender === sender && m.receiver === receiver) ||
        (m.sender === receiver && m.receiver === sender));
}
//# sourceMappingURL=messagesUtils.js.map