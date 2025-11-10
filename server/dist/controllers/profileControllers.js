import prisma from "../prisma.js";
import multer from "multer";
import path from "path";
const storage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, "uploads/"),
    filename: (_, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });
export async function getProfile(req, res) {
    try {
        const username = req.params.username;
        const currentUser = req.user?.username;
        if (!username)
            return res.status(400).json({ error: "Enter a valid username" });
        if (!currentUser)
            return res.status(401).json({ error: "Not authorized" });
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const viewer = await prisma.user.findUnique({
            where: { username: currentUser },
            select: { id: true },
        });
        if (!viewer)
            return res.status(404).json({ error: "Viewer not found" });
        const friendships = await prisma.user.findUnique({
            where: {
                username: username,
            },
            select: { friends: true },
        });
        const userPosts = await prisma.post.findMany({
            where: { authorId: user.id },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        profilePicture: true,
                    },
                },
                likes: {
                    where: { id: viewer.id },
                    select: { id: true },
                },
                _count: { select: { comments: true, likes: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        const response = {
            username: user.username,
            name: user.name,
            bio: user.bio || "",
            friendsCount: friendships?.friends.length,
            profileOwner: currentUser === username,
            posts: userPosts.map((post) => ({
                id: post.id,
                content: post.content,
                createdAt: post.createdAt,
                author: post.author,
                liked: post.likes.length > 0,
                likesCount: post._count.likes,
                commentsCount: post._count.comments,
            })),
        };
        res.json(response);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load profile" });
    }
}
export const uploadProfilePic = upload.single("image");
export async function updateProfile(req, res) {
    try {
        const currentUser = req.user?.username;
        if (!currentUser)
            return res.status(401).json({ error: "Unauthorized" });
        const { name, bio } = req.body;
        let profilePictureUrl;
        profilePictureUrl = `http://localhost:8000/uploads/${req.file.filename}`;
        await prisma.user.update({
            where: { username: currentUser },
            data: {
                name,
                bio,
                ...(profilePictureUrl && { profilePicture: profilePictureUrl }),
            },
        });
        res.json({
            message: "Profile updated successfully",
            profilePicture: profilePictureUrl,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update profile" });
    }
}
//# sourceMappingURL=profileControllers.js.map