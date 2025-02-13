declare module 'elevenlabs-node' {
  export interface VoiceSettings {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  }
  
  export type Voice = string;
  
  export class ElevenLabs {
    constructor(config: { apiKey: string });
    generate(params: {
      voice: Voice;
      text: string;
      voiceSettings: VoiceSettings;
    }): Promise<Buffer>;
  }
} 