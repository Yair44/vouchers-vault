
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
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
import { FamilyInvite } from "@/pages/FamilyInvite";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AccessibilityProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/family-invite/:token" element={<FamilyInvite />} />
              <Route path="/*" element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/vouchers" element={<ProtectedRoute><Vouchers /></ProtectedRoute>} />
                    <Route path="/voucher/:id" element={<ProtectedRoute><VoucherDetail /></ProtectedRoute>} />
                    <Route path="/add" element={<ProtectedRoute><AddVoucher /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><Admin /></ProtectedRoute>} />
                    <Route path="/shared" element={<ProtectedRoute><FamilyShare /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/site-terms" element={<SiteTerms />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/accessibility-statement" element={<AccessibilityStatement />} />
                    <Route path="/contact-us" element={<ContactUs />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              } />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AccessibilityProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
