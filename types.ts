
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  GENERATOR = 'GENERATOR',
  EDITOR = 'EDITOR',
  ANALYZER = 'ANALYZER',
  VOICEOVER = 'VOICEOVER',
  CHAT = 'CHAT',
  PRICING = 'PRICING'
}

export interface ThumbnailSEO {
  suggestedTitle: string;
  keywords: string[];
  strategy: string;
  colors: string[];
  hooks: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  urls?: { uri: string; title: string }[];
}

export type ImageSize = '1K' | '2K' | '4K';
export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
