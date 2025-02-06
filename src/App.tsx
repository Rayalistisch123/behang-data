import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, NavLink } from "react-router-dom";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Menu, X } from "lucide-react";
import SalesDashboard from "./components/SalesDashboard";
import SamplesDashboard from "./components/SamplesDashboard";
import GeoDashboard from "./components/GeoDashboard";
import BestSellingDashboard from "./components/BestSellingDashboard";
import CustomerInsightsDashboard from "./components/CustomerInsightsDashboard";
import Login from "./components/Login";

const App: React.FC = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        if (!currentUser.emailVerified) {
          alert("⚠️ Je e-mail is nog niet geverifieerd. Controleer je inbox!");
          signOut(auth);
        }
      }
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      {user ? (
        <div className="flex h-screen">
          {/* Top Navbar voor mobiele apparaten */}
          <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 flex items-center justify-between p-4 md:hidden">
            <img
              src="/logo_poespas.webp"
              alt="Poespas Dashboard"
              className="w-24 h-auto"
            />
            <button onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
          </div>

          {/* Sidebar */}
          <div
            className={`fixed inset-y-0 left-0 bg-white shadow-lg w-64 p-6 transition-transform ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } md:translate-x-0 md:relative md:flex md:flex-col z-50`}
          >
            {/* Sluitknop */}
            <button
              className="absolute top-4 right-4 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={24} />
            </button>
            {/* Sidebar logo */}
            <img
              src="/logo_poespas.webp"
              alt="Poespas Dashboard"
              className="w-32 h-auto mt-4"
            />
            {/* Menu */}
            <ul className="flex flex-col space-y-2 mt-4">
              <li>
                <NavLink to="/" className="p-4 block hover:bg-pink-400 rounded">
                  📈 Verkoop & Omzet
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/samples"
                  className="p-4 block hover:bg-pink-400 rounded"
                >
                  📊 Staaltjes vs. Behangen
                </NavLink>
              </li>
              <li>
                <NavLink to="/geo" className="p-4 block hover:bg-pink-400 rounded">
                  🌍 Geografische Verkoop
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/best-selling"
                  className="p-4 block hover:bg-pink-400 rounded"
                >
                  🏆 Best Verkochte Behang
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/customers"
                  className="p-4 block hover:bg-pink-400 rounded"
                >
                  👥 Klantinzichten
                </NavLink>
              </li>
              <li>
                <button
                  onClick={() => signOut(auth)}
                  className="p-4 block text-red-500"
                >
                  🚪 Uitloggen
                </button>
              </li>
            </ul>
          </div>

          {/* hoofdrouter */}
          <main className="flex-1 bg-gray-100 p-6 pt-16 md:pt-6 overflow-auto">
            <Routes>
              <Route path="/" element={<SalesDashboard />} />
              <Route path="/samples" element={<SamplesDashboard />} />
              <Route path="/geo" element={<GeoDashboard />} />
              <Route path="/best-selling" element={<BestSellingDashboard />} />
              <Route path="/customers" element={<CustomerInsightsDashboard />} />
            </Routes>
          </main>
        </div>
      ) : (
        <div className="flex justify-center items-center h-screen bg-gray-200">
          <Login onLogin={(user) => setUser(user)} />
        </div>
      )}
    </Router>
  );
};

export default App;
