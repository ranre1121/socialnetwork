import { loadProfiles, saveProfiles } from "../utils/profilesUtils.js";
import { loadUsers } from "../utils/authUtils.js";
import { loadFriends } from "../utils/friendsUtils.js";
export function getProfile(req, res) {
    try {
        const username = req.params.username;
        const currentUser = req.user.username;
        const users = loadUsers();
        const profiles = loadProfiles();
        const friends = loadFriends();
        const user = users.find((u) => u.username === username);
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const profile = profiles.find((p) => p.username === username) || {};
        const friendEntry = friends.find((f) => f.username === username);
        const response = {
            username: user.username,
            name: user.name,
            bio: profile.bio || "",
            friendsCount: friendEntry?.friends.length || 0,
            profileOwner: currentUser === username,
        };
        res.json(response);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load profile" });
    }
}
export function updateProfile(req, res) {
    try {
        const username = req.user?.username;
        if (!username)
            return res.status(401).json({ error: "Unauthorized" });
        const { bio } = req.body;
        const profiles = loadProfiles();
        let profile = profiles.find((p) => p.username === username);
        if (profile) {
            profile.bio = bio;
        }
        else {
            profile = { username, bio };
            profiles.push(profile);
        }
        saveProfiles(profiles);
        res.json({ message: "Profile updated successfully", profile });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update profile" });
    }
}
//# sourceMappingURL=profileControllers.js.map