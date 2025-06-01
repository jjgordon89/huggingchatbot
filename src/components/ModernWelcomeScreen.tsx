
import React from 'react';
import { ArrowUpRight, Sparkles, Zap, MessageSquare, Brain, Lightbulb } from 'lucide-react';
import { HolographicCard } from './HolographicCard';
import { HolographicOrb } from './HolographicOrb';
import { GlassButton } from './GlassButton';
import { useChat } from '@/context/ChatContext';
import { cn } from '@/lib/utils';

const samplePrompts = [
  {
    text: "Explain quantum computing in simple terms",
    icon: Brain,
    gradient: "from-purple-500 to-blue-500",
    category: "Education"
  },
  {
    text: "Write a creative story about AI and humans",
    icon: Lightbulb,
    gradient: "from-cyan-500 to-purple-500",
    category: "Creative"
  },
  {
    text: "Help me design a morning routine",
    icon: Sparkles,
    gradient: "from-blue-500 to-cyan-500",
    category: "Lifestyle"
  },
  {
    text: "What are the latest AI breakthroughs in 2025?",
    icon: Zap,
    gradient: "from-pink-500 to-purple-500",
    category: "Technology"
  }
];

export function ModernWelcomeScreen() {
  const { sendMessage, activeModel } = useChat();

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Main Hero Section */}
        <div className="relative">
          {/* Background orbs */}
          <div className="absolute -top-20 left-1/4 opacity-30">
            <HolographicOrb size="lg" variant="primary" />
          </div>
          <div className="absolute -top-10 right-1/3 opacity-20">
            <HolographicOrb size="md" variant="secondary" />
          </div>
          
          {/* Main AI Avatar */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full bg-gradient-conic from-purple-500 via-blue-500 via-cyan-400 via-purple-600 to-purple-500 animate-spin-slow blur-xl opacity-60"></div>
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center border border-purple-400/30 shadow-holographic">
              <Zap className="h-16 w-16 text-cyan-400" />
            </div>
            {/* Floating particles */}
            <div className="absolute -top-2 -right-2 w-6 h-6">
              <HolographicOrb size="sm" variant="accent" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-4 h-4">
              <HolographicOrb size="sm" variant="secondary" />
            </div>
          </div>
          
          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Welcome to
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Alfred AI
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience the future of AI conversation with holographic-powered assistance.
            <span className="block mt-2 text-lg text-gray-400">
              Powered by {activeModel?.name || 'Advanced AI'} • Ready to assist
            </span>
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <GlassButton variant="primary" size="lg" glow>
            <MessageSquare className="h-5 w-5 mr-2" />
            Start Conversation
          </GlassButton>
          <GlassButton variant="secondary" size="lg">
            <Brain className="h-5 w-5 mr-2" />
            Explore Features
          </GlassButton>
        </div>

        {/* Sample Prompts Grid */}
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

        {/* Features Preview */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <FeatureCard
            icon={<Brain className="h-8 w-8" />}
            title="Advanced AI"
            description="Powered by cutting-edge language models"
            gradient="from-purple-500 to-blue-500"
          />
          <FeatureCard
            icon={<Sparkles className="h-8 w-8" />}
            title="Holographic UI"
            description="Beautiful, futuristic interface design"
            gradient="from-cyan-500 to-purple-500"
          />
          <FeatureCard
            icon={<Zap className="h-8 w-8" />}
            title="Real-time"
            description="Instant responses and smooth interactions"
            gradient="from-pink-500 to-purple-500"
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
      <HolographicCard 
        variant="glass" 
        className="group cursor-pointer hover:scale-[1.02] transition-all duration-300"
        onClick={onSelect}
      >
        <div className="relative p-6">
          {/* Category badge */}
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-medium text-cyan-300 bg-cyan-500/10 px-2 py-1 rounded-full border border-cyan-400/20">
              {prompt.category}
            </span>
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
          
          {/* Gradient overlay */}
          <div className={cn(
            "absolute inset-0 rounded-xl bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300",
            prompt.gradient
          )} />
        </div>
      </HolographicCard>
    </div>
  );
}

function FeatureCard({ icon, title, description, gradient }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <HolographicCard variant="glass" className="text-center p-6 group hover:scale-105 transition-all duration-300">
      <div className={cn(
        "w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br flex items-center justify-center",
        gradient,
        "opacity-80 group-hover:opacity-100 transition-opacity"
      )}>
        <div className="text-white">
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
    </HolographicCard>
  );
}
