import fs from "fs";
import path from "path";

export type Message = {
  id: number;
  sender: string;
  receiver: string;
  content: string;
  createdAt: string;
};

const messagesFile = path.join(process.cwd(), "data", "messages.json");

// Load all messages
export function loadMessages(): Message[] {
  if (!fs.existsSync(messagesFile)) {
    return [];
  }
  const data = fs.readFileSync(messagesFile, "utf-8");
  try {
    return JSON.parse(data) as Message[];
  } catch {
    return [];
  }
}

// Save all messages
export function saveMessages(messages: Message[]): void {
  fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
}

// Add a new message
export function addMessage(
  sender: string,
  receiver: string,
  content: string
): Message {
  const messages = loadMessages();

  const newMessage: Message = {
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
export function getChat(sender: string, receiver: string): Message[] {
  const messages = loadMessages();
  return messages.filter(
    (m) =>
      (m.sender === sender && m.receiver === receiver) ||
      (m.sender === receiver && m.receiver === sender)
  );
}
