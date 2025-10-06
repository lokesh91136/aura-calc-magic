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
import AgeCalculatorPage from "./pages/AgeCalculatorPage";
import LoanCalculatorPage from "./pages/LoanCalculatorPage";
import TaxCalculatorPage from "./pages/TaxCalculatorPage";
import CurrencyConverterPage from "./pages/CurrencyConverterPage";
import SavingsGoalPage from "./pages/SavingsGoalPage";
import PercentagePage from "./pages/PercentagePage";
import TallyPage from "./pages/TallyPage";
import MathQuizPage from "./pages/MathQuizPage";
import CalculatorRacingPage from "./pages/CalculatorRacingPage";
import MarksPercentagePage from "./pages/MarksPercentagePage";
import AttendancePage from "./pages/AttendancePage";
import GPAPage from "./pages/GPAPage";
import CGPAPage from "./pages/CGPAPage";
import GradePage from "./pages/GradePage";
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
                      <header className="h-16 flex items-center justify-center sticky top-0 z-10 backdrop-blur-sm">
                        <SidebarTrigger className="absolute left-4" />
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                          AURACALC
                        </h1>
                      </header>
                      <main className="flex-1 overflow-auto">
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/scientific" element={<ScientificCalculatorPage />} />
                          <Route path="/sip" element={<SIPPage />} />
                          <Route path="/emi" element={<EMIPage />} />
                          <Route path="/age-calculator" element={<AgeCalculatorPage />} />
                          <Route path="/loan-calculator" element={<LoanCalculatorPage />} />
                          <Route path="/tax-calculator" element={<TaxCalculatorPage />} />
                          <Route path="/currency-converter" element={<CurrencyConverterPage />} />
                          <Route path="/savings-goal" element={<SavingsGoalPage />} />
                          <Route path="/percentage" element={<PercentagePage />} />
                          <Route path="/tally" element={<TallyPage />} />
                          <Route path="/math-quiz" element={<MathQuizPage />} />
                          <Route path="/calculator-racing" element={<CalculatorRacingPage />} />
                          <Route path="/study" element={<StudyModePage />} />
                          <Route path="/marks-percentage" element={<MarksPercentagePage />} />
                          <Route path="/attendance" element={<AttendancePage />} />
                          <Route path="/gpa" element={<GPAPage />} />
                          <Route path="/cgpa" element={<CGPAPage />} />
                          <Route path="/grade" element={<GradePage />} />
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
