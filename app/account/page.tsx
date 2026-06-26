"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { updateUserProfile } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/Button";

export default function AccountProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setPhone(profile.phone);
    }
  }, [profile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage(null);
    try {
      await updateUserProfile(user.uid, { displayName, phone });
      await refreshProfile();
      setMessage("Profile updated.");
    } catch {
      setMessage("Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full h-11 px-4 rounded-xl border border-border bg-surface font-sans text-sm text-ink outline-none focus:[box-shadow:0_0_0_2px_hsl(var(--bg)),0_0_0_3px_hsl(var(--ring))]";

  return (
    <div className="max-w-lg">
      <h2 className="font-display text-display-sm text-ink mb-6">Profile</h2>
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div>
          <label className="block font-sans text-sm font-medium text-ink mb-1.5">Email</label>
          <input type="email" value={user?.email ?? ""} disabled className={`${inputClass} opacity-60`} />
        </div>
        <div>
          <label htmlFor="displayName" className="block font-sans text-sm font-medium text-ink mb-1.5">
            Display name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="phone" className="block font-sans text-sm font-medium text-ink mb-1.5">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
          />
        </div>
        {message && <p className="font-sans text-sm text-secondary-strong">{message}</p>}
        <Button type="submit" loading={saving}>Save changes</Button>
      </form>
    </div>
  );
}
