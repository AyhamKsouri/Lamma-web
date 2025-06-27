import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Trash2, MessageSquare } from "lucide-react";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Settings</h1>
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Change Email Section */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-xl">
          <div className="flex items-center mb-4">
            <Mail className="w-6 h-6 text-blue-500 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-800">Change Email</h2>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <Input
              type="email"
              placeholder="New email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white/80"
            />
            <Button className="bg-gradient-to-r from-blue-400 to-purple-500 text-white font-medium rounded-xl px-6 py-3 hover:opacity-90 transition">
              Update Email
            </Button>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-xl">
          <div className="flex items-center mb-4">
            <Lock className="w-6 h-6 text-green-500 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-800">Change Password</h2>
          </div>
          <div className="flex flex-col gap-4 mb-4">
            <Input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-white/80"
            />
            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-white/80"
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-white/80"
            />
          </div>
          <div className="text-right">
            <Button className="bg-gradient-to-r from-green-400 to-blue-400 text-white font-medium rounded-xl px-6 py-3 hover:opacity-90 transition">
              Update Password
            </Button>
          </div>
        </div>

        {/* Contact Us Section */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-xl">
          <div className="flex items-center mb-4">
            <MessageSquare className="w-6 h-6 text-indigo-500 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-800">Contact Us</h2>
          </div>
          <p className="text-gray-700 mb-4">
            Have a question or feedback? Reach out to our support team.
          </p>
          <Button className="flex items-center gap-2 border border-indigo-300 text-indigo-600 rounded-xl px-5 py-2 hover:bg-indigo-100 transition">
            <MessageSquare className="w-5 h-5" /> Send Message
          </Button>
        </div>

        {/* Delete Account Section */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-red-300">
          <div className="flex items-center mb-4">
            <Trash2 className="w-6 h-6 text-red-600 mr-2" />
            <h2 className="text-2xl font-semibold text-red-600">Delete Account</h2>
          </div>
          <p className="text-gray-700 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button className="flex items-center gap-2 bg-red-600 text-white rounded-xl px-5 py-3 hover:opacity-90 transition">
            <Trash2 className="w-5 h-5" /> Delete My Account
          </Button>
        </div>

      </div>
    </div>
  );
}
