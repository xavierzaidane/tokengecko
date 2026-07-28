'use client';

import React from 'react';

interface MacbookAir3DProps {
  className?: string;
}

export function MacbookAir3D({ className = '' }: MacbookAir3DProps) {
  return (
    <div className={`relative flex items-center justify-center py-6 -mb-10 select-none ${className}`}>
      {/* Ambient Backlight Glow */}
      <div className="absolute w-72 h-48 bg-accent-orange/15 blur-3xl rounded-full pointer-events-none -translate-y-6" />

      {/* 3D Perspective Canvas Container */}
      <div className="w-[320px] sm:w-[420px] h-[220px] sm:h-[260px] relative [perspective:1000px] flex flex-col items-center justify-center">
        
        {/* Animated Floating 3D Laptop Body */}
        <div className="w-full h-full relative [transform-style:preserve-3d] animate-[macbook-float_6s_easeInOut_infinite]">
          
          {/* Laptop Screen Lid */}
          <div className="w-[280px] sm:w-[360px] h-[170px] sm:h-[210px] mx-auto rounded-t-xl bg-zinc-900 border-[3px] border-zinc-700 shadow-2xl relative overflow-hidden flex flex-col items-center justify-between p-1.5 [transform-origin:bottom] [transform:rotateX(-8deg)] transition-transform duration-700 hover:[transform:rotateX(-2deg)]">
            
           

            {/* Screen Display Content (TokenGecko Live Inspector Preview) */}
            <div className="w-full flex-1 bg-zinc-950 rounded-md border border-zinc-800/80 p-2.5 flex flex-col justify-between font-mono text-[10px] text-zinc-300 relative overflow-hidden group">
              {/* Subtle Screen Reflection Gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

              {/* IDE Header Bar */}
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500/80" />
                  <span className="w-2 h-2 rounded-full bg-amber-500/80" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
                  <span className="text-[9px] text-zinc-500 ml-1">TokenGecko • Inspector</span>
                </div>
              </div>

              {/* Mock Code & Analysis Lines */}
              <div className="space-y-1 my-auto">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-600">01</span>
                  <span className="text-amber-400">const</span>
                  <span className="text-sky-300">prompt</span>
                  <span className="text-zinc-500">=</span>
                  <span className="text-emerald-400 truncate">"Analyze multi-model LLM tokens..."</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-600">02</span>
                  <span className="text-purple-400">await</span>
                  <span className="text-accent-orange font-bold">inspectPrompt</span>
                  <span className="text-zinc-400">([OpenAI, Claude, Gemini]);</span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-zinc-900">
                  <span className="text-zinc-600">03</span>
                  <span className="text-emerald-400 font-bold">✓ 3 Models Evaluated</span>
                  <span className="text-zinc-500 font-sans text-[8px] ml-auto">0.0004s</span>
                </div>
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between text-[8px] text-zinc-500 pt-1 border-t border-zinc-900">
                <span>UTF-8 • TSX</span>
                <span className="text-zinc-400">Waiting for prompt input...</span>
              </div>
            </div>
          </div>

          {/* Laptop Base Keyboard Deck */}
          <div className="w-[300px] sm:w-[380px] h-[16px] mx-auto bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 rounded-b-xl border-x border-b border-zinc-600 relative flex flex-col items-center justify-start [transform:rotateX(65deg)] [transform-origin:top] -mt-1">
            {/* Keyboard Notch / Opening Indent */}
            <div className="w-12 h-1 bg-zinc-950 rounded-b-sm mx-auto" />
            
            {/* Subtle Trackpad highlight */}
            <div className="w-16 h-1 bg-zinc-600/40 rounded-sm mt-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
