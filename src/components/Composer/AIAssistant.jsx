import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, ChevronDown, ChevronUp, Music2, Music, Music4, Lightbulb } from 'lucide-react';

const AIAssistant = ({
  selectedGenre,
  selectedProgression,
  layers,
  bpm,
  onAddLayer,
  onUpdateLayer
}) => {
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(true);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  // Quick action buttons configuration
  const quickActions = [
    {
      label: 'Generate Drums',
      icon: Music2,
      color: 'red',
      prompt: 'Generate a drum pattern that fits this progression'
    },
    {
      label: 'Generate Bass',
      icon: Music,
      color: 'blue',
      prompt: 'Create a bass line that complements the chords'
    },
    {
      label: 'Add Melody',
      icon: Music4,
      color: 'purple',
      prompt: 'Compose a memorable melody over these chords'
    },
    {
      label: 'Improve Track',
      icon: Lightbulb,
      color: 'yellow',
      prompt: 'Analyze my current layers and suggest improvements'
    }
  ];

  // Build comprehensive context for Claude
  const buildSystemPrompt = () => {
    const context = {
      genre: selectedGenre,
      progression: {
        name: selectedProgression.name,
        chords: selectedProgression.chords,
        theory: selectedProgression.theory
      },
      bpm: bpm,
      existingLayers: layers.map(l => ({
        type: l.type,
        name: l.name,
        pattern: l.pattern
      })),
      barCount: selectedProgression.chords.length
    };

    return `You are an expert music composition assistant. Help the user create music patterns.

CURRENT COMPOSITION CONTEXT:
${JSON.stringify(context, null, 2)}

PATTERN SYNTAX RULES:
- Drums: Use k (kick), s (snare), h (hihat), - (rest)
- Melody/Bass: Use note names (c4, e4, g4, etc.)
- Separate items with spaces
- Use | to separate bars
- MUST create exactly ${context.barCount} bars to match the chord progression

YOUR RESPONSE MUST BE VALID JSON ONLY:
{
  "message": "Your conversational response to the user",
  "patterns": [
    {
      "layerType": "drums|bass|melody",
      "layerName": "Drums 1" OR null (null means create new layer),
      "pattern": "actual pattern here",
      "explanation": "brief explanation of this pattern"
    }
  ]
}

IMPORTANT RULES:
1. ALWAYS respond with ONLY valid JSON, nothing else
2. If generating new layers, set layerName to null
3. If improving existing layers, use the exact name from existingLayers
4. Patterns MUST be ${context.barCount} bars long
5. Consider the genre and chord progression when creating patterns
6. Make patterns musically appropriate and interesting
7. For melody/bass, use notes that fit the chords
8. DO NOT use markdown code blocks, ONLY raw JSON`;
  };

  // Parse AI response
  const parseAIResponse = (responseText) => {
    try {
      // Strip markdown code blocks if present
      let cleanText = responseText.trim();
      cleanText = cleanText.replace(/```json\n?/g, '');
      cleanText = cleanText.replace(/```\n?/g, '');
      cleanText = cleanText.trim();

      const parsed = JSON.parse(cleanText);

      return {
        role: 'assistant',
        content: parsed.message || 'Here are your patterns:',
        patterns: parsed.patterns || []
      };
    } catch (error) {
      console.error('Parse error:', error);
      return {
        role: 'assistant',
        content: responseText,
        patterns: []
      };
    }
  };

  // Apply pattern to layer
  const applyPattern = (patternData) => {
    if (patternData.layerName === null) {
      // Create new layer with pattern already set
      onAddLayer(patternData.layerType, patternData.pattern);
    } else {
      // Update existing layer by name
      const targetLayer = layers.find(l => l.name === patternData.layerName);
      if (targetLayer) {
        onUpdateLayer(targetLayer.id, patternData.pattern);
      }
    }
  };

  // Send message to AI
  const sendToAI = async (userMessage) => {
    setAiLoading(true);

    // Add user message to chat
    const newMessages = [...aiMessages, {
      role: 'user',
      content: userMessage
    }];
    setAiMessages(newMessages);
    setAiInput('');

    try {
      // Build context-aware prompt
      const systemPrompt = buildSystemPrompt();

      // Call backend proxy (keeps API key secure)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: systemPrompt + '\n\nUser request: ' + userMessage
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.content[0].text;

      // Parse response
      const parsedResponse = parseAIResponse(aiResponse);

      // Add AI message to chat
      setAiMessages([...newMessages, parsedResponse]);

    } catch (error) {
      console.error('AI Error:', error);
      setAiMessages([...newMessages, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again. ' + error.message,
        patterns: []
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Handle quick action click
  const handleQuickAction = (prompt) => {
    sendToAI(prompt);
  };

  // Handle input submission
  const handleSubmit = () => {
    if (aiInput.trim() && !aiLoading) {
      sendToAI(aiInput.trim());
    }
  };

  // Handle Enter key (without Shift)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      red: 'from-red-600 to-red-700 hover:from-red-500 hover:to-red-600',
      blue: 'from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600',
      purple: 'from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600',
      yellow: 'from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600'
    };
    return colors[color] || colors.purple;
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl border-2 border-purple-500/50 overflow-hidden">
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-purple-500/10 transition-colors"
        onClick={() => setAiExpanded(!aiExpanded)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-purple-300">AI Assistant</h3>
        </div>
        <button className="p-1 hover:bg-purple-500/20 rounded transition-colors">
          {aiExpanded ? (
            <ChevronUp className="w-5 h-5 text-purple-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-purple-400" />
          )}
        </button>
      </div>

      {/* Expanded Content */}
      {aiExpanded && (
        <div className="p-4 pt-0 space-y-4">
          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action.prompt)}
                  disabled={aiLoading}
                  className={`px-3 py-2 bg-gradient-to-br ${getColorClasses(action.color)} rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                >
                  <Icon className="w-4 h-4" />
                  {action.label}
                </button>
              );
            })}
          </div>

          {/* Chat Messages Area */}
          <div className="bg-gray-900/50 rounded-lg p-3 max-h-[300px] overflow-y-auto space-y-3">
            {aiMessages.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-4">
                Ask me to generate patterns or improve your composition!
              </div>
            )}

            {aiMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-gray-700 text-white'
                    : 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                  {/* Pattern Apply Buttons */}
                  {msg.patterns && msg.patterns.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.patterns.map((pattern, pIdx) => (
                        <div key={pIdx} className="bg-gray-900/50 rounded p-2 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="text-xs font-semibold text-purple-300">
                                {pattern.layerName || `New ${pattern.layerType}`}
                              </div>
                              <div className="text-xs text-gray-400 font-mono mt-1">
                                {pattern.pattern}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {pattern.explanation}
                              </div>
                            </div>
                            <button
                              onClick={() => applyPattern(pattern)}
                              className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded transition-colors whitespace-nowrap"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {aiLoading && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-xs text-purple-300">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <textarea
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want... (e.g., 'Add a funky bass line')"
              disabled={aiLoading}
              rows={2}
              className="flex-1 px-3 py-2 bg-gray-900/80 border border-gray-600/50 rounded-lg focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 text-sm resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSubmit}
              disabled={aiLoading || !aiInput.trim()}
              className="px-4 py-2 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
