import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "@contexts/AuthContext";
import { ChatProvider } from "@contexts/ChatContext";
import Header from "@components/layout/Header";
import Footer from "@components/layout/Footer";
import AnimatedRoutes from "@components/layout/AnimatedRoutes";
import ChatWidget from "@components/chat/ChatWidget";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <div className="relative flex min-h-screen flex-col overflow-x-clip">
            {/* Halo de couleur de la charte en arrière-plan */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[680px] bg-gradient-to-b from-secondary/45 via-light/50 to-transparent"
            />
            <Header />
            <main className="flex-1">
              <AnimatedRoutes />
            </main>
            <Footer />
            <ChatWidget />
          </div>
          <ToastContainer position="bottom-left" autoClose={3000} newestOnTop />
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
