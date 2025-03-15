
'use client'
import FloatingChatbot from "../../../../components/chatbot";
// import { Suspense } from 'react';
// import dynamic from 'next/dynamic';

// import { ToastProvider } from '../../../components/ui/toast';

// // Dynamically import the specific FloatingChatbot component
// const FloatingChatbotComponent = dynamic(
//   () => import('../../../../components/chatbot'),
//   {
//     ssr: false,
//     loading: () => <ChatLoading />
//   }
// );

// // Loading component function ChatLoading
// function ChatLoading() {
//   return (
//     <div style={{
//       display: 'flex',
//       justifyContent: 'center',
//       alignItems: 'center',
//       height: '100vh'
//     }}>
//       <div>Loading chat...</div>
//     </div>
//   );
// }

export default function ChatWidgetPage() {
 
    return <FloatingChatbot />;
    
}