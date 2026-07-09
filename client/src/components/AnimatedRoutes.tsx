import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Lazy loaded components
const Login = React.lazy(() => import('../pages/Login').then(module => ({ default: module.Login })));
const Dashboard = React.lazy(() => import('../pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Profile = React.lazy(() => import('../pages/Profile').then(module => ({ default: module.Profile })));
const Habits = React.lazy(() => import('../pages/Habits').then(module => ({ default: module.Habits })));
const Workouts = React.lazy(() => import('../pages/Workouts').then(module => ({ default: module.Workouts })));
const Nutrition = React.lazy(() => import('../pages/Nutrition').then(module => ({ default: module.Nutrition })));
const Skills = React.lazy(() => import('../pages/Skills').then(module => ({ default: module.Skills })));
const DSA = React.lazy(() => import('../pages/DSA').then(module => ({ default: module.DSA })));
const Achievements = React.lazy(() => import('../pages/Achievements').then(module => ({ default: module.Achievements })));
const AnalyticsDashboard = React.lazy(() => import('../pages/AnalyticsDashboard').then(module => ({ default: module.AnalyticsDashboard })));
const NotificationsSettings = React.lazy(() => import('../pages/NotificationsSettings').then(module => ({ default: module.NotificationsSettings })));
const MealPlanner = React.lazy(() => import('../pages/MealPlanner').then(module => ({ default: module.MealPlanner })));
const WeeklyReview = React.lazy(() => import('../pages/WeeklyReview').then(module => ({ default: module.WeeklyReview })));
const NotFound = React.lazy(() => import('../pages/NotFound').then(module => ({ default: module.NotFound })));
const AriaCommandCenter = React.lazy(() => import('../pages/AriaCommandCenter').then(module => ({ default: module.AriaCommandCenter })));
const Vitals = React.lazy(() => import('../pages/Vitals').then(module => ({ default: module.Vitals })));
const InnerMonarch = React.lazy(() => import('../pages/InnerMonarch').then(module => ({ default: module.InnerMonarch })));
const Economy = React.lazy(() => import('../pages/Economy').then(module => ({ default: module.Economy })));
const Shop = React.lazy(() => import('../pages/Shop').then(module => ({ default: module.Shop })));
const HunterMuseum = React.lazy(() => import('../pages/HunterMuseum').then(module => ({ default: module.HunterMuseum })));
const Inventory = React.lazy(() => import('../pages/Inventory').then(module => ({ default: module.Inventory })));
const Dungeons = React.lazy(() => import('../pages/Dungeons').then(module => ({ default: module.Dungeons })));
const Story = React.lazy(() => import('../pages/Story').then(module => ({ default: module.Story })));
const CareerDashboard = React.lazy(() => import('../pages/CareerDashboard'));
const AcademicDashboard = React.lazy(() => import('../pages/AcademicDashboard'));
const FinanceDashboard = React.lazy(() => import('../pages/FinanceDashboard'));
const AriaPlanner = React.lazy(() => import('../pages/AriaPlanner'));
import { ProtectedRoute } from './ProtectedRoute';

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 15, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -15, scale: 0.98 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className="h-full w-full"
  >
    {children}
  </motion.div>
);

export const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/" element={<ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><PageWrapper><Profile /></PageWrapper></ProtectedRoute>} />
        <Route path="/habits" element={<ProtectedRoute><PageWrapper><Habits /></PageWrapper></ProtectedRoute>} />
        <Route path="/workouts" element={<ProtectedRoute><PageWrapper><Workouts /></PageWrapper></ProtectedRoute>} />
        <Route path="/nutrition" element={<ProtectedRoute><PageWrapper><Nutrition /></PageWrapper></ProtectedRoute>} />
        <Route path="/skills" element={<ProtectedRoute><PageWrapper><Skills /></PageWrapper></ProtectedRoute>} />
        <Route path="/dsa" element={<ProtectedRoute><PageWrapper><DSA /></PageWrapper></ProtectedRoute>} />
        <Route path="/achievements" element={<ProtectedRoute><PageWrapper><Achievements /></PageWrapper></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><PageWrapper><AnalyticsDashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="/assistant" element={<ProtectedRoute><PageWrapper><AriaCommandCenter /></PageWrapper></ProtectedRoute>} />
        <Route path="/vitals" element={<ProtectedRoute><PageWrapper><Vitals /></PageWrapper></ProtectedRoute>} />
        <Route path="/monarch" element={<ProtectedRoute><PageWrapper><InnerMonarch /></PageWrapper></ProtectedRoute>} />
        <Route path="/economy" element={<ProtectedRoute><PageWrapper><Economy /></PageWrapper></ProtectedRoute>} />
        <Route path="/shop" element={<ProtectedRoute><PageWrapper><Shop /></PageWrapper></ProtectedRoute>} />
        <Route path="/museum" element={<ProtectedRoute><PageWrapper><HunterMuseum /></PageWrapper></ProtectedRoute>} />
        <Route path="/dungeons" element={<ProtectedRoute><PageWrapper><Dungeons /></PageWrapper></ProtectedRoute>} />
        <Route path="/story" element={<ProtectedRoute><PageWrapper><Story /></PageWrapper></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><PageWrapper><Inventory /></PageWrapper></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><PageWrapper><NotificationsSettings /></PageWrapper></ProtectedRoute>} />
        <Route path="/meal-planner" element={<ProtectedRoute><PageWrapper><MealPlanner /></PageWrapper></ProtectedRoute>} />
        <Route path="/weekly-review" element={<ProtectedRoute><PageWrapper><WeeklyReview /></PageWrapper></ProtectedRoute>} />
        <Route path="/career" element={<ProtectedRoute><PageWrapper><CareerDashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="/academics" element={<ProtectedRoute><PageWrapper><AcademicDashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="/finance" element={<ProtectedRoute><PageWrapper><FinanceDashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="/aria-planner" element={<ProtectedRoute><PageWrapper><AriaPlanner /></PageWrapper></ProtectedRoute>} />
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};
