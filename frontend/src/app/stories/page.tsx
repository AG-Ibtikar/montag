'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getStories, searchStories } from '@/lib/storyService';
import { Story } from '@/lib/types';
import { toast } from 'react-hot-toast';
import { Loader2, Search, Plus, LogOut, Eye, FileText, FileSpreadsheet, Download } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import * as XLSX from 'xlsx';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';

export default function StoriesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/');
      return;
    }
    loadStories();
  }, [user, authLoading, router]);

  const loadStories = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await getStories(user.uid);
      setStories(data);
    } catch (error) {
      console.error('Error loading stories:', error);
      toast.error('Failed to load stories');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!user) return;

    setSearchQuery(query);
    try {
      if (query.trim()) {
        const results = await searchStories(user.uid, query);
        setStories(results);
      } else {
        loadStories();
      }
    } catch (error) {
      console.error('Error searching stories:', error);
      toast.error('Failed to search stories');
    }
  };

  const handleViewDetails = (story: Story) => {
    setSelectedStory(story);
  };

  const handleExportToTxt = (story: Story) => {
    const blob = new Blob([story.content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${story.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('Story exported as text file');
  };

  const handleExportToJira = (story: Story) => {
    const jiraData = {
      'Issue Type': 'Story',
      'Summary': story.title,
      'Description': story.content,
      'Priority': 'Medium',
      'Story Points': '3',
      'Labels': 'AI-Generated',
      'Epic Link': 'AI-Generated Stories',
      'Sprint': 'Backlog'
    };

    const ws = XLSX.utils.json_to_sheet([jiraData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'User Story');
    XLSX.writeFile(wb, `${story.title.toLowerCase().replace(/\s+/g, '-')}-jira.xlsx`);
    toast.success('Story exported for Jira');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Your Stories</h1>
            <button
              onClick={() => router.push('/generate')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate New Story
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search stories..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="mt-2 text-sm font-medium text-gray-300">No stories</h3>
              <p className="mt-1 text-sm text-gray-400">Get started by generating a new story.</p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/generate')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Generate New Story
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {stories.map((story) => (
                <div
                  key={story.id}
                  className="bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0 mr-4">
                        <h3 className="text-lg font-medium text-white truncate">
                          {story.title}
                        </h3>
                      </div>
                      <div className="flex-shrink-0 flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(story)}
                          className="text-gray-400 hover:text-gray-300"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleExportToTxt(story)}
                          className="text-gray-400 hover:text-gray-300"
                          title="Export to Text"
                        >
                          <FileText className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleExportToJira(story)}
                          className="text-gray-400 hover:text-gray-300"
                          title="Export to Jira"
                        >
                          <FileSpreadsheet className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-400 line-clamp-3">{story.content}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (story.status || 'in_progress') === 'completed' ? 'bg-green-900 text-green-200' :
                        (story.status || 'in_progress') === 'in_progress' ? 'bg-yellow-900 text-yellow-200' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {(story.status || 'in_progress').replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-400">
                        {new Date(story.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Story Details Modal */}
        {selectedStory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-white">{selectedStory.title}</h2>
                  <button
                    onClick={() => setSelectedStory(null)}
                    className="text-gray-400 hover:text-gray-300"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 whitespace-pre-wrap">{selectedStory.content}</p>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedStory(null)}
                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AppLayout>
    </ProtectedRoute>
  );
} 