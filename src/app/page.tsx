
import { FloatingChatbot } from "../../components/chatbot";
export default function Home() {
  const chatbotConfig = {
    chatbotId:1,
    botName: "SmartAssist",
    primaryColor: "#4F46E5",
    logoUrl: "/api/placeholder/48/48",
    welcomeTagline: "Hello! How can I assist you today?",
    loaderText: "Processing your request...",
    quickPrompts: [
      { title: "Help", query: "How can you help me?" },
      { title: "Products", query: "Tell me about your products" },
      { title: "Pricing", query: "What are your pricing options?" },
      { title: "Contact", query: "I want to speak with someone" }
    ],
    agentEscalationEnabled: true,
    preChatForm: {
      isEnabled: true,
      preChatMessage: "Please provide some information before we begin:",
      fields: {
        name: {
          type: "text",
          label: "Your Name",
          placeholder: "John Doe",
          required: true
        },
        email: {
          type: "email",
          label: "Email Address",
          placeholder: "john@example.com",
          required: true
        },
        
      }
    }
  };

  return (
    <div>
      <FloatingChatbot {...chatbotConfig} />
    </div>
  );
    

}
