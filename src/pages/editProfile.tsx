import { FC, useState, ChangeEvent, FormEvent } from "react";
import { User, Camera, Save } from "lucide-react";
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
    email: user?.email || "",
    phone: user?.phone || "",
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
    <div className="container mx-auto px-4 py-8 max-w-3xl animate-fade-in">
      <div className="flex flex-col items-center gap-6 pb-6">
        <Avatar className="h-24 w-24 border-2 border-primary">
          <AvatarImage src={avatarPreview} alt="Profile picture" />
          <AvatarFallback>
            {user?.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <label className="mt-2 flex cursor-pointer items-center gap-1 text-sm font-medium text-primary hover:text-primary/80">
          <Camera className="h-4 w-4" />
          <span>Change</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </label>

        {uploadProgress > 0 && (
          <div className="w-full mt-2">
            <div className="h-2 w-full bg-gray-200 rounded-full">
              <div
                className="h-2 bg-cyan-500 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="text-center text-sm text-gray-500 mt-1">
              {uploadProgress}%
            </div>
          </div>
        )}

        <Button
          onClick={handleUploadPicture}
          className="mt-4 min-w-[140px]"
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload New Picture"}
        </Button>
      </div>

      <form onSubmit={handleSaveProfileInfo} className="space-y-6 mt-8">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <Input id="email" name="email" value={formData.email} onChange={handleInputChange} required />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Phone Number
          </label>
          <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
        </div>

        <Button type="submit" className="w-full mt-4" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Profile Info"}
        </Button>
      </form>
    </div>
  );
};

export default EditProfilePage;
