import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Home from './pages/public/Home';
import About from './pages/public/About';
import Header from './components/public/Header';
import Contact from './pages/public/Contact';
import Careers from './pages/public/Careers';
import News from './pages/public/News';
import Education from './pages/public/Education';
import Gallery from './pages/public/Gallery';
import AgroCategories from './pages/public/AgroCategories';
import AgroMainCategoryDetail from './pages/public/AgroMainCategoryDetail';
import AgroCategoryDetail from './pages/public/AgroCategoryDetail';
import AgroProductDetail from './pages/public/AgroProductDetail';

// Simple layouts for demonstration
function PublicLayout() {
  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col">
        <Outlet />
      </div>
    </>
  );
}

function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-roboto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p>This is the admin side.</p>
        <a href="/" className="text-blue-500 hover:underline mt-4 inline-block">Go to Public Site</a>
      </div>
    </div>
  );
}

function App() {
  return (
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
          <Route path="education" element={<Education />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="agro" element={<AgroCategories />} />
          <Route path="agro/:mainSlug" element={<AgroMainCategoryDetail />} />
          <Route path="agro/:mainSlug/:subSlug" element={<AgroCategoryDetail />} />
          <Route path="agro/:mainSlug/:subSlug/:productId" element={<AgroProductDetail />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Admin nested routes would go here */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
