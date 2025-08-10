import OpenAI from 'openai';

// OpenAI Service for Real AI Integration
export class OpenAIService {
  private openai: OpenAI | null = null;
  private isConfigured = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    
    if (apiKey && apiKey !== 'your_openai_api_key_here') {
      this.openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
      });
      this.isConfigured = true;
    } else {
      console.warn('OpenAI API key not configured. Using mock responses.');
      this.isConfigured = false;
    }
  }

  // Check if OpenAI is properly configured
  isReady(): boolean {
    return this.isConfigured && this.openai !== null;
  }

  // Generate AI response with context about energy data
  async generateResponse(
    userMessage: string, 
    energyContext?: any,
    conversationHistory: Array<{role: string, content: string}> = []
  ): Promise<string> {
    
    if (!this.isReady()) {
      return this.getMockResponse(userMessage);
    }

    try {
      // Build context about the energy tracking app
      const systemContext = this.buildSystemContext(energyContext);
      
      // Prepare messages for the conversation
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: systemContext
        },
        ...conversationHistory.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        {
          role: 'user',
          content: userMessage
        }
      ];

      const completion = await this.openai!.chat.completions.create({
        model: process.env.REACT_APP_AI_MODEL || 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: parseInt(process.env.REACT_APP_AI_MAX_TOKENS || '500'),
        temperature: parseFloat(process.env.REACT_APP_AI_TEMPERATURE || '0.7'),
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      return response;

    } catch (error) {
      console.error('OpenAI API Error:', error);
      
      // Graceful fallback to mock response
      return this.getErrorFallbackResponse(userMessage, error);
    }
  }

  // Build system context with current energy data
  private buildSystemContext(energyContext?: any): string {
    const baseContext = `You are an AI assistant for a Creative Energy Flow tracking application. You help users understand their energy patterns, provide insights about productivity, and offer suggestions for optimizing their creative workflow.

Key features of the app:
- Energy level tracking throughout the day
- Social battery monitoring
- Activity and mood correlation
- Weekly energy patterns and heatmaps
- Insights and pattern recognition

Your personality:
- Friendly and encouraging
- Data-driven but human-focused  
- Practical and actionable advice
- Understanding of creative work cycles
- Supportive of work-life balance

Keep responses concise (2-3 sentences typically) but helpful.`;

    if (energyContext) {
      const contextInfo = `

Current user data context:
- Current energy level: ${energyContext.currentEnergy || 'Not specified'}
- Recent patterns: ${energyContext.recentPatterns || 'Not available'}
- Active insights: ${energyContext.activeInsights || 'None'}
- Time of day: ${new Date().toLocaleTimeString()}`;

      return baseContext + contextInfo;
    }

    return baseContext;
  }

  // Mock response for development/fallback
  private getMockResponse(userMessage: string): string {
    const mockResponses = [
      "I'd love to help you with that! Right now I'm running in demo mode. To get real AI responses, please configure your OpenAI API key in the .env.local file.",
      "That's a great question about energy tracking! I'm currently using mock responses - set up your OpenAI API key to get intelligent answers.",
      "I can see you're interested in optimizing your energy flow. Once connected to OpenAI, I'll provide personalized insights based on your data!",
      "Energy management is so important for creativity! I'm ready to help once you add your OpenAI API key to unlock real AI conversations."
    ];
    
    return mockResponses[Math.floor(Math.random() * mockResponses.length)];
  }

  // Error fallback with helpful message
  private getErrorFallbackResponse(userMessage: string, error: any): string {
    if (error?.code === 'insufficient_quota') {
      return "I'm temporarily unable to respond due to API limits. Please check your OpenAI account billing. In the meantime, I'm here to help with basic energy tracking questions!";
    }
    
    if (error?.code === 'invalid_api_key') {
      return "There seems to be an issue with the API configuration. Please verify your OpenAI API key is correct in the .env.local file.";
    }

    return "I encountered a temporary issue connecting to the AI service. I'm still here to help with your energy tracking journey! Please try again in a moment.";
  }

  // Rate limiting check (basic implementation)
  private static lastRequestTime = 0;
  private static readonly MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

  async generateResponseWithRateLimit(userMessage: string, energyContext?: any, conversationHistory: Array<{role: string, content: string}> = []): Promise<string> {
    const now = Date.now();
    const timeSinceLastRequest = now - OpenAIService.lastRequestTime;
    
    if (timeSinceLastRequest < OpenAIService.MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, OpenAIService.MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }
    
    OpenAIService.lastRequestTime = Date.now();
    return this.generateResponse(userMessage, energyContext, conversationHistory);
  }
}

// Export singleton instance
export const openAIService = new OpenAIService();
