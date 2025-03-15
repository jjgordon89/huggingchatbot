
import { 
  Brain, 
  GraduationCap, 
  FileText, 
  Globe, 
  Save, 
  BarChart
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type SkillProps = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  description: string;
};

const Skill = ({ icon, label, active = true, description }: SkillProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`flex items-center gap-1.5 ${active ? 'opacity-100' : 'opacity-50'}`}>
          <Badge 
            variant={active ? "default" : "outline"} 
            className="px-2 py-1 flex items-center gap-1.5 cursor-help"
          >
            {icon}
            <span>{label}</span>
          </Badge>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="w-64 text-sm">{description}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export function AgentSkills() {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <Skill 
        icon={<Brain className="h-3.5 w-3.5" />} 
        label="RAG & Memory" 
        active={true}
        description="Knowledge retrieval from your documents with long-term memory capabilities" 
      />
      
      <Skill 
        icon={<GraduationCap className="h-3.5 w-3.5" />} 
        label="Continuous Learning" 
        active={true}
        description="The assistant adapts to your preferences and continuously improves over time" 
      />
      
      <Skill 
        icon={<FileText className="h-3.5 w-3.5" />} 
        label="Document Analysis" 
        active={true}
        description="View and summarize documents with detailed information extraction" 
      />
      
      <Skill 
        icon={<Globe className="h-3.5 w-3.5" />} 
        label="Web Search" 
        active={true}
        description="Search and retrieve information from the internet" 
      />
      
      <Skill 
        icon={<Save className="h-3.5 w-3.5" />} 
        label="File Generation" 
        active={true}
        description="Generate and save files to your browser for offline use" 
      />
      
      <Skill 
        icon={<BarChart className="h-3.5 w-3.5" />} 
        label="Chart Visualization" 
        active={true}
        description="Generate visual charts and graphs from your data" 
      />
    </div>
  );
}
