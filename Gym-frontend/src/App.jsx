import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Components
import ProtectedRoute from "./components/common/ProtectedRoute";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Auth Pages
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import VerifyOTP from "./components/auth/VerifyOTP";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";  // ← IMPORT THIS

// Landing Page
import LandingPage from "./pages/LandingPage";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import ManageTrainers from "./pages/admin/ManageTrainers";
import ManageSchedules from "./pages/admin/ManageSchedules";
import ManageMembers from "./pages/admin/ManageMembers";
import AssignTrainer from "./pages/admin/AssignTrainer";
import Payments from "./pages/admin/Payments";
import Inquiries from "./pages/admin/Inquiries";


// Trainer Pages
import TrainerDashboard from "./pages/trainer/Dashboard";
import TrainerSchedule from "./pages/trainer/MySchedule";
import TrainerMembers from "./pages/trainer/MyMembers";
import DietPlans from "./pages/trainer/DietPlans";
import CreateDietPlan from "./pages/trainer/CreateDietPlan";
// Member Pages
import MemberDashboard from "./pages/member/Dashboard";
import MemberProfile from "./pages/member/MyProfile";
import MemberTrainer from "./pages/member/MyTrainer";
import MemberSchedule from "./pages/member/MySchedule";
import MemberDietPlan from "./pages/member/MyDietPlan";
import MembershipPlans from "./pages/member/MembershipPlans";
import BillingHistory from "./pages/member/BillingHistory";
import MyProfile from "./pages/member/MyProfile";
import MyDietPlan from "./pages/member/MyDietPlan";



function AppContent() {
  const { loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />  {/* ← THIS IS CRITICAL */}

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
            <Route path="/admin/inquiries" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <Inquiries />
        </ProtectedRoute>
      } />
      <Route path="/admin/trainers" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <ManageTrainers />
        </ProtectedRoute>
      } />
      <Route path="/admin/schedules" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <ManageSchedules />
        </ProtectedRoute>
      } />
      <Route path="/admin/members" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <ManageMembers />
        </ProtectedRoute>
      } />
      <Route path="/admin/assign-trainer" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AssignTrainer />
        </ProtectedRoute>
      } />
      <Route path="/admin/payments" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <Payments />
        </ProtectedRoute>
      } />

      {/* Trainer Routes */}
      <Route path="/trainer" element={
        <ProtectedRoute allowedRoles={['TRAINER']}>
          <TrainerDashboard />
        </ProtectedRoute>
      } />
          <Route path="/trainer/dashboard" element={
      <ProtectedRoute allowedRoles={['TRAINER']}>
        <TrainerDashboard />
      </ProtectedRoute>
    } />

    <Route path="/trainer/schedule" element={
      <ProtectedRoute allowedRoles={['TRAINER']}>
        <TrainerSchedule />
      </ProtectedRoute>
    } />

    <Route path="/trainer/members" element={
      <ProtectedRoute allowedRoles={['TRAINER']}>
        <TrainerMembers />
      </ProtectedRoute>
    } />

    <Route path="/trainer/diet-plans" element={
      <ProtectedRoute allowedRoles={['TRAINER']}>
        <DietPlans />
      </ProtectedRoute>
    } />

    <Route path="/trainer/create-diet-plan" element={
      <ProtectedRoute allowedRoles={['TRAINER']}>
        <CreateDietPlan />
      </ProtectedRoute>
    } />


      <Route path="/trainer/dashboard" element={
        <ProtectedRoute allowedRoles={['TRAINER']}>
          <TrainerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/trainer/schedule" element={
        <ProtectedRoute allowedRoles={['TRAINER']}>
          <TrainerSchedule />
        </ProtectedRoute>
      } />
      <Route path="/trainer/members" element={
        <ProtectedRoute allowedRoles={['TRAINER']}>
          <TrainerMembers />
        </ProtectedRoute>
      } />
      <Route path="/trainer/diet-plans" element={
        <ProtectedRoute allowedRoles={['TRAINER']}>
          <DietPlans />
        </ProtectedRoute>
      } />
      <Route path="/trainer/create-diet-plan" element={
        <ProtectedRoute allowedRoles={['TRAINER']}>
          <CreateDietPlan />
        </ProtectedRoute>
      } />

      {/* Member Routes */}

            <Route path="/member/billing-history" element={
        <ProtectedRoute allowedRoles={['MEMBER']}>
          <BillingHistory />
        </ProtectedRoute>
      } />

            <Route path="/member/profile" element={
        <ProtectedRoute allowedRoles={['MEMBER']}>
          <MyProfile />
        </ProtectedRoute>
      } />

      <Route path="/member/diet-plan" element={
        <ProtectedRoute allowedRoles={['MEMBER']}>
          <MyDietPlan />
        </ProtectedRoute>
      } />

      <Route path="/member" element={
        <ProtectedRoute allowedRoles={['MEMBER']}>
          <MemberDashboard />
        </ProtectedRoute>
      } />
      <Route path="/member/dashboard" element={
        <ProtectedRoute allowedRoles={['MEMBER']}>
          <MemberDashboard />
        </ProtectedRoute>
      } />
      <Route path="/member/profile" element={
        <ProtectedRoute allowedRoles={['MEMBER']}>
          <MemberProfile />
        </ProtectedRoute>
      } />
      <Route path="/member/my-trainer" element={
        <ProtectedRoute allowedRoles={['MEMBER']}>
          <MemberTrainer />
        </ProtectedRoute>
      } />
      <Route path="/member/schedule" element={
        <ProtectedRoute allowedRoles={['MEMBER']}>
          <MemberSchedule />
        </ProtectedRoute>
      } />
      <Route path="/member/diet-plan" element={
        <ProtectedRoute allowedRoles={['MEMBER']}>
          <MemberDietPlan />
        </ProtectedRoute>
      } />
      <Route path="/plans" element={
        <ProtectedRoute allowedRoles={['MEMBER']}>
          <MembershipPlans />
        </ProtectedRoute>
      } />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;