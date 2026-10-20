import type { Lang } from '../translations';

export const chatbotTranslations: Record<Lang, {
  headerTitle: string;
  headerSub: string;
  welcomeMessage: string;
  examples: string[];
  inputPlaceholder: string;
  errorMessage: string;
}> = {
  fr: {
    headerTitle: '🤖 Assistant Zuwwar',
    headerSub: '',
    welcomeMessage: '👋 Bonjour ! Posez-moi une question sur vos contacts, deals ou campagnes.',
    examples: [
      'Combien de deals sont en négociation ?',
      'Quels sont mes 5 meilleurs prospects ?',
      'Quels contacts sont inactifs depuis 30 jours ?',
      'Que disait-on dans les notes du deal Casablanca Tech ?'
    ],
    inputPlaceholder: 'Posez votre question...',
    errorMessage: '❌ Désolé, une erreur est survenue. Réessayez.'
  },
  en: {
    headerTitle: '🤖 Zuwwar Assistant',
    headerSub: 'Groq · Llama 3.3 + RAG',
    welcomeMessage: '👋 Hello! Ask me a question about your contacts, deals or campaigns.',
    examples: [
      'How many deals are in negotiation?',
      'Who are my top 5 prospects?',
      'Which contacts have been inactive for 30 days?',
      'What did the notes say about the Casablanca Tech deal?'
    ],
    inputPlaceholder: 'Ask your question...',
    errorMessage: '❌ Sorry, an error occurred. Please try again.'
  },
  ar: {
    headerTitle: '🤖 مساعد زوّار',
    headerSub: 'Groq · Llama 3.3 + RAG',
    welcomeMessage: '👋 مرحباً! اطرح علي سؤالاً حول جهات اتصالك أو صفقاتك أو حملاتك.',
    examples: [
      'كم عدد الصفقات قيد التفاوض؟',
      'من هم أفضل 5 عملاء محتملين لدي؟',
      'ما هي جهات الاتصال غير النشطة منذ 30 يومًا؟',
      'ماذا جاء في ملاحظات صفقة Casablanca Tech؟'
    ],
    inputPlaceholder: 'اطرح سؤالك...',
    errorMessage: '❌ عذرًا، حدث خطأ. يرجى إعادة المحاولة.'
  }
};
