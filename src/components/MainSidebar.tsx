
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WorkspaceSelector } from '@/components/WorkspaceSelector';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeToggle } from '@/components/ThemeToggle';
import { HolographicOrb } from '@/components/HolographicOrb';
import { SidebarNavigation } from '@/components/sidebar/SidebarNavigation';
import { cn } from '@/lib/utils';
import {
  Settings,
  PanelLeft,
  HelpCircle
} from 'lucide-react';

interface MainSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function MainSidebar({ collapsed = false, onToggleCollapse }: MainSidebarProps) {
  const [showAllSecondary, setShowAllSecondary] = useState(false);

  return (
    <aside className={cn(
      "flex flex-col border-r border-slate-400/20 bg-gradient-to-b from-slate-900 to-gray-900 relative",
      collapsed ? "w-[60px]" : "w-64"
    )}>
      {/* Liquid metal background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-blue-500/3 to-cyan-400/5 pointer-events-none" />
      
      <div className={cn(
        "flex h-14 items-center border-b border-slate-400/20 px-4 relative z-10",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {collapsed ? (
          <div className="relative">
            <HolographicOrb size="xs" variant="liquid-cyan" />
          </div>
        ) : (
          <Link to="/" className="flex items-center gap-3">
            <HolographicOrb size="xs" variant="liquid-cyan" />
            <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">AI Platform</span>
          </Link>
        )}
        
        {!collapsed && (
          <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="text-gray-300 hover:text-cyan-400 hover:bg-cyan-400/10">
            <PanelLeft className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 relative z-10">
          <SidebarNavigation 
            collapsed={collapsed}
            showAllSecondary={showAllSecondary}
            onShowAllSecondary={() => setShowAllSecondary(true)}
          />
        </div>
      </ScrollArea>
      
      <div className={cn(
        "mt-auto border-t border-slate-400/20 p-2 relative z-10",
        collapsed ? "flex flex-col items-center" : ""
      )}>
        {!collapsed && (
          <div className="mb-2">
            <WorkspaceSelector />
          </div>
        )}
        
        <div className={cn("flex items-center", collapsed ? "flex-col gap-2" : "justify-between")}>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/profile">
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-300 hover:text-cyan-400 hover:bg-cyan-400/10">
                    <Settings className="h-5 w-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side={collapsed ? "right" : "top"} className="bg-slate-800 border-slate-600 text-cyan-400">Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <ThemeToggle iconOnly={collapsed} />
                </div>
              </TooltipTrigger>
              <TooltipContent side={collapsed ? "right" : "top"} className="bg-slate-800 border-slate-600 text-cyan-400">Theme</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-300 hover:text-cyan-400 hover:bg-cyan-400/10">
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={collapsed ? "right" : "top"} className="bg-slate-800 border-slate-600 text-cyan-400">Help</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </aside>
  );
}
