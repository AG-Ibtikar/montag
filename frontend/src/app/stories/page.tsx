'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { auth, getStories } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { LogOut, Search, Calendar, Filter } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Story {
  id: string;
  title: string;
  content: string;
  config: {
    focus: string;
    tone: string;
    format: string;
    length: string;
    industry: string;
    companySize: string;
    role: string;
    experience: string;
  };
  createdAt: Date;
  status: string;
}

export default function StoriesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const loadStories = async () => {
      if (!user) return;

      try {
        const userStories = await getStories(user.uid);
        setStories(userStories);
      } catch (error) {
        console.error('Error loading stories:', error);
        toast.error('Failed to load stories');
      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, [user]);

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to log out?')) {
      return;
    }

    try {
      setIsLoggingOut(true);
      await signOut(auth);
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to log out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const filteredStories = stories.filter(story =>
    story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    story.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900">
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-white">Montaj</h1>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                  Your Stories
                </h1>
                <p className="text-gray-300 mt-2">
                  View and manage your generated user stories
                </p>
              </div>
              <button
                onClick={() => router.push('/generate')}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                Generate New Story
              </button>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stories..."
                  className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filter
              </button>
            </div>

            {/* Stories List */}
            <div className="space-y-4">
              {filteredStories.map((story) => (
                <div
                  key={story.id}
                  onClick={() => router.push(`/stories/${story.id}`)}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:bg-gray-750 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">{story.title}</h3>
                      <div className="flex items-center text-sm text-gray-400">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(story.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      story.status === 'completed'
                        ? 'bg-green-900/50 text-green-400'
                        : 'bg-yellow-900/50 text-yellow-400'
                    }`}>
                      {story.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-900/50 text-blue-400 rounded-full text-sm">
                      {story.config.focus}
                    </span>
                    <span className="px-3 py-1 bg-purple-900/50 text-purple-400 rounded-full text-sm">
                      {story.config.tone}
                    </span>
                    <span className="px-3 py-1 bg-emerald-900/50 text-emerald-400 rounded-full text-sm">
                      {story.config.format}
                    </span>
                  </div>
                  <p className="text-gray-400 line-clamp-2">
                    {story.content}
                  </p>
                </div>
              ))}

              {filteredStories.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400">No stories found</p>
                  <button
                    onClick={() => router.push('/generate')}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                  >
                    Generate Your First Story
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 