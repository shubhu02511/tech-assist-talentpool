'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Mail, 
  Phone, 
  Briefcase, 
  SlidersHorizontal, 
  X, 
  User, 
  Check, 
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';
import { Candidate } from '@/lib/db';

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export default function SearchPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [skillQuery, setSkillQuery] = useState('');
  const [minExperience, setMinExperience] = useState<number>(0);
  const [locationQuery, setLocationQuery] = useState('');
  
  // Selected Candidate for Detail View
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Fetch candidates from API
  const fetchCandidates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/candidates');
      if (!response.ok) {
        throw new Error('Failed to retrieve candidates.');
      }
      const data = await response.json();
      setCandidates(data.candidates || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while loading candidates.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Filter logic
  const filteredCandidates = candidates.filter((candidate) => {
    // Skill Filter: matches keyword in candidate's skills list (case-insensitive)
    const matchesSkill = skillQuery
      ? candidate.skills.some((skill) =>
          skill.toLowerCase().includes(skillQuery.toLowerCase())
        )
      : true;

    // Experience Filter: greater than or equal to minimum experience
    const matchesExperience = candidate.experience_years >= minExperience;

    // Location Filter: matches keyword in candidate's location (case-insensitive)
    const matchesLocation = locationQuery
      ? candidate.location.toLowerCase().includes(locationQuery.toLowerCase())
      : true;

    return matchesSkill && matchesExperience && matchesLocation;
  });

  const resetFilters = () => {
    setSkillQuery('');
    setMinExperience(0);
    setLocationQuery('');
  };

  // Get max experience from database to calibrate slider range
  const maxExpInDb = candidates.length > 0 
    ? Math.ceil(Math.max(...candidates.map(c => c.experience_years))) 
    : 15;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-500 bg-clip-text text-transparent">
            Talent Pool Search
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Browse, filter, and review parsed resumes from your local repository.
          </p>
        </div>
        <button
          onClick={fetchCandidates}
          className="flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-200 px-4 py-2.5 hover:bg-white/10 transition-all active:scale-95"
        >
          <Database className="h-4 w-4 text-indigo-400" />
          Refresh Database
        </button>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 items-start">
        {/* Filters Panel */}
        <aside className="lg:col-span-1 p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
              Filters
            </h2>
            <button
              onClick={resetFilters}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Reset All
            </button>
          </div>

          {/* Skill Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Skill / Keyword</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={skillQuery}
                onChange={(e) => setSkillQuery(e.target.value)}
                placeholder="e.g. React, Python, Sales"
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Experience Filter */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Min Experience</span>
              <span className="text-indigo-400 font-bold">{minExperience} {minExperience === 1 ? 'Year' : 'Years'}</span>
            </div>
            <input
              type="range"
              min="0"
              max={maxExpInDb > 0 ? maxExpInDb : 15}
              step="0.5"
              value={minExperience}
              onChange={(e) => setMinExperience(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500 border border-white/10"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0 yrs</span>
              <span>{maxExpInDb} yrs</span>
            </div>
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="e.g. San Francisco, Remote"
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </aside>

        {/* Results Panel */}
        <section className="lg:col-span-3 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-white/10 bg-slate-900/20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mb-4" />
              <p className="text-sm text-slate-400">Loading talent pool...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center">
              <span className="text-sm font-semibold text-rose-400 mb-2">Error Loading Candidates</span>
              <p className="text-xs text-rose-300 max-w-md mb-4">{error}</p>
              <button
                onClick={fetchCandidates}
                className="rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-2 text-xs font-bold hover:bg-rose-500/25 transition-colors"
              >
                Retry Request
              </button>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-white/10 bg-slate-900/10 text-center">
              <p className="text-slate-400 text-sm font-medium">No candidates match your filters.</p>
              <button
                onClick={resetFilters}
                className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  onClick={() => setSelectedCandidate(candidate)}
                  className={`group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    selectedCandidate?.id === candidate.id
                      ? 'border-indigo-500 bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                      : 'border-white/10 bg-slate-900/40 hover:border-white/20 hover:bg-slate-900/60'
                  }`}
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-sm font-bold">
                          {candidate.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors text-sm sm:text-base">
                            {candidate.name}
                          </h3>
                          <p className="text-xs text-slate-400 truncate max-w-[180px] sm:max-w-[220px]">
                            {candidate.job_title}
                          </p>
                        </div>
                      </div>
                      <div className="rounded-lg bg-white/5 px-2.5 py-1 text-[10px] font-bold text-slate-300 border border-white/10 whitespace-nowrap">
                        {candidate.experience_years} {candidate.experience_years === 1 ? 'Yr' : 'Yrs'} Exp
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        <span>{candidate.location}</span>
                      </div>
                      {candidate.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5 text-slate-500" />
                          <span className="truncate max-w-[140px]">{candidate.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Skills list (first 4 skills) */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {candidate.skills.slice(0, 4).map((skill, index) => (
                        <span
                          key={index}
                          className="rounded-md bg-white/5 border border-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-300"
                        >
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 4 && (
                        <span className="text-[10px] text-slate-500 self-center font-medium pl-1">
                          +{candidate.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end text-xs text-indigo-400 font-medium group-hover:translate-x-1 transition-transform duration-200">
                    View profile
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Side Detail Panel (Drawer) */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Backdrop */}
            <div 
              onClick={() => setSelectedCandidate(null)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" 
            />

            <div className="pointer-events-none absolute inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              {/* Panel Content wrapper */}
              <div className="pointer-events-auto w-screen max-w-2xl transform bg-slate-900 border-l border-white/10 shadow-2xl transition-all duration-300">
                <div className="flex h-full flex-col overflow-y-auto">
                  {/* Panel Header */}
                  <div className="bg-slate-950 px-6 py-5 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <User className="h-5 w-5 text-indigo-400" />
                        Candidate Profile
                      </h2>
                      <button
                        onClick={() => setSelectedCandidate(null)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Panel Body */}
                  <div className="flex-1 p-6 space-y-8">
                    {/* Identity Card */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white text-xl font-bold border border-indigo-400/20">
                          {selectedCandidate.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{selectedCandidate.name}</h3>
                          <p className="text-sm text-indigo-300 font-medium">{selectedCandidate.job_title}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-start sm:items-end">
                        <span className="text-xs text-slate-400">Total Experience</span>
                        <span className="text-lg font-extrabold text-white">
                          {selectedCandidate.experience_years} {selectedCandidate.experience_years === 1 ? 'Year' : 'Years'}
                        </span>
                      </div>
                    </div>

                    {/* Grid Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Contact Info */}
                      <div className="p-5 rounded-2xl bg-slate-950/40 border border-white/5 space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact details</h4>
                        <div className="space-y-3 text-sm">
                          {selectedCandidate.email ? (
                            <a 
                              href={`mailto:${selectedCandidate.email}`}
                              className="flex items-center gap-3 text-slate-300 hover:text-indigo-400 transition-colors group"
                            >
                              <Mail className="h-4.5 w-4.5 text-indigo-400/70" />
                              <span className="truncate">{selectedCandidate.email}</span>
                              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                            </a>
                          ) : (
                            <div className="flex items-center gap-3 text-slate-500 italic">
                              <Mail className="h-4.5 w-4.5 text-slate-600" />
                              <span>No email found</span>
                            </div>
                          )}

                          {selectedCandidate.phone ? (
                            <a 
                              href={`tel:${selectedCandidate.phone}`}
                              className="flex items-center gap-3 text-slate-300 hover:text-indigo-400 transition-colors group"
                            >
                              <Phone className="h-4.5 w-4.5 text-indigo-400/70" />
                              <span>{selectedCandidate.phone}</span>
                              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                            </a>
                          ) : (
                            <div className="flex items-center gap-3 text-slate-500 italic">
                              <Phone className="h-4.5 w-4.5 text-slate-600" />
                              <span>No phone found</span>
                            </div>
                          )}

                          {selectedCandidate.linkedin_url ? (
                            <a 
                              href={selectedCandidate.linkedin_url.startsWith('http') ? selectedCandidate.linkedin_url : `https://${selectedCandidate.linkedin_url}`}
                              target="_blank" 
                              rel="noreferrer"
                              className="flex items-center gap-3 text-slate-300 hover:text-indigo-400 transition-colors group"
                            >
                              <LinkedinIcon className="h-4.5 w-4.5 text-indigo-400/70" />
                              <span className="truncate max-w-[200px]">LinkedIn Profile</span>
                              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                            </a>
                          ) : (
                            <div className="flex items-center gap-3 text-slate-500 italic">
                              <LinkedinIcon className="h-4.5 w-4.5 text-slate-600" />
                              <span>No LinkedIn link found</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Professional details info */}
                      <div className="p-5 rounded-2xl bg-slate-950/40 border border-white/5 space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Professional info</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-3 text-slate-300">
                            <Briefcase className="h-4.5 w-4.5 text-indigo-400/70" />
                            <span className="truncate">{selectedCandidate.job_title}</span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-300">
                            <MapPin className="h-4.5 w-4.5 text-indigo-400/70" />
                            <span>{selectedCandidate.location}</span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-300">
                            <Calendar className="h-4.5 w-4.5 text-indigo-400/70" />
                            <span>Added on {new Date(selectedCandidate.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI-Extracted Skills */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI-Extracted Skills ({selectedCandidate.skills.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidate.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 text-xs font-semibold text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.05)]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Scrubbed Career History */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scrubbed Career History</h4>
                        <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          PII Cleaned
                        </span>
                      </div>
                      <div className="p-5 rounded-2xl bg-slate-950 border border-white/5 text-slate-300 text-sm font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                        {selectedCandidate.scrubbed_text}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
