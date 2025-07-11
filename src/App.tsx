
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";

import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Dashboard } from "@/pages/Dashboard";
import { Vouchers } from "@/pages/Vouchers";
import { AddVoucher } from "@/pages/AddVoucher";
import { VoucherDetail } from "@/pages/VoucherDetail";
import { Admin } from "@/pages/Admin";
import { Auth } from "@/pages/Auth";
import { Profile } from "@/pages/Profile";
import { SiteTerms } from "@/pages/SiteTerms";
import { PrivacyPolicy } from "@/pages/PrivacyPolicy";
import { AccessibilityStatement } from "@/pages/AccessibilityStatement";
import { ContactUs } from "@/pages/ContactUs";
import NotFound from "./pages/NotFound";
import { FamilyShare } from "@/pages/FamilyShare";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Layout><Auth /></Layout>} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/vouchers" element={<ProtectedRoute><Vouchers /></ProtectedRoute>} />
            <Route path="/voucher/:id" element={<ProtectedRoute><VoucherDetail /></ProtectedRoute>} />
            <Route path="/add" element={<ProtectedRoute><AddVoucher /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><Admin /></ProtectedRoute>} />
            <Route path="/shared" element={<ProtectedRoute><FamilyShare /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/site-terms" element={<Layout><SiteTerms /></Layout>} />
            <Route path="/privacy-policy" element={<Layout><PrivacyPolicy /></Layout>} />
            <Route path="/accessibility-statement" element={<Layout><AccessibilityStatement /></Layout>} />
            <Route path="/contact-us" element={<Layout><ContactUs /></Layout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
