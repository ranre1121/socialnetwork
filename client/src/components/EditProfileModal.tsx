import { useState } from "react";

type EditProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentBio: string;
  onSave: (name: string, bio: string) => Promise<void>;
};

const EditProfileModal = ({
  isOpen,
  onClose,
  currentName,
  currentBio,
  onSave,
}: EditProfileModalProps) => {
  const [name, setName] = useState(currentName);
  const [bio, setBio] = useState(currentBio);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(name, bio);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 w-[400px] shadow-xl"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Edit Profile
        </h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="p-2 rounded border dark:bg-gray-700 dark:text-white"
          />

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Bio"
            className="p-2 rounded border dark:bg-gray-700 dark:text-white"
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
              className="px-4 py-2 rounded bg-blue-600 text-white"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
