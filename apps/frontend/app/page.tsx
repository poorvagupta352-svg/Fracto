'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsLoggedIn(!!data.session));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">P</span>
          </div>
          <span className="text-lg font-bold text-slate-900">ProjectFlow</span>
        </div>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link href="/dashboard" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
              Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-2">
                Sign in
              </Link>
              <Link href="/signup" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
                Get started free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-20 pb-24 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_#eef2ff_0%,_transparent_60%)]" />
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-medium text-indigo-700 mb-6">
          ✦ Simple project management
        </div>
        <h1 className="mx-auto max-w-3xl text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Manage projects &amp; tasks<br />
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            without the complexity
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-500 leading-relaxed">
          Create projects, manage tasks with a kanban board, and track progress — all in one clean workspace built for developers.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          {isLoggedIn ? (
            <Link href="/dashboard" className="rounded-xl bg-indigo-600 px-7 py-3.5 text-base font-semibold text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
              Open Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/signup" className="rounded-xl bg-indigo-600 px-7 py-3.5 text-base font-semibold text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                Start for free
              </Link>
              <Link href="/login" className="rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                Sign in
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: '📁',
              color: 'bg-blue-50 text-blue-600',
              title: 'Project Management',
              desc: 'Create and organize projects with names and descriptions. Edit or delete anytime.',
            },
            {
              icon: '✅',
              color: 'bg-violet-50 text-violet-600',
              title: 'Task Tracking',
              desc: 'Add tasks inside projects. Move them between todo, in-progress, and done.',
            },
            {
              icon: '📊',
              color: 'bg-emerald-50 text-emerald-600',
              title: 'Kanban Board',
              desc: 'Visual 3-column board gives you instant clarity on where every task stands.',
            },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl text-xl ${f.color} mb-4`}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-10 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-indigo-200 mb-7 text-base">Create your free account and start managing projects in minutes.</p>
          <Link href="/signup" className="inline-block rounded-xl bg-white px-8 py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors">
            Create free account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-6 py-6 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} ProjectFlow · Built with Next.js, NestJS &amp; Supabase
      </footer>
    </div>
  );
}
