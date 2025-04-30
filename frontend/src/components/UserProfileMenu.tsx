'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  LogOut,
  ChevronDown,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';

const menuItems = [
  {
    name: 'Edit Profile',
    href: '/profile',
    icon: User
  },
  {
    name: 'Stories Log',
    href: '/stories',
    icon: BookOpen
  }
];

export default function UserProfileMenu() {
  const { user, userData, signOut } = useAuth();

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        await signOut();
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }
  };

  if (!user) return null;

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800">
        <div className="flex items-center">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
              {userData?.firstName?.[0] || userData?.lastName?.[0] || user?.email?.[0] || '?'}
            </div>
            <span className="ml-2 text-sm font-medium text-gray-300 hidden md:block">
              Hey {userData?.firstName || 'there'}!
            </span>
            <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 rounded-lg bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
              Hey {userData?.firstName || 'there'}!
            </div>
            {menuItems.map((item) => (
              <Menu.Item key={item.name}>
                {({ active }) => (
                  <Link
                    href={item.href}
                    className={`${
                      active ? 'bg-gray-100 dark:bg-gray-700' : ''
                    } group flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-gray-700 dark:text-gray-200`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )}
              </Menu.Item>
            ))}
            <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleSignOut}
                  className={`${
                    active ? 'bg-gray-100 dark:bg-gray-700' : ''
                  } group flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-red-600 dark:text-red-400`}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
} 