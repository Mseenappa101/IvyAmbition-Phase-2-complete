"use client";

import { useState, useCallback, useRef } from "react";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface TopicIdea {
  id: string;
  title: string;
  description: string;
}

interface UseAIChatReturn {
  messages: ChatMessage[];
  topicIdeas: TopicIdea[];
  isStreaming: boolean;
  error: string | null;
  remainingRequests: number | null;
  sendMessage: (userInput: string) => Promise<void>;
  removeTopicIdea: (id: string) => void;
}

function extractTopicIdeas(text: string): {
  ideas: TopicIdea[];
  cleanedText: string;
} {
  const ideas: TopicIdea[] = [];
  let cleanedText = text;

  const regex =
    /<topic_idea>\s*<title>([\s\S]*?)<\/title>\s*<description>([\s\S]*?)<\/description>\s*<\/topic_idea>/g;

  let match;
  while ((match = regex.exec(text)) !== null) {
    ideas.push({
      id: crypto.randomUUID(),
      title: match[1].trim(),
      description: match[2].trim(),
    });
    cleanedText = cleanedText.replace(match[0], "");
  }

  // Clean up extra whitespace left by removed tags
  cleanedText = cleanedText.replace(/\n{3,}/g, "\n\n").trim();

  return { ideas, cleanedText };
}

export function useAIChat(toolType: string): UseAIChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [topicIdeas, setTopicIdeas] = useState<TopicIdea[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingRequests, setRemainingRequests] = useState<number | null>(
    null
  );
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (userInput: string) => {
      if (!userInput.trim() || isStreaming) return;

      setError(null);

      const userMessage: ChatMessage = { role: "user", content: userInput };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setIsStreaming(true);

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tool_type: toolType,
            messages: updatedMessages,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error ?? `Request failed with status ${response.status}`
          );
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream available");

        const decoder = new TextDecoder();
        let fullText = "";

        // Add empty assistant message that we'll build up
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;

            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "meta") {
                setRemainingRequests(data.remaining);
              } else if (data.type === "text") {
                fullText += data.text;

                // Extract any complete topic ideas
                const { ideas, cleanedText } = extractTopicIdeas(fullText);
                if (ideas.length > 0) {
                  setTopicIdeas((prev) => [...prev, ...ideas]);
                  fullText = cleanedText;
                }

                // Update the assistant message with cleaned text
                // (strip any partial/incomplete topic_idea tags for display)
                const displayText = fullText
                  .replace(/<topic_idea>[\s\S]*$/, "")
                  .trim();

                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: displayText,
                  };
                  return updated;
                });
              } else if (data.type === "error") {
                throw new Error(data.error);
              }
            } catch (parseErr) {
              // Skip malformed SSE lines
              if (parseErr instanceof SyntaxError) continue;
              throw parseErr;
            }
          }
        }

        // Final extraction pass on complete text
        const { ideas, cleanedText } = extractTopicIdeas(fullText);
        if (ideas.length > 0) {
          setTopicIdeas((prev) => [...prev, ...ideas]);
        }

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: cleanedText || fullText,
          };
          return updated;
        });
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        // Remove the empty assistant message on error
        setMessages((prev) => {
          if (
            prev.length > 0 &&
            prev[prev.length - 1].role === "assistant" &&
            prev[prev.length - 1].content === ""
          ) {
            return prev.slice(0, -1);
          }
          return prev;
        });
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [messages, isStreaming, toolType]
  );

  const removeTopicIdea = useCallback((id: string) => {
    setTopicIdeas((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    messages,
    topicIdeas,
    isStreaming,
    error,
    remainingRequests,
    sendMessage,
    removeTopicIdea,
  };
}
