import { FC, useState, ChangeEvent, FormEvent, useEffect } from "react";
import { User, Camera, Mail, Phone, MapPin, Twitter, Instagram, Save } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Profile: FC = () => {
  const [avatarPreview, setAvatarPreview] = useState<string>("/placeholder.svg");
  const [formData, setFormData] = useState({
    firstName: "Jane",
    lastName: "Doe",
    email: "jane.doe@example.com",
    phone: "",
    location: "",
    bio: "",
    twitter: "",
    instagram: ""
  });

  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    twitter: "",
    instagram: ""
  });

  useEffect(() => {
    const saved = localStorage.getItem("userProfile");
    if (saved) {
      try {
        const obj = JSON.parse(saved);
        if (obj.avatar) setAvatarPreview(obj.avatar);

        setFormData({
          firstName: obj.firstName || "",
          lastName: obj.lastName || "",
          email: obj.email || "",
          phone: obj.phone || "",
          location: obj.location || "",
          bio: obj.bio || "",
          twitter: obj.twitter || "",
          instagram: obj.instagram || ""
        });
      } catch (error) {
        console.error("Error parsing saved profile:", error);
      }
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name in errors) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^\+?[0-9]{7,15}$/;
    const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/;

    if (!emailPattern.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }
    if (formData.phone && !phonePattern.test(formData.phone)) {
      newErrors.phone = "Enter a valid phone number";
      valid = false;
    }
    if (formData.twitter && !urlPattern.test(formData.twitter)) {
      newErrors.twitter = "Please enter a valid URL";
      valid = false;
    }
    if (formData.instagram && !urlPattern.test(formData.instagram)) {
      newErrors.instagram = "Please enter a valid URL";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      const profile = { avatar: avatarPreview, ...formData };
      localStorage.setItem("userProfile", JSON.stringify(profile));
      alert("Profile updated successfully");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl animate-fade-in">
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-semibold">My Profile</CardTitle>
          <CardDescription>Manage your personal information and preferences</CardDescription>
        </CardHeader>

        <CardContent className="pb-0">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarImage src={avatarPreview} alt="Profile picture" />
                <AvatarFallback>
                  <User className="h-12 w-12 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <label className="mt-2 flex cursor-pointer items-center gap-1 text-sm font-medium text-primary hover:text-primary/80">
                <Camera className="h-4 w-4" />
                <span>Change</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <div>
              <h2 className="text-xl font-medium">{formData.firstName} {formData.lastName}</h2>
              <p className="text-muted-foreground">{formData.email}</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-1">First Name</label>
                <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-1">Last Name</label>
                <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <div className="flex">
                <Mail className="mr-2 h-4 w-4 opacity-70 self-center" />
                <Input id="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number</label>
                <div className="flex">
                  <Phone className="mr-2 h-4 w-4 opacity-70 self-center" />
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                </div>
                {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-1">Location</label>
                <div className="flex">
                  <MapPin className="mr-2 h-4 w-4 opacity-70 self-center" />
                  <Input id="location" name="location" value={formData.location} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium mb-1">About Me</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="twitter" className="block text-sm font-medium mb-1">Twitter</label>
                <div className="flex">
                  <Twitter className="mr-2 h-4 w-4 opacity-70 self-center" />
                  <Input id="twitter" name="twitter" value={formData.twitter} onChange={handleChange} placeholder="https://twitter.com/yourhandle" />
                </div>
                {errors.twitter && <p className="text-sm text-destructive mt-1">{errors.twitter}</p>}
              </div>

              <div>
                <label htmlFor="instagram" className="block text-sm font-medium mb-1">Instagram</label>
                <div className="flex">
                  <Instagram className="mr-2 h-4 w-4 opacity-70 self-center" />
                  <Input id="instagram" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/yourhandle" />
                </div>
                {errors.instagram && <p className="text-sm text-destructive mt-1">{errors.instagram}</p>}
              </div>
            </div>

            <CardFooter className="flex justify-end px-0 pb-0 pt-4">
              <Button type="submit" className="min-w-[120px]">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;