export interface QuickPrompt {
  title: string;
  query: string;
}

export interface PreChatFormField {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  required: boolean;
  placeholder: string;
}

export interface PreChatForm {
  id: number;
  isEnabled: boolean;
  fields: PreChatFormField[];
  preChatMessage: string;
  chatbotId: number;
}

export interface ChatbotConfig {
  id: string;
  title: string;
  welcomeHeading: string;
  welcomeTagline: string;
  widgetColor: string;
  userId: string;
  preChatform: PreChatForm;
  quickPrompts: QuickPrompt[];
  loaderText?: string;
  logoUrl?: string;
}

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}
 

  export interface ToastProps {
    variant?: 'default' | 'destructive' | 'success';
    title: string;
    description?: string;
  }
  