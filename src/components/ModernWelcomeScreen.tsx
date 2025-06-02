
import React from 'react';
import { ArrowUpRight, Sparkles, Zap, MessageSquare, Brain, Lightbulb } from 'lucide-react';
import { HolographicOrb } from './HolographicOrb';
import { LiquidMetalButton } from './LiquidMetalButton';
import { LiquidMetalCard } from './LiquidMetalCard';
import { useChat } from '@/context/ChatContext';
import { cn } from '@/lib/utils';

const samplePrompts = [
  {
    text: "Explain quantum computing in simple terms",
    icon: Brain,
    gradient: "liquid-chrome",
    category: "Education"
  },
  {
    text: "Write a creative story about AI and humans",
    icon: Lightbulb,
    gradient: "liquid-cyan",
    category: "Creative"
  },
  {
    text: "Help me design a morning routine",
    icon: Sparkles,
    gradient: "chroma-3",
    category: "Lifestyle"
  },
  {
    text: "What are the latest AI breakthroughs in 2025?",
    icon: Zap,
    gradient: "liquid-metal",
    category: "Technology"
  }
];

export function ModernWelcomeScreen() {
  const { sendMessage, activeModel } = useChat();

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Main Hero Section with Liquid Metal Effects */}
        <div className="relative">
          {/* Background liquid metal orbs */}
          <div className="absolute -top-20 left-1/4 opacity-20">
            <HolographicOrb size="xl" variant="liquid-metal" />
          </div>
          <div className="absolute -top-10 right-1/3 opacity-15">
            <HolographicOrb size="lg" variant="liquid-cyan" />
          </div>
          
          {/* Main AI Avatar with liquid chrome effect */}
          <div className="relative w-40 h-40 mx-auto mb-8">
            <div className="absolute inset-0">
              <HolographicOrb size="2xl" variant="liquid-chrome" />
            </div>
            <div className="relative w-full h-full rounded-full bg-gradient-conic from-slate-300 via-zinc-100 via-gray-200 to-slate-300 flex items-center justify-center border border-slate-400/30 shadow-[0_0_60px_rgba(100,116,139,0.6)] backdrop-blur-sm">
              <Zap className="h-20 w-20 text-gray-700" />
            </div>
            {/* Floating liquid particles */}
            <div className="absolute -top-4 -right-4">
              <HolographicOrb size="sm" variant="liquid-cyan" />
            </div>
            <div className="absolute -bottom-4 -left-4">
              <HolographicOrb size="sm" variant="chroma-4" />
            </div>
          </div>
          
          {/* Main Title with liquid metal gradient */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-conic from-slate-400 via-zinc-200 via-gray-100 via-slate-300 to-slate-400 bg-clip-text text-transparent animate-gradient-shift">
              Welcome to
            </span>
            <br />
            <span className="bg-gradient-conic from-cyan-400 via-blue-500 via-purple-600 via-pink-500 to-cyan-400 bg-clip-text text-transparent animate-gradient-shift">
              Alfred AI
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience the future of AI conversation with 
            <span className="bg-gradient-conic from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent font-semibold"> liquid metal </span>
            powered assistance.
            <span className="block mt-2 text-lg text-gray-400">
              Powered by {typeof activeModel === 'string' ? activeModel : activeModel?.name || 'Advanced AI'} • Ready to assist
            </span>
          </p>
        </div>

        {/* Quick Actions with Liquid Metal buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <LiquidMetalButton variant="chroma" size="lg">
            <MessageSquare className="h-5 w-5 mr-2" />
            Start Conversation
          </LiquidMetalButton>
          <LiquidMetalButton variant="polarix" size="lg">
            <Brain className="h-5 w-5 mr-2" />
            Explore Features
          </LiquidMetalButton>
        </div>

        {/* Sample Prompts Grid with Liquid Metal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {samplePrompts.map((prompt, index) => (
            <SamplePromptCard
              key={index}
              prompt={prompt}
              onSelect={() => sendMessage(prompt.text)}
              delay={index * 100}
            />
          ))}
        </div>

        {/* Features Preview with Liquid Metal effects */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <FeatureCard
            icon={<Brain className="h-8 w-8" />}
            title="Advanced AI"
            description="Powered by cutting-edge language models"
            variant="alumix"
          />
          <FeatureCard
            icon={<Sparkles className="h-8 w-8" />}
            title="Liquid Metal UI"
            description="Beautiful, futuristic interface design"
            variant="polarix"
          />
          <FeatureCard
            icon={<Zap className="h-8 w-8" />}
            title="Real-time"
            description="Instant responses and smooth interactions"
            variant="chroma"
          />
        </div>
      </div>
    </div>
  );
}

function SamplePromptCard({ prompt, onSelect, delay }: {
  prompt: typeof samplePrompts[0];
  onSelect: () => void;
  delay: number;
}) {
  return (
    <div
      className="animate-fade-in opacity-0"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <LiquidMetalCard 
        variant="chroma" 
        className="group cursor-pointer hover:scale-[1.02] transition-all duration-300"
        onClick={onSelect}
      >
        <div className="relative p-6">
          {/* Liquid orb indicator */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <HolographicOrb size="xs" variant={prompt.gradient as any} />
              <span className="text-xs font-medium text-cyan-300 bg-cyan-500/10 px-2 py-1 rounded-full border border-cyan-400/20">
                {prompt.category}
              </span>
            </div>
            <prompt.icon className="h-5 w-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
          </div>
          
          {/* Prompt text */}
          <p className="text-white font-medium mb-4 text-left leading-relaxed">
            {prompt.text}
          </p>
          
          {/* Action indicator */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Click to try</span>
            <ArrowUpRight className="h-4 w-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </div>
        </div>
      </LiquidMetalCard>
    </div>
  );
}

function FeatureCard({ icon, title, description, variant }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  variant: 'alumix' | 'polarix' | 'chroma';
}) {
  const iconVariants = {
    alumix: 'text-gray-700',
    polarix: 'text-cyan-100',
    chroma: 'text-purple-100'
  };

  return (
    <LiquidMetalCard variant={variant} className="text-center p-6 group hover:scale-105 transition-all duration-300">
      <div className="relative w-16 h-16 mx-auto mb-4">
        <HolographicOrb size="md" variant={variant === 'alumix' ? 'liquid-metal' : variant === 'polarix' ? 'liquid-cyan' : 'chroma-3'} className="opacity-80 group-hover:opacity-100 transition-opacity" />
        <div className={cn("absolute inset-0 flex items-center justify-center", iconVariants[variant])}>
          {icon}
        </div>
      </div>
      <h3 className={cn("text-lg font-semibold mb-2", iconVariants[variant])}>{title}</h3>
      <p className={cn("text-sm leading-relaxed", variant === 'alumix' ? 'text-gray-600' : 'text-gray-300')}>{description}</p>
    </LiquidMetalCard>
  );
}
