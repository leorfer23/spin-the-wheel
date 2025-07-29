import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import {
  Lock,
  ChevronRight,
  Mail,
  Calendar,
  Building2,
} from "lucide-react";

interface UserSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserSettingsDialog({
  open,
  onOpenChange,
}: UserSettingsDialogProps) {
  const { user } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setPasswordError("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setIsChangingPassword(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setPasswordError(error.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-b from-gray-50 to-white border-b">
          <DialogTitle className="text-xl font-semibold">Account</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-6">
          {/* User Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-semibold">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  {user?.email?.split("@")[0] || "User"}
                </h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 py-2">
              <Mail className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm font-medium">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 py-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Member since</p>
                <p className="text-sm font-medium">
                  {formatDate(user?.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 py-2">
              <Building2 className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Store</p>
                <p className="text-sm font-medium">Demo Store</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            {!isChangingPassword ? (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium">Change Password</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
            ) : (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-sm">
                    New Password
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="h-9"
                  />
                </div>
                {passwordError && (
                  <p className="text-sm text-red-500">{passwordError}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setNewPassword("");
                      setConfirmPassword("");
                      setPasswordError("");
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handlePasswordChange}
                    disabled={isLoading}
                  >
                    {isLoading ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sign Out */}
          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}