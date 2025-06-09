import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useState } from 'react';
import { Loader2, LogOut, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  // Generate initials from user's name or email
  const getInitials = () => {
    if (user.name) {
      return user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email.slice(0, 2).toUpperCase();
  };

  // Generate a consistent color based on user's name/email
  const getAvatarColor = () => {
    const colors = [
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-emerald-500 to-emerald-600',
      'bg-gradient-to-br from-amber-500 to-amber-600',
      'bg-gradient-to-br from-rose-500 to-rose-600',
    ];
    const hash = user.name ? user.name.length : user.email.length;
    return colors[hash % colors.length];
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center">
              <Link href="/stories" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="Montag Logo"
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
                <span className="ml-2 text-xl font-bold text-white">Montag</span>
              </Link>
              <nav className="ml-10 flex items-center space-x-4">
                <Link
                  href="/stories"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Stories
                </Link>
                <Link
                  href="/generate"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Generate
                </Link>
              </nav>
            </div>

            {/* Profile Menu */}
            <div className="flex items-center">
              <div className="relative group">
                <button
                  className="flex items-center text-gray-300 hover:text-white transition-colors duration-200"
                  onClick={() => router.push('/profile')}
                >
                  <div 
                    className={`w-8 h-8 rounded-full ${getAvatarColor()} flex items-center justify-center text-white font-medium text-sm shadow-lg transform transition-all duration-200 group-hover:scale-110 group-hover:shadow-xl`}
                  >
                    {getInitials()}
                  </div>
                  <span className="ml-2 text-sm font-medium">
                    {user.name ? user.name.split(' ')[0] : user.email}
                  </span>
                </button>
                {/* Tooltip */}
                <div className="absolute right-0 mt-2 w-48 px-3 py-2 bg-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-1 z-50">
                  <div className="text-sm text-gray-200">
                    <div className="font-medium text-white mb-1">Profile</div>
                    <div className="text-gray-400">{user.name || user.email}</div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
} 