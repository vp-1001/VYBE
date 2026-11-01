import React, { useState } from 'react';
import {
  Users2,
  Plus,
  Vote,
  CheckCircle2,
  MessageSquare,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { Collaborator, Poll } from '../../types/event';

export const CollaborativePlanning: React.FC = () => {
  const { activeEvent, votePoll, createPoll, addCollaborator } = useEvent();

  const [isPollModalOpen, setIsPollModalOpen] = useState<boolean>(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState<boolean>(false);

  // Poll Form
  const [pollQuestion, setPollQuestion] = useState<string>('');
  const [pollOptionsStr, setPollOptionsStr] = useState<string>('Option A, Option B');

  // Member Form
  const [memberName, setMemberName] = useState<string>('');
  const [memberEmail, setMemberEmail] = useState<string>('');
  const [memberRole, setMemberRole] = useState<any>('Logistics Coordinator');

  if (!activeEvent) {
    return <div className="p-8 text-center text-xs text-[var(--text-muted)]">No active event selected.</div>;
  }

  const team = activeEvent.collaborators || [];
  const polls = activeEvent.polls || [];

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pollQuestion.trim()) return;
    const options = pollOptionsStr
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (options.length < 2) return;

    createPoll(pollQuestion, options);
    setPollQuestion('');
    setPollOptionsStr('Option A, Option B');
    setIsPollModalOpen(false);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberEmail.trim()) return;

    addCollaborator(memberName, memberEmail, memberRole);
    setMemberName('');
    setMemberEmail('');
    setIsMemberModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
              Multi-Role Workspace
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[var(--text-main)] mt-1">
            Collaborative Planning Hub
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Coordinate role responsibilities, vote on committee polls, and track shared decisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPollModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-card)] border border-[var(--border-main)] hover:bg-[var(--bg-card-subtle)] text-[var(--text-main)] transition-colors"
          >
            <Vote className="w-3.5 h-3.5 text-violet-500" />
            <span>Create Poll</span>
          </button>
          <button
            onClick={() => setIsMemberModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Teammate</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Team Members & Active Decision Polls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1 span): Team Members & Roles */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-main)]">
            <h3 className="font-bold font-display text-sm text-[var(--text-main)]">
              Core Committee ({team.length})
            </h3>
            <span className="text-[11px] text-[var(--text-muted)]">Role-based access</span>
          </div>

          <div className="space-y-3">
            {team.map((member) => (
              <div
                key={member.id}
                className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-main)] flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--text-main)] truncate">{member.name}</span>
                    {member.isCurrentUser && (
                      <span className="text-[9px] bg-violet-100 text-violet-700 px-1 rounded font-bold">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] truncate">{member.email}</div>
                  <div className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">
                    {member.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (2 spans): Interactive Polls & Decision History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Polls */}
          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-main)]">
              <h3 className="font-bold font-display text-sm text-[var(--text-main)]">
                Active Team Polls ({polls.length})
              </h3>
              <span className="text-[11px] text-[var(--text-muted)]">
                Click any option to cast your vote
              </span>
            </div>

            <div className="space-y-4">
              {polls.map((poll) => {
                const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);

                return (
                  <div
                    key={poll.id}
                    className="p-4 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-main)] space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-violet-600">
                          Created by {poll.creatorName}
                        </span>
                        <h4 className="text-sm font-bold text-[var(--text-main)] mt-0.5">
                          {poll.question}
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-muted)]">
                        {totalVotes} total {totalVotes === 1 ? 'vote' : 'votes'}
                      </span>
                    </div>

                    {/* Options list */}
                    <div className="space-y-2">
                      {poll.options.map((opt) => {
                        const pct = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
                        const hasMyVote = opt.votes.includes('c1'); // demo current user

                        return (
                          <div
                            key={opt.id}
                            onClick={() => votePoll(poll.id, opt.id)}
                            className={`p-3 rounded-xl border text-xs cursor-pointer transition-all relative overflow-hidden ${
                              hasMyVote
                                ? 'border-violet-600 bg-violet-50/70 dark:bg-violet-950/40 ring-1 ring-violet-500'
                                : 'border-[var(--border-main)] bg-[var(--bg-card)] hover:border-violet-300'
                            }`}
                          >
                            {/* Vote percentage background fill */}
                            <div
                              className="absolute left-0 top-0 bottom-0 bg-violet-500/10 pointer-events-none transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />

                            <div className="relative flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                                    hasMyVote ? 'border-violet-600 bg-violet-600' : 'border-neutral-400'
                                  }`}
                                >
                                  {hasMyVote && <CheckCircle2 className="w-3 h-3 text-white" />}
                                </span>
                                <span className="font-semibold text-[var(--text-main)]">{opt.text}</span>
                              </div>
                              <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--text-muted)]">
                                <span>{opt.votes.length} votes</span>
                                <span className="font-bold text-[var(--text-main)]">({pct}%)</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Create Poll Modal */}
      {isPollModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreatePoll}
            className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl shadow-xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-main)]">
              <h3 className="text-base font-bold font-display text-[var(--text-main)]">
                Create Team Decision Poll
              </h3>
              <button
                type="button"
                onClick={() => setIsPollModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-muted)]">Question</label>
                <input
                  type="text"
                  required
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="e.g. Which dessert counter should we feature?"
                  className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-muted)]">
                  Options (Comma separated)
                </label>
                <input
                  type="text"
                  required
                  value={pollOptionsStr}
                  onChange={(e) => setPollOptionsStr(e.target.value)}
                  placeholder="e.g. Hot Baked Rosogolla, Chocolate Fondue Station, Mishti Doi Parfait"
                  className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-main)]">
              <button
                type="button"
                onClick={() => setIsPollModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--bg-card-subtle)] text-[var(--text-main)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
              >
                Publish Poll
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Teammate Modal */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddMember}
            className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl shadow-xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-main)]">
              <h3 className="text-base font-bold font-display text-[var(--text-main)]">
                Add Team Member
              </h3>
              <button
                type="button"
                onClick={() => setIsMemberModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-muted)]">Full Name</label>
                <input
                  type="text"
                  required
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="e.g. Debolina Dutta"
                  className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-muted)]">Email Address</label>
                <input
                  type="email"
                  required
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="e.g. debolina.d@college.edu"
                  className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-muted)]">Assigned Role</label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value as any)}
                  className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                >
                  <option value="Finance Coordinator">Finance Coordinator</option>
                  <option value="Decoration Coordinator">Decoration Coordinator</option>
                  <option value="Food Coordinator">Food Coordinator</option>
                  <option value="Logistics Coordinator">Logistics Coordinator</option>
                  <option value="Viewer">Viewer / Member</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-main)]">
              <button
                type="button"
                onClick={() => setIsMemberModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--bg-card-subtle)] text-[var(--text-main)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
              >
                Add Member
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
