import { FC, useState, ChangeEvent, FormEvent } from "react";
import { User, Camera, Save, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";

const EditProfilePage: FC = () => {
  const { user, reloadUser } = useAuth();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.profileImage || "/placeholder.svg");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Profile Info form fields
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadPicture = async () => {
    if (!avatarFile) {
      alert("Please select an image first!");
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append("profileImage", avatarFile);

    try {
      setIsUploading(true);
      setUploadProgress(0);

      await api.put("/api/user-account/profile-image", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          const percentCompleted = Math.round((event.loaded * 100) / (event.total || 1));
          setUploadProgress(percentCompleted);
        },
      });

      await reloadUser();
      alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload profile picture.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSaveProfileInfo = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?._id) {
      alert("User ID not available.");
      return;
    }

    try {
      setIsSaving(true);
      await api.put(`/api/user-account/${user._id}`, formData);
      await reloadUser();
      alert("Profile info updated successfully!");
    } catch (error) {
      console.error("Profile update failed:", error);
      alert("Failed to update profile info.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-2xl animate-pulse-once">
      <div className="flex flex-col items-center gap-8 pb-8 relative">
        <div className="relative">
          <Avatar className="h-32 w-32 border-4 border-cyan-400 shadow-lg transform hover:scale-105 transition-transform duration-300">
            <AvatarImage src={avatarPreview} alt="Profile picture" className="rounded-full object-cover" />
            <AvatarFallback className="bg-cyan-200 text-cyan-800 font-bold">
              {user?.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <Sparkles className="absolute -top-4 -right-4 h-8 w-8 text-yellow-400 animate-pulse" />
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-2 text-lg font-semibold text-cyan-600 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-500 transition-colors">
          <Camera className="h-6 w-6" />
          <span>Change Avatar</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </label>

        {uploadProgress > 0 && (
          <div className="w-full mt-4">
            <div className="h-3 w-full bg-gray-300 rounded-full overflow-hidden">
              <div
                className="h-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="text-center text-md text-gray-700 dark:text-gray-300 mt-2 font-fun">
              {uploadProgress}%
            </div>
          </div>
        )}

        <Button
          onClick={handleUploadPicture}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-200"
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <span className="mr-2">Uploading...</span>
              <span className="animate-spin">✨</span>
            </>
          ) : "Upload New Avatar"}
        </Button>
      </div>

      <form onSubmit={handleSaveProfileInfo} className="space-y-6 mt-10 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <div>
          <label htmlFor="name" className="block text-md font-medium mb-2 text-gray-900 dark:text-gray-100">
            Name
          </label>
          <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required className="w-full border-cyan-300 focus:border-cyan-500 focus:ring-cyan-500" />
        </div>

        <div>
          <label htmlFor="phone" className="block text-md font-medium mb-2 text-gray-900 dark:text-gray-100">
            Phone Number
          </label>
          <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border-cyan-300 focus:border-cyan-500 focus:ring-cyan-500" />
        </div>

        <div>
          <label htmlFor="bio" className="block text-md font-medium mb-2 text-gray-900 dark:text-gray-100">
            Bio
          </label>
          <Input id="bio" name="bio" value={formData.bio} onChange={handleInputChange} className="w-full border-cyan-300 focus:border-cyan-500 focus:ring-cyan-500" />
        </div>

        <Button type="submit" className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-200">
          {isSaving ? (
            <>
              <span className="mr-2">Saving...</span>
              <span className="animate-spin">✨</span>
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Save Profile
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default EditProfilePage;