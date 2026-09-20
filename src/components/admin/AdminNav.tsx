'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, MessageSquare, ImageIcon, Settings, Key, BookOpen } from 'lucide-react';

interface AdminNavProps {
  pendingCommentsCount: number;
}

export function AdminNav({ pendingCommentsCount }: AdminNavProps) {
  const pathname = usePathname();

  const links = [
    {
      href: '/admin',
      label: 'Stories & Chapters',
      icon: FileText,
      exact: true,
    },
    {
      href: '/admin/comments',
      label: 'Reflections & Moderation',
      icon: MessageSquare,
      badge: pendingCommentsCount,
    },
    {
      href: '/admin/media',
      label: 'Archival Photos',
      icon: ImageIcon,
    },
    {
      href: '/admin/book',
      label: 'Print Book',
      icon: BookOpen,
    },
    {
      href: '/admin/settings',
      label: 'About Collection',
      icon: Settings,
    },
    {
      href: '/admin/change-password',
      label: 'Security',
      icon: Key,
    },
  ];

  return (
    <nav className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--border-subtle)] font-serif text-xs">
      {links.map((link) => {
        const isActive = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3.5 py-1.5 rounded-sm flex items-center gap-1.5 shrink-0 transition-colors border ${
              isActive
                ? 'bg-[var(--bg-surface-elevated)] text-[var(--color-terracotta)] font-semibold border-[var(--border-subtle)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border-transparent'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[var(--color-terracotta)]' : 'text-[var(--text-muted)]'}`} />
            <span>{link.label}</span>
            {link.badge && link.badge > 0 ? (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-mono font-bold">
                {link.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
