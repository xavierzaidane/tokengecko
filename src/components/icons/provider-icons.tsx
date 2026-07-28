'use client';

import React from 'react';

export interface ProviderIconProps {
  provider?: string;
  size?: number;
  className?: string;
}

export function ProviderIcon({
  provider = 'openai',
  size = 16,
  className = '',
}: ProviderIconProps) {
  const p = provider.toLowerCase();

  let src = '/OpenAI.png';
  let alt = 'OpenAI';

  if (p.includes('openai') || p.includes('gpt')) {
    src = '/OpenAI.png';
    alt = 'OpenAI';
  } else if (p.includes('anthropic') || p.includes('claude')) {
    src = '/Anthropic.svg';
    alt = 'Anthropic';
  } else if (p.includes('google') || p.includes('gemini')) {
    src = '/GoogleGemini.svg';
    alt = 'Google Gemini';
  } else if (p.includes('deepseek')) {
    src = '/DeepSeek.png';
    alt = 'DeepSeek';
  } else if (p.includes('meta') || p.includes('llama')) {
    src = '/Meta.png';
    alt = 'Meta';
  } else if (p.includes('mistral')) {
    src = '/Mistral.png';
    alt = 'Mistral';
  } else if (p.includes('qwen') || p.includes('alibaba')) {
    src = '/Qwen.png';
    alt = 'Qwen';
  } else if (p.includes('cohere')) {
    src = '/Cohere.png';
    alt = 'Cohere';
  } else if (p.includes('perplexity')) {
    src = '/Perplexity.svg';
    alt = 'Perplexity';
  } else if (p.includes('amazon') || p.includes('bedrock') || p.includes('nova')) {
    src = '/Bedrock.svg';
    alt = 'Amazon Bedrock';
  } else if (p.includes('microsoft') || p.includes('phi')) {
    src = '/Microsoft.svg';
    alt = 'Microsoft';
  } else if (p.includes('nvidia') || p.includes('nemotron')) {
    src = '/Nvidia.png';
    alt = 'Nvidia';
  } else if (p.includes('xai') || p.includes('x-ai') || p.includes('grok')) {
    src = '/xAI.svg';
    alt = 'xAI';
  }

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`object-contain shrink-0 ${className}`}
    />
  );
}

export const OpenAIIcon = (props: Omit<ProviderIconProps, 'provider'>) => (
  <ProviderIcon provider="openai" {...props} />
);
export const AnthropicIcon = (props: Omit<ProviderIconProps, 'provider'>) => (
  <ProviderIcon provider="anthropic" {...props} />
);
export const GeminiIcon = (props: Omit<ProviderIconProps, 'provider'>) => (
  <ProviderIcon provider="google" {...props} />
);
export const DeepSeekIcon = (props: Omit<ProviderIconProps, 'provider'>) => (
  <ProviderIcon provider="deepseek" {...props} />
);
export const MetaIcon = (props: Omit<ProviderIconProps, 'provider'>) => (
  <ProviderIcon provider="meta" {...props} />
);
export const MistralIcon = (props: Omit<ProviderIconProps, 'provider'>) => (
  <ProviderIcon provider="mistral" {...props} />
);
export const QwenIcon = (props: Omit<ProviderIconProps, 'provider'>) => (
  <ProviderIcon provider="qwen" {...props} />
);
export const CohereIcon = (props: Omit<ProviderIconProps, 'provider'>) => (
  <ProviderIcon provider="cohere" {...props} />
);
export const PerplexityIcon = (props: Omit<ProviderIconProps, 'provider'>) => (
  <ProviderIcon provider="perplexity" {...props} />
);
export const AmazonIcon = (props: Omit<ProviderIconProps, 'provider'>) => (
  <ProviderIcon provider="amazon" {...props} />
);
export const MicrosoftIcon = (props: Omit<ProviderIconProps, 'provider'>) => (
  <ProviderIcon provider="microsoft" {...props} />
);
export const NvidiaIcon = (props: Omit<ProviderIconProps, 'provider'>) => (
  <ProviderIcon provider="nvidia" {...props} />
);
export const XAIIcon = (props: Omit<ProviderIconProps, 'provider'>) => (
  <ProviderIcon provider="xai" {...props} />
);
