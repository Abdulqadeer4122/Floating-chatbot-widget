// app/chat/[token]/page.js
'use client'

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { ToastProvider } from '../../../components/ui/toast';

// Dynamically import the FloatingChatbot with no SSR as it uses browser-only features
const ChatContainer = dynamic(() => import('../../../..'), {
  ssr: false,
  loading: () => <ChatLoading />
});

// Loading component function ChatLoading
function ChatLoading() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}>
      <div>Loading chat...</div>
    </div>
  );
}

export default function ChatWidgetPage() {
  const params = useParams();
  const token = params.token;

  return (
    <main>
      <Suspense fallback={<ChatLoading />}>
        <ToastProvider>
          <ChatContainer token={token} />
        </ToastProvider>
      </Suspense>
    </main>
  );
}