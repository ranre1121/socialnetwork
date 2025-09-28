import { useState, useEffect } from "react";
import { X, Loader2, UserPlus } from "lucide-react";
import profilePlaceholder from "../../public/images/profile-placeholder.png";
import { useUser } from "../context/UserContext";
import { Plus } from "lucide-react";

interface AddFriendModalProps {
  onClose: () => void;
}

const AddFriendModal = ({ onClose }: AddFriendModalProps) => {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const handleAddRequest = async (receiverUsername: string) => {
    const token = localStorage.getItem("token");
    await fetch("http://localhost:8000/friends/add", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        senderUsername: user?.username,
        receiverUsername,
      }),
    });
  };

  useEffect(() => {
    if (!query.trim()) {
      setMatches([]);
      setLoading(false);
      return;
    }

    // immediately show loader while waiting for debounce + fetch
    setLoading(true);

    const timeout = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
          return;
        }

        const res = await fetch("http://localhost:8000/friends/find", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            query,
            currentUser: user?.username, // 🔹 include this
          }),
        });

        if (res.status === 401) {
          localStorage.removeItem("token"); // invalid token cleanup
          window.location.href = "/login";
          return;
        }

        const data = await res.json();
        setMatches(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-[600px] h-[500px] bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <h1 className="text-xl font-semibold">Add a Friend</h1>

        <input
          type="text"
          placeholder="Search for friends..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />

        <div className="border-t border-gray-200" />

        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
          {query.trim() === "" ? (
            <p className="text-gray-400 self-center mt-4">
              Start typing to search…
            </p>
          ) : loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
            </div>
          ) : matches.length === 0 ? (
            <p className="text-gray-500 self-center mt-4">No matches found</p>
          ) : (
            matches.map((m, i) => (
              <div
                key={i}
                className="py-2 rounded-lg cursor-pointer flex items-center gap-3"
              >
                <img
                  src={profilePlaceholder}
                  className="size-10 rounded-full"
                />
                <span className="leading-5">
                  <p>
                    {m.name} {m.surname}
                  </p>
                  <p className="text-sm text-gray-500">@{m.username}</p>
                </span>

                {/* Actions */}
                <div className="ml-auto">
                  {m.alreadySent ? (
                    <X />
                  ) : m.alreadyReceived ? (
                    <Plus />
                  ) : (
                    <UserPlus
                      className="hover:text-blue-500 cursor-pointer"
                      onClick={async () => {
                        await handleAddRequest(m.username);
                        // 🔹 Update state to reflect new "sent" request
                        setMatches((prev) =>
                          prev.map((u) =>
                            u.username === m.username
                              ? { ...u, alreadySent: true }
                              : u
                          )
                        );
                      }}
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

export default AddFriendModal;
