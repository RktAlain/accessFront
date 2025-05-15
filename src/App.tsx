import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./theme-context";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import GestionAchats from "./pages/GestionAchats";
import Documentation from "./pages/Documentation";
import Dashboard from "./pages/Dashboard";
import DemandeAchat from "./pages/DemandeAchat";
import GestionStocks from "./pages/GestionStocks";
import NouvelleArticle from "./pages/NouvelleArticle";
import ListeDemandesAchats from "./pages/ListeDemandesAchats";
import ValidationDemandes from "./pages/ValidationDemandes";
import Budgets from "./pages/Budgets";
import Factures from "./pages/Factures";
import Reporting from "./pages/Reporting";
import Utilisateurs from "./pages/Utilisateurs";
import Parametres from "./pages/Parametres";
import { useEffect, useState } from "react";
import { setupAutoTranslate } from "./auto-translate";
import { LanguageProvider, useLanguage } from "./language-context";

const queryClient = new QueryClient();

const AppContent = () => {
  const { language } = useLanguage();
  const location = useLocation(); // Ajoutez ce hook de react-router-dom

  useEffect(() => {
    // Retraduire à chaque changement de langue OU de route
    setupAutoTranslate(language);
  }, [language, location.pathname]);

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/demande-achat"
          element={
            <Layout>
              <DemandeAchat />
            </Layout>
          }
        />
        <Route
          path="/demande-achat/:id"
          element={
            <Layout>
              <DemandeAchat />
            </Layout>
          }
        />
        <Route
          path="/achats"
          element={
            <Layout>
              <GestionAchats />
            </Layout>
          }
        />
        <Route
          path="/stocks"
          element={
            <Layout>
              <GestionStocks />
            </Layout>
          }
        />
        <Route
          path="/articles"
          element={
            <Layout>
              <NouvelleArticle />
            </Layout>
          }
        />
        <Route
          path="/demandes"
          element={
            <Layout>
              <ListeDemandesAchats />
            </Layout>
          }
        />
        <Route
          path="/validation"
          element={
            <Layout>
              <ValidationDemandes />
            </Layout>
          }
        />
        <Route
          path="/budgets"
          element={
            <Layout>
              <Budgets />
            </Layout>
          }
        />
        <Route
          path="/documentation"
          element={
            <Layout>
              <Documentation />
            </Layout>
          }
        />
        <Route
          path="/factures"
          element={
            <Layout>
              <Factures />
            </Layout>
          }
        />
        <Route
          path="/reporting"
          element={
            <Layout>
              <Reporting />
            </Layout>
          }
        />
        <Route
          path="/utilisateurs"
          element={
            <Layout>
              <Utilisateurs />
            </Layout>
          }
        />
        <Route
          path="/parametres"
          element={
            <Layout>
              <Parametres />
            </Layout>
          }
        />
      </Routes>
    </TooltipProvider>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
