"use client";
import { useState } from "react";
import { Upload } from "lucide-react";
import ImageComponent from "./ImageComponent";

type EditProfileModalProps = {
  onClose: () => void;
  currentName: string;
  currentBio: string;
  currentImage: string;
  onSave: (name: string, bio: string, imageUrl?: string) => Promise<void>;
};

const EditProfileModal = ({
  onClose,
  currentName,
  currentBio,
  currentImage,
  onSave,
}: EditProfileModalProps) => {
  const [name, setName] = useState(currentName);
  const [bio, setBio] = useState(currentBio);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(currentImage);
  const [uploading, setUploading] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let uploadedUrl = currentImage;

    if (file) {
      try {
        setUploading(true);
        const formData = new FormData();
        formData.append("image", file);
        formData.append("name", name);
        formData.append("bio", bio);
        formData.append("isProfileOwner", "true");

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/update`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        uploadedUrl = data.profilePicture;
      } catch {
        alert("Failed to upload image");
      } finally {
        setUploading(false);
      }
    } else {
      await onSave(name, bio);
    }

    await onSave(name, bio, uploadedUrl || undefined);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 w-[400px] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Edit Profile
        </h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center gap-3">
            <label
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              className="relative w-24 h-24 rounded-full overflow-hidden border border-gray-400 dark:border-gray-600 cursor-pointer group"
            >
              <ImageComponent src={preview} size={96} />
              <div
                className={`absolute inset-0 flex items-center justify-center transition ${
                  hovered ? "opacity-100" : "opacity-0"
                }`}
              >
                <Upload className="w-7 h-7 text-white drop-shadow" />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="p-2 rounded focus:outline-none dark:bg-gray-700 dark:text-white"
          />

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Bio"
            className="p-2 rounded dark:bg-gray-700 focus:outline-none dark:text-white"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-600 dark:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 rounded bg-blue-600 text-white"
            >
              {uploading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
