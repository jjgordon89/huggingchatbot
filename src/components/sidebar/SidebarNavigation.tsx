import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  Home,
  FileText,
  Workflow,
  BrainCircuit,
  Database,
  MessageSquare,
  Layers,
  Sparkles,
  BookOpen,
  ExternalLink
} from 'lucide-react';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: string | number;
  external?: boolean;
}

interface NavItemProps extends NavItem {
  isActive?: boolean;
  isCollapsed?: boolean;
}

const NavItemComponent = ({ icon, label, href, isActive, isCollapsed, badge, external }: NavItemProps) => {
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

interface SidebarNavigationProps {
  collapsed: boolean;
  showAllSecondary?: boolean;
  onShowAllSecondary?: () => void;
}

export function SidebarNavigation({ collapsed, showAllSecondary = false, onShowAllSecondary }: SidebarNavigationProps) {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const mainNavItems: NavItem[] = [
    { icon: <Home className="h-4 w-4" />, label: 'Home', href: '/' },
    { icon: <MessageSquare className="h-4 w-4" />, label: 'Chat', href: '/chat' },
    { icon: <Workflow className="h-4 w-4" />, label: 'Workflows', href: '/workflows', badge: "New" },
    { icon: <FileText className="h-4 w-4" />, label: 'Documents', href: '/documents' },
    { icon: <Database className="h-4 w-4" />, label: 'Knowledge Base', href: '/knowledge-base' },
    { icon: <BrainCircuit className="h-4 w-4" />, label: 'Fine-Tuning', href: '/fine-tuning' },
  ];

  const secondaryNavItems: NavItem[] = [
    { icon: <Layers className="h-4 w-4" />, label: 'Templates', href: '/templates' },
    { icon: <Sparkles className="h-4 w-4" />, label: 'Discover', href: '/discover' },
    { icon: <BookOpen className="h-4 w-4" />, label: 'Documentation', href: 'https://docs.example.com', external: true },
  ];

  const visibleSecondaryItems = showAllSecondary 
    ? secondaryNavItems 
    : secondaryNavItems.slice(0, collapsed ? 2 : 3);

  return (
    <div className={cn("flex flex-col gap-1", collapsed && "items-center")}>
      {/* Main Navigation */}
      {mainNavItems.map((item, i) => (
        <TooltipProvider key={i} delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild={collapsed}>
              <div>
                <NavItemComponent
                  {...item}
                  isActive={isActive(item.href)}
                  isCollapsed={collapsed}
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

      {/* Separator */}
      <div className={cn("my-2 border-t border-slate-400/20 mx-2", collapsed && "w-4")}></div>
      
      {/* Secondary Navigation */}
      {visibleSecondaryItems.map((item, i) => (
        <TooltipProvider key={i} delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild={collapsed}>
              <div>
                <NavItemComponent
                  {...item}
                  isActive={isActive(item.href)}
                  isCollapsed={collapsed}
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
      
      {/* Show More Button */}
      {secondaryNavItems.length > 3 && !showAllSecondary && !collapsed && onShowAllSecondary && (
        <button 
          className="justify-start text-gray-400 text-sm px-3 py-2 h-auto hover:text-cyan-400 hover:bg-slate-700/50 rounded-2xl transition-colors"
          onClick={onShowAllSecondary}
        >
          Show more ({secondaryNavItems.length - 3})
        </button>
      )}
    </div>
  );
}