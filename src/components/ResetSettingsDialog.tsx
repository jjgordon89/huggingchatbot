
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useTheme } from '@/context/ThemeContext';
import { useDensity } from '@/context/DensityContext';
import { useToast } from '@/hooks/use-toast';

interface ResetSettingsDialogProps {
  onConfirm?: () => void;
  children: React.ReactNode;
}

const ResetSettingsDialog: React.FC<ResetSettingsDialogProps> = ({ onConfirm, children }) => {
  const { setTheme } = useTheme();
  const { setDensity } = useDensity();
  const { toast } = useToast();
  
  const handleReset = () => {
    // Reset theme to system
    setTheme('system');
    
    // Reset density to default
    setDensity('default');
    
    // Show confirmation toast
    toast({
      title: "Settings Reset",
      description: "Your application settings have been reset to their defaults.",
    });
    
    // Call the onConfirm callback if provided
    if (onConfirm) {
      onConfirm();
    }
  };
  
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Reset</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to reset all application settings to their defaults? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleReset}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ResetSettingsDialog;
