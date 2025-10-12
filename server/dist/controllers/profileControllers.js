import prisma from "../prisma.js";
export async function getProfile(req, res) {
    try {
        const username = req.params.username;
        const currentUser = req.user?.username;
        if (!username)
            return res.status(200).json({ msg: "Enter a valid username" });
        if (!currentUser)
            return res.status(200).json({ msg: "Not authorized" });
        const user = await prisma.user.findUnique({
            where: { username },
            select: { name: true, username: true, bio: true, id: true },
        });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [{ requesterId: user.id }, { addresseeId: user.id }],
                status: "ACCEPTED",
            },
        });
        const userPosts = await prisma.post.findMany({
            where: { authorId: user.id },
            include: { author: { select: { id: true, name: true, username: true } } },
        });
        const response = {
            username: user.username,
            name: user.name,
            bio: user.bio || "",
            friendsCount: friendships.length,
            profileOwner: currentUser === username,
            posts: userPosts,
        };
        res.json(response);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load profile" });
    }
}
export async function updateProfile(req, res) {
    try {
        const currentUser = req.user?.username;
        if (!currentUser)
            return res.status(401).json({ error: "Unauthorized" });
        const { name, bio, isProfileOwner } = req.body;
        if (!isProfileOwner)
            return res.status(400).json({ error: "No access" });
        await prisma.user.update({
            where: { username: currentUser },
            data: { name, bio },
        });
        res.json({ message: "Profile updated successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update profile" });
    }
}
//# sourceMappingURL=profileControllers.js.map