import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { VoiceProvider } from "@/contexts/VoiceContext";
import { HistoryProvider } from "@/contexts/HistoryContext";
import { StudyProvider } from "@/contexts/StudyContext";
import { HistoryPanel } from "@/components/HistoryPanel";
import Index from "./pages/Index";
import { ScientificCalculatorPage } from "./pages/ScientificCalculatorPage";
import StudyModePage from "./pages/StudyModePage";
import SIPPage from "./pages/SIPPage";
import EMIPage from "./pages/EMIPage";
import PercentagePage from "./pages/PercentagePage";
import TallyPage from "./pages/TallyPage";
import MathQuizPage from "./pages/MathQuizPage";
import CalculatorRacingPage from "./pages/CalculatorRacingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <VoiceProvider>
          <HistoryProvider>
            <StudyProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SidebarProvider>
              <div className="flex min-h-screen w-full">
                <AppSidebar />
                <div className="flex-1">
                  <header className="h-16 flex items-center border-b border-border/20 bg-gradient-background/95 backdrop-blur-sm sticky top-0 z-10">
                    <SidebarTrigger className="ml-4" />
                    <div className="flex-1 text-center">
                      <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                        AuraCalc
                      </h1>
                    </div>
                  </header>
                  <main className="flex-1 overflow-auto">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/scientific" element={<ScientificCalculatorPage />} />
                      <Route path="/sip" element={<SIPPage />} />
                      <Route path="/emi" element={<EMIPage />} />
                      <Route path="/percentage" element={<PercentagePage />} />
                      <Route path="/tally" element={<TallyPage />} />
                      <Route path="/math-quiz" element={<MathQuizPage />} />
                      <Route path="/calculator-racing" element={<CalculatorRacingPage />} />
                      <Route path="/study" element={<StudyModePage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </SidebarProvider>
            <HistoryPanel />
          </BrowserRouter>
          </TooltipProvider>
            </StudyProvider>
          </HistoryProvider>
        </VoiceProvider>
      </ThemeProvider>
  </QueryClientProvider>
);

export default App;
