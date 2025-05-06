
import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { useSqlite } from '@/hooks/use-sqlite';
import { useToast } from '@/hooks/use-toast';
import { useLangChain } from '@/hooks/use-langchain';

interface DocumentKnowledgeLayoutProps {
  children: React.ReactNode;
  sidebarOpen?: boolean;
}

export function DocumentKnowledgeLayout({ 
  children,
  sidebarOpen = false
}: DocumentKnowledgeLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(sidebarOpen);
  const { isInitialized, error } = useSqlite();
  const { toast } = useToast();
  const langchain = useLangChain();
  
  // Listen for sidebar state changes (could come from parent components)
  useEffect(() => {
    setIsSidebarOpen(sidebarOpen);
  }, [sidebarOpen]);

  // Log database and LangChain status
  useEffect(() => {
    if (isInitialized) {
      console.log("Database and LangChain services initialized in DocumentKnowledgeLayout");
    }
    
    if (error) {
      toast({
        title: "Database Error",
        description: error,
        variant: "destructive"
      });
    }
  }, [isInitialized, error, toast]);

  return (
    <div className="relative flex min-h-screen w-full">
      {/* Make sure content adjusts when sidebar is open/closed */}
      <div 
        className={cn(
          "flex-1 overflow-auto transition-all duration-300",
          isSidebarOpen ? "ml-[240px]" : "ml-[60px]" // Adjust based on your sidebar width
        )}
      >
        <div className="container mx-auto py-6 max-w-[1200px]">
          {children}
        </div>
      </div>
    </div>
  );
}
