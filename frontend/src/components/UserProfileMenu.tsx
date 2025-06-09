'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { Loader2, User, Settings, LogOut, BookOpen } from 'lucide-react';
import { getStories } from '@/lib/storyService';

export default function UserProfileMenu() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [storyCount, setStoryCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fetchStoryCount = async () => {
      if (user) {
        try {
          const stories = await getStories(user.uid);
          setStoryCount(stories.length);
        } catch (error) {
          console.error('Error fetching story count:', error);
        }
      }
    };

    fetchStoryCount();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          break;
        case 'ArrowDown':
          event.preventDefault();
          const menuItems = menuRef.current?.querySelectorAll('button');
          const currentIndex = Array.from(menuItems || []).findIndex(
            item => item === document.activeElement
          );
          const nextIndex = (currentIndex + 1) % (menuItems?.length || 1);
          menuItems?.[nextIndex]?.focus();
          break;
        case 'ArrowUp':
          event.preventDefault();
          const items = menuRef.current?.querySelectorAll('button');
          const currentIdx = Array.from(items || []).findIndex(
            item => item === document.activeElement
          );
          const prevIndex = (currentIdx - 1 + (items?.length || 1)) % (items?.length || 1);
          items?.[prevIndex]?.focus();
          break;
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut(auth);
      toast.success('Signed out successfully');
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    } finally {
      setIsSigningOut(false);
      setIsOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm">{user.email}</span>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-50
            animate-in fade-in slide-in-from-top-2 duration-200"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
        >
          <button
            onClick={() => {
              router.push('/stories');
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center justify-between"
            role="menuitem"
          >
            <span className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              My Stories
            </span>
            {storyCount > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                {storyCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              router.push('/profile');
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
            role="menuitem"
          >
            <Settings className="h-4 w-4 mr-2" />
            Profile Settings
          </button>
          <div className="my-1 border-t border-gray-700" />
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            role="menuitem"
          >
            {isSigningOut ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
} 