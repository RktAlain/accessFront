import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BudgetChart } from "@/components/charts/BudgetChart";
import { StockChart } from "@/components/charts/StockChart";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Plus,
  ShoppingCart,
  Box,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useLanguage } from "@/language-context";

interface Demande {
  _id: string;
  reference: string;
  dateDemande: string;
  demandeur_id: string;
  status: string;
  natureDemande: string;
  departement: string;
  description: string;
  demandeur?: {
    username: string;
  };
}

interface Budget {
  id: string;
  departement: string;
  budget_alloue: number;
  budget_consomme: number;
  budget_disponible: number;
}

interface BudgetParDepartement {
  departement: string;
  total_montant: number;
  nombre_devis: number;
}

interface Article {
  id: string;
  nom: string;
  reference: string;
  categorie: string;
  quantite: number;
  seuil_alerte: number;
  emplacement: string;
  date_creation?: string;
}

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: string;
  trendValue?: string;
  trendUp?: boolean;
}

const formatMGA = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MGA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const StatCard = ({ title, value, description, icon, trend, trendValue, trendUp }: StatCardProps) => {
  const { translate } = useLanguage();
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{translate(title)}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{translate(description)}</p>
        {trend && (
          <div className={`flex items-center mt-2 text-xs ${trendUp ? "text-green-600" : "text-red-600"}`}>
            <span>{trendValue}</span>
            <span className="ml-1">{translate(trend)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const [enAttenteCount, setEnAttenteCount] = useState<number>(0);
  const [enCoursCount, setEnCoursCount] = useState<number>(0);
  const [recentesDemandes, setRecentDemandes] = useState<Demande[]>([]);
  const [budgetTotal, setBudgetTotal] = useState<number>(0);
  const [budgetConsomme, setBudgetConsomme] = useState<number>(0);
  const [budgetParDepartement, setBudgetParDepartement] = useState<BudgetParDepartement[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [alertesStockCount, setAlertesStockCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { translate } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const articlesResponse = await axios.get("http://localhost:8000/articleStock/article/");
        const articlesData: Article[] = articlesResponse.data.data;
        setArticles(articlesData);

        const alertes = articlesData.filter(a => a.quantite < a.seuil_alerte);
        setAlertesStockCount(alertes.length);

        const demandesResponse = await axios.get("http://localhost:8000/demandeAchat/demandes/");
        const demandes: Demande[] = demandesResponse.data.data;

        setEnAttenteCount(demandes.filter(d => d.status === "en_attente").length);
        setEnCoursCount(demandes.filter(d => d.status === "en_cours").length);
        setRecentDemandes([...demandes]
          .sort((a, b) => new Date(b.dateDemande).getTime() - new Date(a.dateDemande).getTime())
          .slice(0, 4));

        const budgetsResponse = await axios.get("http://localhost:8000/budget/listeBudgets/");
        const budgets: Budget[] = budgetsResponse.data.data;
        
        const totalAlloue = budgets.reduce((sum, b) => sum + b.budget_alloue, 0);
        const totalConsomme = budgets.reduce((sum, b) => sum + b.budget_consomme, 0);
        
        setBudgetTotal(totalAlloue);
        setBudgetConsomme(totalConsomme);

        const parDepartementResponse = await axios.get(
          "http://localhost:8000/budget/montantsApprouvesParDepartement/"
        );
        setBudgetParDepartement(parDepartementResponse.data.data);

      } catch (err) {
        setError(translate("Erreur lors du chargement des données"));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [translate]);

  const getDepartmentColor = (department: string) => {
    const colors = [
      "#4338ca", "#0ea5e9", "#10b981", "#f59e0b", 
      "#6b7280", "#ef4444", "#8b5cf6", "#ec4899"
    ];
    const index = department.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const normalizedStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "approuvé":
      case "approved":
        return "approved";
      case "en_attente":
        return "pending";
      case "rejeté":
      case "rejected":
        return "rejected";
      case "en_cours":
        return "processing";
      default:
        return "pending";
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      {translate("Chargement en cours...")}
    </div>
  );

  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{translate("Tableau de bord")}</h1>
        <Button asChild>
          <Link to="/demande-achat">
            <Plus className="mr-2 h-4 w-4" /> {translate("Nouvelle demande")}
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={translate("Demandes en attente de traitement")}
          value={enAttenteCount.toString()}
          description={translate("Demandes en attente de traitement")}
          icon={<ShoppingCart className="h-4 w-4" />}
          trend={translate("ce mois")}
          trendValue="+4"
          trendUp={true}
        />
        <StatCard
          title={translate("En attente de validation")}
          value={enCoursCount.toString()}
          description={translate("Demandes nécessitant votre approbation")}
          icon={<FileText className="h-4 w-4" />}
        />
        <StatCard
          title={translate("Budget consommé")}
          value={budgetTotal > 0 
            ? `${Math.round((budgetConsomme / budgetTotal) * 100)}%` 
            : "0%"}
          description={`${formatMGA(budgetConsomme)} / ${formatMGA(budgetTotal)}`}
          icon={<Box className="h-4 w-4" />}
          trend={translate("vs. prévision")}
          trendValue="-5%"
          trendUp={true}
        />
        <StatCard
          title={translate("Alertes stock")}
          value={alertesStockCount.toString()}
          description={translate("Produits sous le seuil minimal")}
          icon={<AlertCircle className="h-4 w-4" />}
          trend={translate("nouveau")}
          trendValue="+1"
          trendUp={false}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <BudgetChart
          key="budget-chart"
          data={budgetParDepartement.map((item) => ({
            id: item.departement,
            name: item.departement,
            value: item.total_montant,
            color: getDepartmentColor(item.departement),
          }))}
          title={translate("Répartition budgétaire (MGA)")}
          description={translate("Dépenses par département")}
        />
        <StockChart
          key="stock-chart"
          data={articles
            .filter(a => a.quantite < a.seuil_alerte)
            .map(a => ({
              id: a.id,
              nom: a.nom,
              quantite: a.quantite,
              seuil: a.seuil_alerte
            }))}
          title={translate("État des stocks")}
          description={translate("Quantités disponibles et seuils minimaux")}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card key="recent-requests-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{translate("Demandes récentes")}</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/demande-achat">
                  {translate("Voir tout")} <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <CardDescription>
              {translate("Les dernières demandes d'achat soumises")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentesDemandes.map((demande) => {
                if (!demande.reference) {
                  console.error("Demande sans référence:", demande);
                  return null;
                }

                return (
                  <div
                    key={`demande-${demande.reference}`}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <div className="font-medium">{demande.natureDemande}</div>
                      <div className="text-sm text-muted-foreground">
                        {demande.departement} •{" "}
                        {new Date(demande.dateDemande).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={normalizedStatus(demande.status)} />
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/demande-achat/${demande.reference}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card key="stock-alerts-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{translate("Alertes de stock")}</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/stocks">
                  {translate("Voir tout")} <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <CardDescription>
              {translate("Produits en dessous du seuil minimal")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {articles
                .filter(a => a.quantite < a.seuil_alerte)
                .slice(0, 5)
                .map((article) => (
                  <div
                    key={`alerte-${article.id}`}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <div className="font-medium">{article.nom}</div>
                      <div className="text-sm text-muted-foreground">
                        {translate("Quantité")}: {article.quantite} ({translate("seuil")}: {article.seuil_alerte})
                      </div>
                    </div>
                    <div>
                      <StatusBadge status={
                        article.quantite <= article.seuil_alerte * 0.5 
                          ? "critical" 
                          : "warning"
                      } />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;