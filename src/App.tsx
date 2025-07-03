
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import { Dashboard } from "@/pages/Dashboard";
import { Vouchers } from "@/pages/Vouchers";
import { AddVoucher } from "@/pages/AddVoucher";
import { VoucherDetail } from "@/pages/VoucherDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AccessibilityProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/vouchers" element={<Vouchers />} />
              <Route path="/voucher/:id" element={<VoucherDetail />} />
              <Route path="/add" element={<AddVoucher />} />
              <Route path="/shared" element={<div className="text-center py-12"><h2 className="text-xl font-semibold">Shared Vouchers - Coming Soon!</h2><p className="text-gray-600 dark:text-gray-400 mt-2">View vouchers shared with you by other users.</p></div>} />
              <Route path="/profile" element={<div className="text-center py-12"><h2 className="text-xl font-semibold">Profile Settings - Coming Soon!</h2><p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account settings and webhook notifications.</p></div>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </AccessibilityProvider>
  </QueryClientProvider>
);

export default App;
