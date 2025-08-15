"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Shield, Key, Trash2 } from "lucide-react"
import { changePassword, signOut } from "@/lib/actions"

interface SecuritySettingsProps {
  user: any
}

export function SecuritySettings({ user }: SecuritySettingsProps) {
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match!")
      return
    }

    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters long!")
      return
    }

    setIsChangingPassword(true)

    try {
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      if (result.success) {
        alert("Password changed successfully!")
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      } else {
        alert(result.error || "Failed to change password")
      }
    } catch (error) {
      console.error("Error changing password:", error)
      alert("Failed to change password")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.",
    )

    if (confirmed) {
      const doubleConfirm = window.confirm(
        "This will permanently delete your account and all associated data. Type 'DELETE' to confirm.",
      )

      if (doubleConfirm) {
        // In a real app, you'd implement account deletion
        alert("Account deletion is not implemented in this demo.")
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="mr-2 h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                required
              />
            </div>
            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>Your account details and security information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email Address</Label>
            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
          </div>
          <div>
            <Label>Account Created</Label>
            <p className="text-sm text-muted-foreground mt-1">{new Date(user.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <Label>Last Sign In</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "Never"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <Trash2 className="mr-2 h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
          <div>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              This will permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
