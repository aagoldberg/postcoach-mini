import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (client) return client;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }

  client = new Anthropic({ apiKey });
  return client;
}

export interface LLMResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Call Claude with structured output expectations
 */
export async function callClaude<T>(
  systemPrompt: string,
  userPrompt: string,
  parseResponse: (text: string) => T
): Promise<LLMResponse<T>> {
  try {
    const anthropic = getAnthropicClient();

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      temperature: 0.3, // Low temperature for more deterministic output
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Extract text from response
    const textBlock = message.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return { success: false, error: 'No text response from Claude' };
    }

    const data = parseResponse(textBlock.text);
    return { success: true, data };
  } catch (error) {
    console.error('Claude API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Batch call Claude for multiple items (more efficient)
 */
export async function batchCallClaude<T>(
  systemPrompt: string,
  items: { id: string; prompt: string }[],
  parseResponse: (text: string, id: string) => T
): Promise<Map<string, LLMResponse<T>>> {
  const results = new Map<string, LLMResponse<T>>();

  // Process in parallel with concurrency limit
  const CONCURRENCY = 3;

  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = items.slice(i, i + CONCURRENCY);

    const batchResults = await Promise.all(
      batch.map(async (item) => {
        const result = await callClaude(systemPrompt, item.prompt, (text) =>
          parseResponse(text, item.id)
        );
        return { id: item.id, result };
      })
    );

    for (const { id, result } of batchResults) {
      results.set(id, result);
    }
  }

  return results;
}
