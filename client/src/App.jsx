// client/src/App.jsx 

import { Routes, Route } from 'react-router-dom'; // <-- Only imports Routes & Route
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { PeriodTrackerPage } from './pages/PeriodTrackerPage';
import { ForumPage } from './pages/ForumPage';
import { BlogPage } from './pages/BlogPage';
import { ArticlePage } from './pages/ArticlePage';
import { CreateArticlePage } from './pages/CreateArticlePage';
import { EditArticlePage } from './pages/EditArticlePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CreateProductPage } from './pages/CreateProductPage';
import { EditProductPage } from './pages/EditProductPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { ManageUsersPage } from './pages/ManageUsersPage';
import { ManageArticlesPage } from './pages/ManageArticlesPage';
import { ManageProductsPage } from './pages/ManageProductsPage';
import { ManagePeriodLogsPage } from './pages/ManagePeriodLogsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ProfilePage } from './pages/ProfilePage';
import { ContactPage } from './pages/ContactPage';

function App() {
  return (
    // The <Router> is GONE from this file. This is correct.
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tracker"
          element={
            <ProtectedRoute>
              <PeriodTrackerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forum"
          element={
            <ProtectedRoute>
              <ForumPage />
            </ProtectedRoute>
          }
        />

        {/* --- 2. FIX: Changed /:Id to /:id --- */}
        <Route
          path="/forum/:id"
          element={
            <ProtectedRoute>
              <PostDetailPage />
            </ProtectedRoute>
          }
        />

        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<ArticlePage />} />
        <Route
          path="/blog/create"
          element={
            <ProtectedRoute>
              <CreateArticlePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blog/edit/:id"
          element={
            <ProtectedRoute>
              <EditArticlePage />
            </ProtectedRoute>
          }
        />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route
          path="/products/create"
          element={
            <ProtectedRoute>
              <CreateProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/edit/:id"
          element={
            <ProtectedRoute>
              <EditProductPage />
            </ProtectedRoute>
          }
        />

        {/* Contact page */}
        <Route path="/contact" element={<ContactPage />} />

        {/* Admin routes */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <ManageUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/articles"
          element={
            <ProtectedRoute>
              <ManageArticlesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute>
              <ManageProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/period-logs"
          element={
            <ProtectedRoute>
              <ManagePeriodLogsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;