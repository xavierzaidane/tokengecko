"use client";

import AutoScroll from "embla-carousel-auto-scroll";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface Logo {
  id: string;
  description: string;
  image: string;
  className?: string;
}

interface Logos3Props {
  heading?: string;
  logos?: Logo[];
  className?: string;
}

const defaultLogos: Logo[] = [
  {
    id: "logo-1",
    description: "OpenAI",
    image: "/OpenAI.png",
    className: "h-9 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity",
  },
  {
    id: "logo-2",
    description: "Anthropic",
    image: "/Anthropic.svg",
    className: "h-9 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity",
  },
  {
    id: "logo-3",
    description: "Gemini",
    image: "/GoogleGemini.svg",
    className: "h-9 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity",
  },
  {
    id: "logo-4",
    description: "DeepSeek",
    image: "/DeepSeek.png",
    className: "h-9 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity",
  },
  {
    id: "logo-5",
    description: "Meta",
    image: "/Meta.png",
    className: "h-9 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity",
  },
  {
    id: "logo-6",
    description: "Mistral",
    image: "/Mistral.png",
    className: "h-9 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity",
  },
  {
    id: "logo-7",
    description: "Cohere",
    image: "/Cohere.png",
    className: "h-9 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity",
  },
  {
    id: "logo-8",
    description: "Qwen",
    image: "/Qwen.png",
    className: "h-9 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity",
  },
  {
    id: "logo-9",
    description: "Nvidia",
    image: "/Nvidia.png",
    className: "h-9 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity",
  },
];

const Logos3 = ({
  heading = "Benchmarking 50+ models from industry-leading AI providers",
  logos = defaultLogos,
  className = "",
}: Logos3Props) => {
  return (
    <section id="models" className={`max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16 relative z-10 overflow-hidden ${className}`}>
      <div className="container flex flex-col items-center text-center">
        <h2 className="text-sm font-normal tracking-widest text-white/40 text-center">
          {heading}
        </h2>
      </div>
      <div className="pt-8">
        <div className="relative mx-auto flex items-center justify-center lg:max-w-8xl">
          <Carousel
            opts={{ loop: true }}
            plugins={[AutoScroll({ playOnInit: true, speed: 1.2 })]}
          >
            <CarouselContent className="ml-0">
              {logos.map((logo) => (
                <CarouselItem
                  key={logo.id}
                  className="flex basis-1/3 justify-center pl-0 sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
                >
                  <div className="mx-6 flex shrink-0 flex-col items-center justify-center gap-2 group cursor-default">
                    <div>
                      <img
                        src={logo.image}
                        alt={logo.description}
                        className={logo.className}
                      />
                    </div>
                    <span className="text-[11px] font-mono font-medium text-white/50 group-hover:text-white transition-colors">
                      {logo.description}
                    </span>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-app to-transparent pointer-events-none z-10" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-app to-transparent pointer-events-none z-10" />
        </div>
      </div>
    </section>
  );
};

export { Logos3 };
