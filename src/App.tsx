import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Home from './pages/public/Home';
import About from './pages/public/About';
import Header from './components/public/Header';
import SecondaryNav from './components/public/SecondaryNav';
import Contact from './pages/public/Contact';
import Careers from './pages/public/Careers';
import News from './pages/public/News';
import Blog from './pages/public/Blog';
import Education from './pages/public/Education';
import Gallery from './pages/public/Gallery';
import AgroCategories from './pages/public/AgroCategories';
import AgroMainCategoryDetail from './pages/public/AgroMainCategoryDetail';
import AgroCategoryDetail from './pages/public/AgroCategoryDetail';
import AgroProductDetail from './pages/public/AgroProductDetail';
import Marketplace from './pages/public/Marketplace';
import PlantFinder from './pages/public/PlantFinder';
import AgroLands from './pages/public/AgroLands';

// Admin imports
import AdminLayout from './admin/layouts/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import CategoryManagement from './admin/pages/CategoryManagement';
import ItemManagement from './admin/pages/ItemManagement';
import NewsManagement from './admin/pages/NewsManagement';
import BlogManagement from './admin/pages/BlogManagement';
import CareerManagement from './admin/pages/CareerManagement';
import GalleryManagement from './admin/pages/GalleryManagement';
import Login from './admin/pages/Login';
import { ProtectedRoute } from './admin/components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

// Simple layouts for demonstration
function PublicLayout() {
  return (
    <>
      <Header />
      <SecondaryNav />
      <div className="min-h-screen flex flex-col">
        <Outlet />
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="pages/team" element={<div className="p-20 text-center font-roboto">Team Page Placeholder <br /><a href="/" className="text-blue-500 underline">Back</a></div>} />
            <Route path="pages/careers" element={<Careers />} />
            <Route path="pages/faq" element={<div className="p-20 text-center font-roboto">FAQ Page Placeholder <br /><a href="/" className="text-blue-500 underline">Back</a></div>} />
            <Route path="pages/contact" element={<Contact />} />
            <Route path="projects" element={<div className="p-20 text-center font-roboto">Projects Placeholder <br /><a href="/" className="text-blue-500 underline">Back</a></div>} />
            <Route path="news" element={<News />} />
            <Route path="blog" element={<Blog />} />
            <Route path="education" element={<Education />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="agro" element={<AgroCategories />} />
            <Route path="agro/:mainSlug" element={<AgroMainCategoryDetail />} />
            <Route path="agro/:mainSlug/:subSlug" element={<AgroCategoryDetail />} />
            <Route path="agro/:mainSlug/:subSlug/:productId" element={<AgroProductDetail />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="plant-finder" element={<PlantFinder />} />
            <Route path="agro-lands" element={<AgroLands />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="items" element={<ItemManagement />} />
            <Route path="news" element={<NewsManagement />} />
            <Route path="blogs" element={<BlogManagement />} />
            <Route path="careers" element={<CareerManagement />} />
            <Route path="gallery" element={<GalleryManagement />} />
            {/* Add more admin routes here */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
