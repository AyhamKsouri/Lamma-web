
// src/pages/Profile.tsx
import React, { FC, useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';

const Profile: FC = () => {
  const { user, setUser } = useUser();

  // State for profile fields
  const [avatarPreview, setAvatarPreview] = useState<string>(user.avatarUrl);
  const [firstName, setFirstName]         = useState('Jane');
  const [lastName, setLastName]           = useState('Doe');
  const [email, setEmail]                 = useState('jane.doe@example.com');
  const [phone, setPhone]                 = useState('');
  const [location, setLocation]           = useState('');
  const [bio, setBio]                     = useState('');
  const [twitter, setTwitter]             = useState('');
  const [linkedin, setLinkedin]           = useState('');

  // Validation errors
  const [emailError, setEmailError]       = useState('');
  const [phoneError, setPhoneError]       = useState('');

  // Load saved profile from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('userProfile');
    if (saved) {
      const obj = JSON.parse(saved);
      if (obj.avatar) setAvatarPreview(obj.avatar);
      setFirstName(obj.firstName || '');
      setLastName(obj.lastName || '');
      setEmail(obj.email || '');
      setPhone(obj.phone || '');
      setLocation(obj.location || '');
      setBio(obj.bio || '');
      setTwitter(obj.twitter || '');
      setLinkedin(obj.linkedin || '');
      // Also sync context avatar if different
      if (obj.avatar && obj.avatar !== user.avatarUrl) {
        setUser({ ...user, avatarUrl: obj.avatar });
      }
    }
  }, []);

  // Handle avatar upload and preview as data URL
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        // update context avatar
        setUser({ ...user, avatarUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate email and phone on blur
  const validateEmail = () => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(re.test(email) ? '' : 'Enter a valid email');
  };
  const validatePhone = () => {
    const re = /^\+?[0-9]{7,15}$/;
    setPhoneError(!phone || re.test(phone) ? '' : 'Enter a valid phone number');
  };

  // Handle form submission: save to localStorage
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    validateEmail();
    validatePhone();
    if (emailError || phoneError) return;

    const profile = {
      avatar: avatarPreview,
      firstName,
      lastName,
      email,
      phone,
      location,
      bio,
      twitter,
      linkedin,
    };
    localStorage.setItem('userProfile', JSON.stringify(profile));
    alert('Profile saved locally!');
  };

  return (
    <div className="max-w-3xl mx-auto py-6 animate-fade-in">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
        <div>
          <img
            src={avatarPreview}
            alt="Profile avatar"
            className="w-24 h-24 rounded-full object-cover border-2 border-indigo-600"
          />
          <label className="block mt-2 text-sm text-indigo-600 hover:underline cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            Change Avatar
          </label>
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            {firstName} {lastName}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{email}</p>
        </div>
      </div>

      {/* Edit Profile Form */}
      <form onSubmit={handleSubmit} className="form-card mt-6 space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input
              type="text"
              className="form-input"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              className="form-input"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={validateEmail}
            required
          />
          {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
        </div>

        {/* Phone & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              value={phone}
              placeholder="+1234567890"
              onChange={e => setPhone(e.target.value)}
              onBlur={validatePhone}
            />
            {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              className="form-input"
              value={location}
              placeholder="City, Country"
              onChange={e => setLocation(e.target.value)}
            />
          </div>
        </div>

        {/* About Me */}
        <div className="form-group">
          <label className="form-label">About Me</label>
          <textarea
            className="form-textarea"
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Tell us something about yourself..."
          />
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label">Twitter</label>
            <input
              type="url"
              className="form-input"
              value={twitter}
              placeholder="https://twitter.com/yourhandle"
              onChange={e => setTwitter(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">LinkedIn</label>
            <input
              type="url"
              className="form-input"
              value={linkedin}
              placeholder="https://linkedin.com/in/yourprofile"
              onChange={e => setLinkedin(e.target.value)}
            />
          </div>
        </div>

        {/* Save Changes */}
        <div className="form-group text-right">
          <button type="submit" className="form-submit">Save Changes</button>
        </div>
      </form>
    </div>
  );
};

export default Profile;

