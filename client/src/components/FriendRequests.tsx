import { useState, useEffect } from "react";
import { X, Loader2, UserCheck, UserX } from "lucide-react";
import { useUser } from "../context/UserContext";
import profilePlaceholder from "../../public/images/profile-placeholder.png";

interface FriendRequestsModalProps {
  onClose: () => void;
}

const FriendRequestsModal = ({ onClose }: FriendRequestsModalProps) => {
  const { user } = useUser();
  const [type, setType] = useState<"received" | "sent">("received"); // default
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    if (!user) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:8000/friends/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username: user.username, type }),
    });
    const data = await res.json();
    setRequests(data);
    setLoading(false);
  };

  const handleAccept = async (senderUsername: string) => {
    const token = localStorage.getItem("token");
    await fetch("http://localhost:8000/friends/accept", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        receiverUsername: user?.username,
        senderUsername,
      }),
    });
    fetchRequests();
  };

  const handleDecline = async (senderUsername: string) => {
    const token = localStorage.getItem("token");
    await fetch("http://localhost:8000/friends/decline", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        receiverUsername: user?.username,
        senderUsername,
      }),
    });
    fetchRequests();
  };

  const handleCancel = async (receiverUsername: string) => {
    const token = localStorage.getItem("token");
    await fetch("http://localhost:8000/friends/cancel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        senderUsername: user?.username,
        receiverUsername,
      }),
    });
    fetchRequests();
  };

  useEffect(() => {
    fetchRequests();
  }, [type]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-[600px] h-[500px] bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <h1 className="text-xl font-semibold">Friend Requests</h1>

        {/* Toggle */}
        <div className="flex gap-4">
          <button
            className={`px-4 py-2 rounded-lg ${
              type === "received" ? "bg-blue-500 text-white" : "bg-gray-100"
            }`}
            onClick={() => setType("received")}
          >
            Received
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              type === "sent" ? "bg-blue-500 text-white" : "bg-gray-100"
            }`}
            onClick={() => setType("sent")}
          >
            Sent
          </button>
        </div>

        <div className="border-t border-gray-200" />

        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <p className="text-gray-500 self-center mt-4">No {type} requests</p>
          ) : (
            requests.map((r, i) => (
              <div
                key={i}
                className="py-2 rounded-lg flex items-center gap-3 border-b"
              >
                <img
                  src={profilePlaceholder}
                  className="size-10 rounded-full"
                />
                <span>
                  <p>
                    {r.name} {r.surname}
                  </p>
                  <p className="text-sm text-gray-500">@{r.username}</p>
                </span>

                <div className="ml-auto flex gap-2">
                  {type === "received" ? (
                    <>
                      <UserCheck
                        className="hover:text-green-500 cursor-pointer"
                        onClick={() => handleAccept(r.username)}
                      />
                      <UserX
                        className="hover:text-red-500 cursor-pointer"
                        onClick={() => handleDecline(r.username)}
                      />
                    </>
                  ) : (
                    <UserX
                      className="hover:text-red-500 cursor-pointer"
                      onClick={() => handleCancel(r.username)}
                    />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendRequestsModal;
