'use client';
import axios, { AxiosError } from 'axios';
import { useState, useCallback } from 'react';
import Markdown from 'react-markdown';

interface ReviewResponse {
  aiResponse?: string;
  message?: string;
  error?: string;
}

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(''); // Clear previous response when submitting

    try {
      const res = await axios.post<ReviewResponse>('/api/review', { prompt });

      if (res.status === 200) {
        setResponse(res.data.response || res.data.message || '✅ Review completed successfully.');
      } else {
        setResponse(`⚠️ Error: ${res.data.error || res.data.message || res.data.response || 'Unknown error from server.'}`);
      }
    } catch (error: unknown) {
      const err = error as AxiosError<ReviewResponse>;
      const fallbackError = err.response?.data?.error || err.response?.data?.message || err.message || 'Unexpected network error';
      setResponse(`❌ Failed to fetch: ${fallbackError}`);
    } finally {
      setLoading(false);
    }
  }, [prompt]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center p-4">
      <main className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">
          Code Reviewer AI
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label htmlFor="prompt-input" className="text-lg font-semibold text-gray-700">
            Enter your code or question for review:
          </label>
          <textarea
            id="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Review this JavaScript function: function add(a, b) { return a + b; }'"
            rows={10}
            className="w-full p-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out resize-y font-mono"
            spellCheck="false"
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className={`
              w-full py-3 px-6 rounded-lg text-white font-bold text-lg transition-all duration-300 ease-in-out
              ${loading || !prompt.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:bg-blue-800'
              }
            `}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Reviewing...
              </span>
            ) : (
              'Get Review'
            )}
          </button>
        </form>

        {response && (
          <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-md overflow-hidden animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              AI Response:
              {response.startsWith('✅') && <span className="ml-2 text-green-500">🎉</span>}
              {response.startsWith('⚠️') && <span className="ml-2 text-yellow-500">🚨</span>}
              {response.startsWith('❌') && <span className="ml-2 text-red-500">🔥</span>}
            </h2>
            <div className="prose max-w-none text-gray-700 leading-relaxed break-words whitespace-pre-wrap">
              <Markdown>{response}</Markdown>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}