"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  updateBudgetName,
  updateInitialBalance,
  getInviteCode,
  regenerateInviteCode,
  removeMember,
  type SettingsMember,
} from "@/app/settings/actions";
import { useTranslation } from "@/lib/i18n";

type BudgetSettingsProps = {
  budgetId: string;
  budgetName: string;
  currency: string;
  initialBalance: number;
  members: SettingsMember[];
  isOwner: boolean;
  currentUserId: string;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (parts[0]?.[0] ?? "?").toUpperCase();
}

export function BudgetSettings({
  budgetId,
  budgetName,
  currency,
  initialBalance,
  members,
  isOwner,
  currentUserId,
}: BudgetSettingsProps) {
  const t = useTranslation();
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(budgetName);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [balanceValue, setBalanceValue] = useState(String(initialBalance));
  const [savingBalance, setSavingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const balanceInputRef = useRef<HTMLInputElement>(null);

  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);

  async function handleSaveName() {
    if (name.trim() === budgetName) {
      setIsEditingName(false);
      return;
    }
    setSaving(true);
    setNameError(null);
    const result = await updateBudgetName({ budgetId, name });
    setSaving(false);
    if (result.success) {
      setIsEditingName(false);
    } else {
      setNameError(result.error ?? t.common.error);
    }
  }

  function handleStartEditName() {
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  }

  function handleCancelEditName() {
    setName(budgetName);
    setIsEditingName(false);
    setNameError(null);
  }

  async function handleShowInvite() {
    if (inviteCode) {
      setShowInvite(true);
      return;
    }
    setInviteLoading(true);
    setInviteError(null);
    const result = await getInviteCode({ budgetId });
    setInviteLoading(false);
    if (result.inviteCode) {
      setInviteCode(result.inviteCode);
      setShowInvite(true);
    } else {
      setInviteError(result.error ?? t.common.error);
    }
  }

  async function handleRegenerate() {
    setInviteLoading(true);
    setInviteError(null);
    setCopied(false);
    const result = await regenerateInviteCode({ budgetId });
    setInviteLoading(false);
    if (result.inviteCode) {
      setInviteCode(result.inviteCode);
    } else {
      setInviteError(result.error ?? t.common.error);
    }
  }

  async function handleCopy() {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API not available
    }
  }

  async function handleSaveBalance() {
    const amount = parseFloat(balanceValue);
    if (isNaN(amount) || amount < 0) {
      setBalanceError("Please enter a valid non-negative amount.");
      return;
    }
    if (amount === initialBalance) {
      setIsEditingBalance(false);
      return;
    }
    setSavingBalance(true);
    setBalanceError(null);
    const result = await updateInitialBalance(amount);
    setSavingBalance(false);
    if (result.success) {
      setIsEditingBalance(false);
    } else {
      setBalanceError(result.error ?? t.common.error);
    }
  }

  function handleStartEditBalance() {
    setIsEditingBalance(true);
    setTimeout(() => balanceInputRef.current?.focus(), 0);
  }

  function handleCancelEditBalance() {
    setBalanceValue(String(initialBalance));
    setIsEditingBalance(false);
    setBalanceError(null);
  }

  async function handleRemoveMember(userId: string) {
    setRemovingUserId(userId);
    const result = await removeMember({ budgetId, userId });
    setRemovingUserId(null);
    if (!result.success) {
      console.error(result.error);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Budget Name */}
      <div className="space-y-3 rounded-3xl bg-surface-container-lowest p-6 transition-all hover:bg-surface-container">
        <div className="flex items-center gap-3 text-primary">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          <span className="text-xs font-bold uppercase tracking-wider">{t.settings.budgetName}</span>
        </div>
        {isEditingName ? (
          <div className="flex items-center gap-2">
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveName();
                if (e.key === "Escape") handleCancelEditName();
              }}
              className="min-w-0 flex-1 rounded-xl bg-surface-container-low px-3 py-1.5 text-sm text-on-surface focus:bg-primary-container/10 focus:outline-none transition-colors"
              disabled={saving}
            />
            <button
              onClick={handleSaveName}
              disabled={saving}
              className="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              {saving ? "..." : t.common.save}
            </button>
            <button
              onClick={handleCancelEditName}
              disabled={saving}
              className="rounded-xl bg-surface-container px-3 py-1.5 text-xs font-semibold text-outline transition-colors hover:text-on-surface disabled:opacity-50"
            >
              {t.common.cancel}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-on-surface">{budgetName}</p>
            {isOwner && (
              <button
                onClick={handleStartEditName}
                className="text-xs font-medium text-primary transition-colors hover:text-primary-hover"
              >
                {t.common.edit}
              </button>
            )}
          </div>
        )}
        {nameError && <p className="text-xs text-error">{nameError}</p>}
      </div>

      {/* Currency */}
      <div className="space-y-3 rounded-3xl bg-surface-container-lowest p-6 transition-all hover:bg-surface-container">
        <div className="flex items-center gap-3 text-primary">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
          </svg>
          <span className="text-xs font-bold uppercase tracking-wider">{t.settings.currency}</span>
        </div>
        <p className="text-lg font-semibold text-on-surface">{currency}</p>
      </div>

      {/* Initial Balance */}
      <div className="space-y-3 rounded-3xl bg-surface-container-lowest p-6 transition-all hover:bg-surface-container">
        <div className="flex items-center gap-3 text-primary">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs font-bold uppercase tracking-wider">{t.settings.initialBalance}</span>
        </div>
        {isEditingBalance ? (
          <div className="flex items-center gap-2">
            <input
              ref={balanceInputRef}
              type="number"
              min="0"
              step="0.01"
              value={balanceValue}
              onChange={(e) => setBalanceValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveBalance();
                if (e.key === "Escape") handleCancelEditBalance();
              }}
              className="min-w-0 flex-1 rounded-xl bg-surface-container-low px-3 py-1.5 text-sm text-on-surface focus:bg-primary-container/10 focus:outline-none transition-colors"
              disabled={savingBalance}
            />
            <button
              onClick={handleSaveBalance}
              disabled={savingBalance}
              className="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              {savingBalance ? "..." : t.common.save}
            </button>
            <button
              onClick={handleCancelEditBalance}
              disabled={savingBalance}
              className="rounded-xl bg-surface-container px-3 py-1.5 text-xs font-semibold text-outline transition-colors hover:text-on-surface disabled:opacity-50"
            >
              {t.common.cancel}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-on-surface">
                {currency} {initialBalance.toFixed(2)}
              </p>
              <p className="text-xs text-outline mt-0.5">{t.settings.initialBalanceDesc}</p>
            </div>
            {isOwner && (
              <button
                onClick={handleStartEditBalance}
                className="text-xs font-medium text-primary transition-colors hover:text-primary-hover"
              >
                {t.common.edit}
              </button>
            )}
          </div>
        )}
        {balanceError && <p className="text-xs text-error">{balanceError}</p>}
      </div>

      {/* Shared Members — full width */}
      <div className="rounded-3xl bg-surface-container-lowest p-6 md:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-primary">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider">{t.settings.sharedMembers}</span>
          </div>
          {isOwner && (
            <button
              onClick={handleShowInvite}
              disabled={inviteLoading}
              className="text-xs font-bold text-tertiary transition-colors hover:opacity-70 disabled:opacity-50"
            >
              {inviteLoading ? t.common.loading : t.settings.addPartner}
            </button>
          )}
        </div>

        {/* Members list */}
        <div className="flex flex-wrap gap-4">
          {members.map((member) => {
            const isCurrentUser = member.userId === currentUserId;
            return (
              <div
                key={member.userId}
                className="flex items-center gap-3 rounded-full bg-surface-container-low py-2 px-4"
              >
                {member.avatarUrl ? (
                  <Image
                    src={member.avatarUrl}
                    alt={member.fullName}
                    width={24}
                    height={24}
                    className="h-6 w-6 rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-container text-[10px] font-semibold text-on-surface">
                    {getInitials(member.fullName)}
                  </div>
                )}
                <span className="text-sm font-medium text-on-surface">
                  {isCurrentUser ? "You" : member.fullName}
                </span>
                {member.role === "owner" && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    OWNER
                  </span>
                )}
                {isOwner && !isCurrentUser && (
                  <button
                    onClick={() => handleRemoveMember(member.userId)}
                    disabled={removingUserId === member.userId}
                    className="text-error transition-colors hover:text-error/80 disabled:opacity-50"
                    aria-label={`Remove ${member.fullName}`}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Invite code display */}
        {showInvite && isOwner && (
          <div className="mt-4">
            <p className="text-sm text-outline">Share this code with your partner:</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 rounded-2xl bg-surface-container px-4 py-2.5 text-center font-mono text-2xl font-bold tracking-[0.3em] text-on-surface">
                {inviteCode ?? "------"}
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={handleCopy}
                  className="rounded-xl bg-surface-container px-3 py-1.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={inviteLoading}
                  className="rounded-xl bg-surface-container px-3 py-1.5 text-xs font-semibold text-outline transition-colors hover:text-on-surface disabled:opacity-50"
                >
                  {inviteLoading ? "..." : t.settings.regenerate}
                </button>
              </div>
            </div>
            {inviteError && <p className="mt-1 text-xs text-error">{inviteError}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
