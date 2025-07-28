'use client';
import axios, { AxiosError } from 'axios';
import { useState, useCallback } from 'react';
import Markdown from 'react-markdown';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';

interface ReviewResponse {
  response?: string;
  message?: string;
  error?: string;
}

export default function Home() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState(
    `function add(a, b) {\n  return a + b;\n}`
  );

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');

    try {
      const res = await axios.post<ReviewResponse>('/api/review', { prompt: code });

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
  }, [code]);

  return (
    <main className='h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center p-6'>
      <div className='bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl p-8 w-full max-w-6xl flex flex-col md:flex-row gap-8 h-screen'>
        {/* Code Editor Section */}
        <div className='flex flex-col w-full md:w-1/2 space-y-6'>
          <h1 className='text-4xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
            Code Reviewer AI
          </h1>
          <div className='bg-gray-900/80 rounded-lg overflow-scroll shadow-lg border border-gray-700 flex-grow '>
            <Editor
              value={code}
              onValueChange={setCode}
              highlight={code => highlight(code, languages.js)}
              padding={20}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 15,
                minHeight: '350px',
                lineHeight: '1.6',
                color: '#f8f8f2',
                backgroundColor: '#1a1b26',
                overflow: "auto"
              }}
              className='resize-none h-full w-full scroll-m-0'
            />
          </div>
          <button
            onClick={handleSubmit}
            className={`w-full py-4 rounded-lg text-lg font-semibold transition-all duration-300
              ${loading
                ? 'bg-blue-600/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-blue-500/25'}`}
            disabled={loading}
          >
            {loading ? 'Analyzing Code...' : 'Get Review'}
          </button>
        </div>

        {/* Review Response Section */}
        <div className='flex flex-col w-full md:w-1/2 bg-gray-900/80 rounded-lg p-8 shadow-lg border border-gray-700'>
          <h2 className='text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
            Review Response
          </h2>
          <div className='flex-grow relative'>
            {loading && (
              <div className='absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm rounded-lg'>
                <div className='flex flex-col items-center space-y-4'>
                  <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400'></div>
                  <p className='text-blue-400 text-lg font-medium'>Analyzing your code...</p>
                </div>
              </div>
            )}
            {response && (
              <div className='prose prose-invert prose-lg max-w-none overflow-auto h-220 text-gray-300 p-4 '>
                <Markdown>{response}</Markdown>
              </div>
            )}
            {!loading && !response && (
              <div className='flex flex-col items-center justify-center h-full space-y-4 text-center'>
                <svg className='w-16 h-16 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                </svg>
                <p className='text-gray-400 text-lg'>Your code review will appear here</p>
                <p className='text-gray-500 text-sm'>Submit your code to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}