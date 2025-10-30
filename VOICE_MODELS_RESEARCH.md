# On-Device Voice Models Research

## Overview

This document compares the best on-device voice/TTS models for creative integrations in a browser/PWA environment (like Castaway Council).

---

## Top Recommendations

### 🏆 1. Piper TTS (Best Overall for Browser)

**Why it's best:**
- ✅ Extremely lightweight (~5-15MB per voice model)
- ✅ Runs entirely in browser via WebAssembly
- ✅ Real-time synthesis (<100ms latency)
- ✅ High quality neural TTS
- ✅ No API calls, completely offline
- ✅ Multiple voices available
- ✅ MIT License (open source)

**Technical Details:**
- Framework: ONNX Runtime (WebAssembly build)
- Model: Neural TTS trained on multiple datasets
- Output: WAV audio (can convert to other formats)
- Languages: English (primarily), multilingual models available

**Integration:**
```typescript
// npm: @rhasspy/piper-tts
import { PiperTTS } from '@rhasspy/piper-tts';

const tts = new PiperTTS({
  modelPath: '/models/en_us-lessac-medium.onnx',
  configPath: '/models/en_us-lessac-medium.onnx.json'
});

const audio = await tts.synthesize("Hello from Castaway Council!");
```

**Browser Compatibility:**
- Chrome/Edge: ✅ Excellent
- Firefox: ✅ Good
- Safari: ⚠️ May need polyfills for WebAssembly streaming

**Model Sizes:**
- Small: ~5MB
- Medium: ~10MB
- Large: ~20MB (better quality)

**Pros:**
- Best balance of quality/size
- Active development
- Good documentation
- Community support

**Cons:**
- Voice selection limited compared to cloud services
- Multilingual support varies by language

---

### 🥈 2. Silero TTS

**Why it's competitive:**
- ✅ Very fast inference (~50ms)
- ✅ Small model size (~10-25MB)
- ✅ Excellent Russian/English quality
- ✅ PyTorch → ONNX → WebAssembly pipeline
- ✅ Multiple voice styles

**Technical Details:**
- Model: SILERO TTS models (multiple variants)
- Framework: ONNX Runtime or PyTorch.js
- Languages: Russian (excellent), English (good), others

**Integration:**
```javascript
// Using Silero in browser
const model = await torch.load('/models/silero_model.onnx');
const audio = await model.synthesize(text, speaker='en_0');
```

**Pros:**
- Fastest inference
- Excellent voice quality
- Active Russian NLP community

**Cons:**
- English models less polished than Piper
- Smaller voice variety

---

### 🥉 3. Coqui TTS (Advanced, More Creative)

**Why it's creative:**
- ✅ Voice cloning capabilities
- ✅ Emotional control
- ✅ Prosody control (pitch, speed, pauses)
- ✅ Multi-speaker models
- ⚠️ Larger models (~50-200MB)

**Technical Details:**
- Framework: TensorFlow.js or ONNX
- Models: Tacotron2, FastSpeech2, YourTTS (voice cloning)
- Features: Emotion synthesis, style transfer

**Use Cases:**
- Character voices (different contestants)
- Emotional delivery (tension, excitement)
- Voice consistency across sessions

**Pros:**
- Most creative/expressive options
- Voice cloning for unique characters
- Advanced prosody control

**Cons:**
- Larger download sizes
- More complex setup
- Slower inference than Piper

---

### 🌐 4. Web Speech API (Native, Limited)

**Browser's Built-in TTS**

**Pros:**
- ✅ Zero dependencies
- ✅ No download required
- ✅ Native browser integration
- ✅ Multiple languages/voices (OS-dependent)

**Cons:**
- ❌ Limited voice quality
- ❌ No customization
- ❌ Inconsistent across browsers
- ❌ No offline control (some voices require internet)

**Integration:**
```typescript
const utterance = new SpeechSynthesisUtterance("Text to speak");
utterance.voice = speechSynthesis.getVoices().find(v => v.name.includes('Google'));
speechSynthesis.speak(utterance);
```

**Best For:**
- Simple fallback
- Prototyping
- Accessibility features

---

## Specialized Options

### 5. Whisper (Speech-to-Text) + Voice Model
- If you need bidirectional voice (voice commands + responses)
- Whisper for STT, Piper/Silero for TTS

### 6. RVC (Retrieval-based Voice Conversion)
- Real-time voice conversion
- Clone voices from samples
- ⚠️ Complex, primarily research-level

### 7. Bark (Audio Generation)
- Can generate sounds, music, non-speech audio
- Creative sound effects
- ⚠️ Very large models (~500MB+)

---

## Comparison Table

| Feature | Piper TTS | Silero | Coqui | Web Speech API |
|---------|-----------|--------|-------|----------------|
| **Model Size** | 5-20MB | 10-25MB | 50-200MB | 0MB (browser) |
| **Quality** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Speed** | Very Fast | Fastest | Fast | Instant |
| **Voice Variety** | Good | Limited | Excellent | OS-dependent |
| **Voice Cloning** | ❌ | ❌ | ✅ | ❌ |
| **Emotional Control** | ❌ | ❌ | ✅ | ❌ |
| **Offline** | ✅ | ✅ | ✅ | ⚠️ Partial |
| **License** | MIT | Apache 2.0 | MPL 2.0 | Built-in |
| **Browser Support** | Excellent | Good | Good | Universal |

---

## Recommendation for Castaway Council

### 🎯 Best Choice: **Piper TTS**

**Why:**
1. Perfect balance for PWA use case
2. Small enough to bundle/cache in Service Worker
3. High quality enough for immersive experience
4. Fast enough for real-time game events
5. Can pre-load voices during app initialization

### 🎨 Creative Implementation Ideas:

1. **Character Voices**
   - Each contestant could have a unique voice (requires voice cloning = Coqui)
   - Or use Piper's multiple voice options for variety

2. **Dynamic Narration**
   - Phase transitions
   - Challenge results
   - Vote revelations
   - Event announcements

3. **Accessibility**
   - Screen reader alternative
   - Low-data mode support

4. **Offline Mode**
   - Cache Piper models in Service Worker
   - Full voice functionality without internet

5. **Emotional Tension**
   - Use Coqui for emotional delivery during:
     - Tribal Council votes
     - Challenge reveals
     - Eliminations

---

## Integration Plan

### Phase 1: Basic Piper TTS
```typescript
// Install
pnpm add @rhasspy/piper-tts

// Implementation
// app/_lib/voice.ts
import { PiperTTS } from '@rhasspy/piper-tts';

export class VoiceService {
  private tts: PiperTTS | null = null;
  
  async init() {
    this.tts = new PiperTTS({
      modelPath: '/models/en_us-lessac-medium.onnx',
      configPath: '/models/en_us-lessac-medium.onnx.json'
    });
    await this.tts.load();
  }
  
  async speak(text: string) {
    if (!this.tts) await this.init();
    const audioBuffer = await this.tts!.synthesize(text);
    // Play audio via Web Audio API
  }
}
```

### Phase 2: Service Worker Caching
- Cache Piper models in Service Worker
- Pre-load during app initialization
- Update models via cache API

### Phase 3: Creative Features
- Multiple voices for different contexts
- Emotional modulation
- Speed/pitch control

---

## Getting Started

### 1. Download Piper Models
```bash
# Available models from Rhasspy
# https://github.com/rhasspy/piper/releases
# Download .onnx model + .json config
```

### 2. Model Selection
- `en_US-lessac-medium` - Good default
- `en_US-lessac-high` - Better quality, larger
- `en_GB-northern_english_male-medium` - British accent option

### 3. Integration Points
- Phase transition announcements
- Challenge result narration
- Vote revelation drama
- Daily summary voiceover
- Confessional playback (if players record)

---

## Alternative: Hybrid Approach

If you want the best of both worlds:

1. **Piper TTS** for standard narration
2. **Coqui TTS** for emotional moments
3. **Web Speech API** as fallback

This gives you:
- Fast, lightweight defaults
- Creative expression when needed
- Universal compatibility

---

## Resources

- **Piper TTS**: https://github.com/rhasspy/piper
- **Model Downloads**: https://huggingface.co/rhasspy/piper-voices
- **Silero TTS**: https://github.com/snakers4/silero-models
- **Coqui TTS**: https://github.com/coqui-ai/TTS
- **Web Speech API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API

---

## Next Steps

Would you like me to:
1. Set up Piper TTS integration in your codebase?
2. Create a voice service wrapper?
3. Add voice announcements to specific game events?
4. Implement Service Worker caching for models?

Let me know what creative direction you want to explore!
