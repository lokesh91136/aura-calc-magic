import { Calculator, TrendingUp, Home, Percent, List, Mic, Sun, Moon, History, Bot, Brain } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useVoice, languageConfig } from '@/contexts/VoiceContext';
import { useHistory } from '@/contexts/HistoryContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const calculators = [
  { title: 'Standard', url: '/', icon: Calculator },
  { title: 'SIP Calculator', url: '/sip', icon: TrendingUp },
  { title: 'EMI Calculator', url: '/emi', icon: Home },
  { title: 'Percentage', url: '/percentage', icon: Percent },
  { title: 'Tally', url: '/tally', icon: List },
  { title: 'Math Quiz', url: '/math-quiz', icon: Brain },
];

export function AppSidebar() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { language, setLanguage, isSupported: voiceSupported } = useVoice();
  const { setHistoryOpen, setAIHelperOpen } = useHistory();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-glow">
              AuraCalc
            </h1>
            <p className="text-xs text-muted-foreground">Beautiful calculations with style</p>
          </div>
          
          <div className="space-y-2">
            <Button
              variant="ghost" 
              size="sm"
              onClick={toggleTheme}
              className="w-full justify-start"
            >
              {resolvedTheme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
              {resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode
            </Button>
            
            {voiceSupported && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Voice Language</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(languageConfig).map(([code, config]) => (
                      <SelectItem key={code} value={code}>
                        {config.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Calculators</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {calculators.map((calc) => (
                <SidebarMenuItem key={calc.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={calc.url} 
                      end
                      className={({ isActive }) =>
                        cn(
                          'flex items-center space-x-2 p-2 rounded-lg transition-all',
                          isActive 
                            ? 'bg-gradient-primary text-foreground shadow-aura' 
                            : 'hover:bg-muted/50'
                        )
                      }
                    >
                      <calc.icon className="h-4 w-4" />
                      <span>{calc.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start p-2"
                    onClick={() => setHistoryOpen(true)}
                  >
                    <History className="h-4 w-4 mr-2" />
                    History
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start p-2"
                    onClick={() => setAIHelperOpen(true)}
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    AI Helper
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}