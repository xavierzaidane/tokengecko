import { TaskType } from '@/lib/analysis/schema';

export interface TaskClassification {
  taskType: TaskType;
  label: string;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

export function classifyPromptTaskType(
  promptText: string,
  tokenCount: number = 0
): TaskClassification {
  if (!promptText || promptText.trim().length === 0) {
    return {
      taskType: 'general',
      label: 'General Task',
      confidence: 'low',
      reason: 'Empty prompt text',
    };
  }

  const text = promptText.toLowerCase();

  // 1. Coding Task Classifier
  const codeBlockMatches = promptText.match(/```[\s\S]*?```/g);
  const codingKeywords = [
    'function',
    'const ',
    'let ',
    'var ',
    'import ',
    'export ',
    'def ',
    'class ',
    'return ',
    'async ',
    'await ',
    'interface ',
    'type ',
    'select ',
    'from ',
    'where ',
    'public static',
    '#include',
  ];

  const codingScore =
    (codeBlockMatches ? codeBlockMatches.length * 3 : 0) +
    codingKeywords.filter((kw) => text.includes(kw)).length;

  if (codingScore >= 3 || codeBlockMatches) {
    return {
      taskType: 'coding',
      label: 'Coding & Development',
      confidence: codingScore > 5 ? 'high' : 'medium',
      reason: 'Detected programming syntax, code fences, or keywords.',
    };
  }

  // 2. Reasoning Task Classifier
  const reasoningKeywords = [
    'step-by-step',
    'step by step',
    'prove that',
    'calculate',
    'probability',
    'equation',
    'theorem',
    'derive',
    'logical deduction',
    'think carefully',
    'reason through',
    'math problem',
    'solve for',
    '\\sum',
    '\\int',
    '\\frac',
  ];

  const reasoningScore = reasoningKeywords.filter((kw) =>
    text.includes(kw)
  ).length;

  if (reasoningScore >= 2) {
    return {
      taskType: 'reasoning',
      label: 'Complex Reasoning & Logic',
      confidence: reasoningScore > 3 ? 'high' : 'medium',
      reason: 'Detected mathematical formulas or step-by-step reasoning prompts.',
    };
  }

  // 3. Long-Context Task Classifier
  const longContextKeywords = [
    '# file:',
    '# document',
    'reference content',
    'source code',
    'attached files',
    '<document>',
    '<context>',
  ];

  const hasLongContextIndicators = longContextKeywords.some((kw) =>
    text.includes(kw)
  );

  if (tokenCount > 8000 || (tokenCount > 3000 && hasLongContextIndicators)) {
    return {
      taskType: 'longContext',
      label: 'Long-Context Analysis',
      confidence: tokenCount > 15000 ? 'high' : 'medium',
      reason: 'Large token payload or multi-document reference structure.',
    };
  }

  // 4. Default General Task
  return {
    taskType: 'general',
    label: 'General Assistant',
    confidence: 'medium',
    reason: 'Standard conversational or instructional prompt.',
  };
}
