'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Clock, BookOpen, Loader2, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Story {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  category?: string;
  status: 'completed' | 'in_progress' | 'failed';
}

export default function StoryDetailsPage() {
  const { user } = useAuth();
  const params = useParams();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchStory = async () => {
      if (!user || !params.id) return;

      try {
        const db = getFirestore();
        const storyRef = doc(db, 'stories', params.id as string);
        const storyDoc = await getDoc(storyRef);

        if (!storyDoc.exists()) {
          setError('Story not found');
          return;
        }

        const storyData = {
          id: storyDoc.id,
          ...storyDoc.data(),
          createdAt: storyDoc.data().createdAt?.toDate() || new Date(),
        } as Story;

        setStory(storyData);
      } catch (err) {
        console.error('Error fetching story:', err);
        setError('Failed to load story. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [user, params.id]);

  const getStatusColor = (status: Story['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-500';
      case 'failed':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const copyToClipboard = async () => {
    if (!story) return;
    try {
      await navigator.clipboard.writeText(story.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/stories"
                className="flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Stories
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500">
            {error}
          </div>
        ) : story ? (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {story.title}
                </h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center text-gray-400">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      {formatDate(story.createdAt)}
                    </span>
                  </div>
                  {story.category && (
                    <span className="text-sm text-gray-400">
                      {story.category}
                    </span>
                  )}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      story.status
                    )}`}
                  >
                    {story.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center px-3 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 whitespace-pre-wrap">
                  {story.content}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
} 