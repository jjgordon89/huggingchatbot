
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WorkspaceSelector } from '@/components/WorkspaceSelector';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LiquidMetalButton } from '@/components/LiquidMetalButton';
import { HolographicOrb } from '@/components/HolographicOrb';
import { cn } from '@/lib/utils';
import {
  Home,
  FileText,
  Settings,
  PanelLeft,
  Workflow,
  BrainCircuit,
  Database,
  MessageSquare,
  HelpCircle,
  BookOpen,
  LifeBuoy,
  Sparkles,
  Layers,
  ExternalLink
} from 'lucide-react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
  isCollapsed?: boolean;
  badge?: string | number;
  external?: boolean;
}

const NavItem = ({ icon, label, href, isActive, isCollapsed, badge, external }: NavItemProps) => {
  const content = (
    <div className={cn(
      "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition-all duration-300",
      isActive 
        ? "bg-gradient-to-r from-purple-600/20 via-blue-500/15 to-cyan-400/20 border border-purple-500/40 text-cyan-400 font-medium shadow-[0_0_20px_rgba(147,51,234,0.3)]" 
        : "text-gray-300 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 hover:text-cyan-400",
      isCollapsed ? "justify-center py-3" : "w-full"
    )}>
      <div className={cn(
        "flex items-center justify-center",
        isActive && "text-cyan-400"
      )}>
        {icon}
      </div>
      {!isCollapsed && (
        <span className="flex-1">{label}</span>
      )}
      {!isCollapsed && badge && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-cyan-400 text-xs font-medium text-white">
          {badge}
        </span>
      )}
      {!isCollapsed && external && (
        <ExternalLink className="h-3 w-3" />
      )}
    </div>
  );

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block">
      {content}
    </a>
  ) : (
    <Link to={href}>{content}</Link>
  );
};

interface MainSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function MainSidebar({ collapsed = false, onToggleCollapse }: MainSidebarProps) {
  const location = useLocation();
  const [showAll, setShowAll] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const mainNavItems = [
    { icon: <Home className="h-4 w-4" />, label: 'Home', href: '/' },
    { icon: <MessageSquare className="h-4 w-4" />, label: 'Chat', href: '/chat' },
    { icon: <Workflow className="h-4 w-4" />, label: 'Workflows', href: '/workflows', badge: "New" },
    { icon: <FileText className="h-4 w-4" />, label: 'Documents', href: '/documents' },
    { icon: <Database className="h-4 w-4" />, label: 'Knowledge Base', href: '/knowledge-base' },
    { icon: <BrainCircuit className="h-4 w-4" />, label: 'Fine-Tuning', href: '/fine-tuning' },
  ];

  const secondaryNavItems = [
    { icon: <Layers className="h-4 w-4" />, label: 'Templates', href: '/templates' },
    { icon: <Sparkles className="h-4 w-4" />, label: 'Discover', href: '/discover' },
    { icon: <BookOpen className="h-4 w-4" />, label: 'Documentation', href: 'https://docs.example.com', external: true },
  ];

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
        <div className={cn("flex flex-col gap-1 p-2 relative z-10", collapsed && "items-center")}>
          {mainNavItems.map((item, i) => (
            <TooltipProvider key={i} delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild={collapsed}>
                  <div>
                    <NavItem
                      icon={item.icon}
                      label={item.label}
                      href={item.href}
                      isActive={isActive(item.href)}
                      isCollapsed={collapsed}
                      badge={item.badge}
                    />
                  </div>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="bg-slate-800 border-slate-600 text-cyan-400">
                    {item.label}
                    {item.badge && <span className="ml-1 text-xs">({item.badge})</span>}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ))}

          <div className={cn("my-2 border-t border-slate-400/20 mx-2", collapsed && "w-4")}></div>
          
          {secondaryNavItems.slice(0, showAll ? secondaryNavItems.length : (collapsed ? 2 : 3)).map((item, i) => (
            <TooltipProvider key={i} delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild={collapsed}>
                  <div>
                    <NavItem
                      icon={item.icon}
                      label={item.label}
                      href={item.href}
                      isActive={isActive(item.href)}
                      isCollapsed={collapsed}
                      external={item.external}
                    />
                  </div>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="bg-slate-800 border-slate-600 text-cyan-400">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ))}
          
          {secondaryNavItems.length > 3 && !showAll && !collapsed && (
            <Button 
              variant="ghost" 
              className="justify-start text-gray-400 text-sm px-3 py-2 h-auto hover:text-cyan-400 hover:bg-slate-700/50"
              onClick={() => setShowAll(true)}
            >
              Show more ({secondaryNavItems.length - 3})
            </Button>
          )}
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
