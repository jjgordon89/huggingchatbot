
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useChat } from "@/context/ChatContext";
import { 
  BookOpen, 
  FileSearch, 
  PlusCircle, 
  Sliders, 
  Globe, 
  Bot, 
  Info, 
  CircleHelp 
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AdvancedRagSettings() {
  const { 
    ragEnabled, 
    setRagEnabled, 
    webSearchEnabled, 
    setWebSearchEnabled, 
    ragSettings,
    updateRagSettings
  } = useChat();

  const [activeTab, setActiveTab] = useState<string>("documents");

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sliders className="h-5 w-5" />
            Advanced Knowledge Settings
          </CardTitle>
          <CardDescription>
            Configure how Alfred uses your documents and web search
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="rag-enabled" className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  Document Knowledge
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5">
                        <CircleHelp className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-[300px] text-sm">
                        When enabled, Alfred will consult your uploaded documents to provide more accurate answers
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Switch 
                id="rag-enabled" 
                checked={ragEnabled} 
                onCheckedChange={setRagEnabled} 
              />
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="web-search-enabled" className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4" />
                  Web Search
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5">
                        <CircleHelp className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-[300px] text-sm">
                        When enabled, Alfred will search the web for up-to-date information before responding
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Switch 
                id="web-search-enabled" 
                checked={webSearchEnabled} 
                onCheckedChange={setWebSearchEnabled} 
              />
            </div>
          </div>
  
          {(ragEnabled || webSearchEnabled) && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="documents" disabled={!ragEnabled}>
                  <div className="flex items-center gap-1.5">
                    <FileSearch className="h-4 w-4" />
                    Documents
                  </div>
                </TabsTrigger>
                <TabsTrigger value="search" disabled={!webSearchEnabled}>
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-4 w-4" />
                    Search
                  </div>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="documents" className="space-y-4">
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Number of documents to retrieve</Label>
                      <span className="text-sm font-medium">{ragSettings.topK}</span>
                    </div>
                    <Slider 
                      value={[ragSettings.topK]} 
                      min={1} 
                      max={10} 
                      step={1}
                      onValueChange={([value]) => updateRagSettings({ topK: value })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Retrieve between 1-10 documents for each query
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Relevance threshold (%)</Label>
                      <span className="text-sm font-medium">{ragSettings.similarityThreshold}%</span>
                    </div>
                    <Slider 
                      value={[ragSettings.similarityThreshold]} 
                      min={50} 
                      max={95} 
                      step={5}
                      onValueChange={([value]) => updateRagSettings({ similarityThreshold: value })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Only include documents with relevance above this threshold
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch 
                      id="enhanced-context" 
                      checked={ragSettings.enhancedContext} 
                      onCheckedChange={(checked) => updateRagSettings({ enhancedContext: checked })}
                    />
                    <div className="grid gap-1.5">
                      <Label htmlFor="enhanced-context" className="font-medium">Enhanced Context</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically extract and structure information from documents for better understanding
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="search" className="space-y-4">
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Number of search results</Label>
                      <span className="text-sm font-medium">{ragSettings.searchResultsCount}</span>
                    </div>
                    <Slider 
                      value={[ragSettings.searchResultsCount]} 
                      min={1} 
                      max={10} 
                      step={1}
                      onValueChange={([value]) => updateRagSettings({ searchResultsCount: value })}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Time range</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {["day", "week", "month", "year"].map((period) => (
                        <Button 
                          key={period}
                          variant={ragSettings.searchTimeRange === period ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateRagSettings({ searchTimeRange: period as "day" | "week" | "month" | "year" })}
                          className="text-xs"
                        >
                          Past {period}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch 
                      id="auto-citation" 
                      checked={ragSettings.autoCitation} 
                      onCheckedChange={(checked) => updateRagSettings({ autoCitation: checked })}
                    />
                    <div className="grid gap-1.5">
                      <Label htmlFor="auto-citation" className="font-medium">Automatic Citations</Label>
                      <p className="text-xs text-muted-foreground">
                        Generate citations for facts from search results
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
        <CardFooter className="border-t pt-4 pb-2">
          <div className="flex justify-between items-center w-full">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1.5 text-xs"
              onClick={() => {
                // Reset to defaults
                updateRagSettings({
                  topK: 3,
                  similarityThreshold: 70,
                  enhancedContext: false,
                  searchResultsCount: 3,
                  searchTimeRange: "month",
                  autoCitation: true
                });
              }}
            >
              <Info className="h-3.5 w-3.5" />
              Reset to defaults
            </Button>
            
            <Button 
              variant="default" 
              size="sm"
              className="flex items-center gap-1.5 text-xs"
              onClick={() => {
                // Apply changes
                updateRagSettings(ragSettings);
              }}
            >
              <Bot className="h-3.5 w-3.5" />
              Apply settings
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
