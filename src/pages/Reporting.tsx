import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BudgetChart } from '@/components/charts/BudgetChart';
import { StockChart } from '@/components/charts/StockChart';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { 
  BarChart3, 
  Download, 
  FileText, 
  LineChart, 
  PieChart, 
  Share2 
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

interface StatDemande {
  mois: string;
  nbDemandes: number;
  nbApprouvees: number;
  nbRejetees: number;
  nbEnCours: number;
  departement: string;
  tempsTraitementMoyen: number;
}

interface TopDepartement {
  departement: string;
  nbDemandes: number;
  montantTotal: number;
  color?: string;
}

interface Demande {
  _id: string;
  reference: string;
  dateDemande: string;
  status: string;
  natureDemande: string;
  departement: string;
  description: string;
  quantite: number;
  montant?: number;
}

interface Budget {
  id: string;
  departement: string;
  budget_alloue: number;
  budget_consomme: number;
  budget_disponible: number;
}

interface DepenseParDepartement {
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

interface PerformanceMetric {
  name: string;
  value: number;
  target: number;
}

const colors = ["#4338ca", "#0ea5e9", "#10b981", "#f59e0b", "#6b7280", "#ef4444", "#8b5cf6", "#ec4899"];

const Reporting = () => {
  const [periode, setPeriode] = useState('6mois');
  const [statsDemandes, setStatsDemandes] = useState<StatDemande[]>([]);
  const [topDepartements, setTopDepartements] = useState<TopDepartement[]>([]);
  const [totalDemandes, setTotalDemandes] = useState<number>(0);
  const [tauxApprovation, setTauxApprovation] = useState<number>(0);
  const [tauxRejet, setTauxRejet] = useState<number>(0);
  const [tempsMoyenTraitement, setTempsMoyenTraitement] = useState<number>(0);
  const [montantTotal, setMontantTotal] = useState<number>(0);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [depensesParDepartement, setDepensesParDepartement] = useState<DepenseParDepartement[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');

  const filterDemandesByPeriod = (demandes: Demande[], period: string): Demande[] => {
    const now = new Date();
    let cutoffDate = new Date();

    switch (period) {
      case '1mois':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3mois':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6mois':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '12mois':
        cutoffDate.setMonth(now.getMonth() - 12);
        break;
      default:
        cutoffDate.setMonth(now.getMonth() - 6);
    }

    return demandes.filter(demande => {
      const demandeDate = new Date(demande.dateDemande);
      return demandeDate >= cutoffDate;
    });
  };

  const groupByMonth = (demandes: Demande[]): StatDemande[] => {
    const demandesParMois: Record<string, {
      nbDemandes: number;
      nbApprouvees: number;
      nbRejetees: number;
      nbEnCours: number;
      departement: string;
      tempsTraitement: number[];
    }> = {};

    const moisNoms = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    demandes.forEach(demande => {
      const date = new Date(demande.dateDemande);
      const mois = date.getMonth();
      const annee = date.getFullYear();
      const cle = `${moisNoms[mois]} ${annee}`;

      if (!demandesParMois[cle]) {
        demandesParMois[cle] = {
          nbDemandes: 0,
          nbApprouvees: 0,
          nbRejetees: 0,
          nbEnCours: 0,
          departement: demande.departement,
          tempsTraitement: []
        };
      }

      demandesParMois[cle].nbDemandes++;

      if (demande.status === 'Approuvé' || demande.status === 'approuvee' || demande.status === 'approuve' || demande.status.toLowerCase().includes('approuv')) {
        demandesParMois[cle].nbApprouvees++;
      } else if (demande.status === 'Rejeté' || demande.status === 'rejetee' || demande.status === 'rejete' || demande.status.toLowerCase().includes('rejet')) {
        demandesParMois[cle].nbRejetees++;
      } else {
        demandesParMois[cle].nbEnCours++;
      }

      const dateTraitement = new Date();
      const tempsTraitement = (dateTraitement.getTime() - new Date(demande.dateDemande).getTime()) / (1000 * 60 * 60 * 24);
      demandesParMois[cle].tempsTraitement.push(tempsTraitement);
    });

    return Object.entries(demandesParMois).map(([mois, data]) => ({
      mois,
      nbDemandes: data.nbDemandes,
      nbApprouvees: data.nbApprouvees,
      nbRejetees: data.nbRejetees,
      nbEnCours: data.nbEnCours,
      departement: data.departement,
      tempsTraitementMoyen: data.tempsTraitement.length > 0 
        ? data.tempsTraitement.reduce((a, b) => a + b, 0) / data.tempsTraitement.length
        : 0
    })).sort((a, b) => {
      const moisIndexA = moisNoms.indexOf(a.mois.split(' ')[0]);
      const moisIndexB = moisNoms.indexOf(b.mois.split(' ')[0]);
      return moisIndexA - moisIndexB;
    });
  };

  const calculatePerformanceMetrics = (demandes: Demande[], budgets: Budget[]) => {
    const totalDemandes = demandes.length;
    const approuvees = demandes.filter(d => 
      d.status === 'Approuvé' || d.status === 'approuvee' || d.status.toLowerCase().includes('approuv')
    ).length;
    const rejetees = demandes.filter(d => 
      d.status === 'Rejeté' || d.status === 'rejetee' || d.status.toLowerCase().includes('rejet')
    ).length;
    
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.budget_alloue, 0);
    const budgetConsomme = budgets.reduce((sum, budget) => sum + budget.budget_consomme, 0);
    const tauxConsommation = totalBudget > 0 ? (budgetConsomme / totalBudget) * 100 : 0;

    return [
      {
        name: "Taux d'approbation",
        value: totalDemandes > 0 ? Math.round((approuvees / totalDemandes) * 100) : 0,
        target: 85
      },
      {
        name: "Taux de rejet",
        value: totalDemandes > 0 ? Math.round((rejetees / totalDemandes) * 100) : 0,
        target: 10
      },
      {
        name: "Taux de consommation budget",
        value: Math.round(tauxConsommation),
        target: 70
      },
      {
        name: "Temps moyen traitement",
        value: statsDemandes.reduce((sum, stat) => sum + stat.tempsTraitementMoyen, 0) / statsDemandes.length || 0,
        target: 3
      }
    ];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les budgets
        const budgetsResponse = await axios.get("http://localhost:8000/budget/listeBudgets/");
        setBudgets(budgetsResponse.data.data);
        
        // Calculer le montant total consommé
        const totalConsomme = budgetsResponse.data.data.reduce(
          (sum: number, budget: Budget) => sum + budget.budget_consomme, 0
        );
        setMontantTotal(totalConsomme);

        // Récupérer les dépenses par département
        const depensesResponse = await axios.get(
          "http://localhost:8000/budget/montantsApprouvesParDepartement/"
        );
        setDepensesParDepartement(depensesResponse.data.data);

        // Transformer les données pour le top départements
        const topDepts = budgetsResponse.data.data.map((budget: Budget, index: number) => ({
          departement: budget.departement,
          nbDemandes: 0, // Nous n'avons pas cette info directement depuis les budgets
          montantTotal: budget.budget_consomme,
          color: colors[index % colors.length]
        })).sort((a: TopDepartement, b: TopDepartement) => b.montantTotal - a.montantTotal);
        
        setTopDepartements(topDepts);

        // Récupérer les articles
        const articlesResponse = await axios.get("http://localhost:8000/articleStock/article/");
        setArticles(articlesResponse.data.data);

        // Récupérer les demandes pour les autres statistiques
        const demandesResponse = await axios.get("http://localhost:8000/demandeAchat/demandes/");
        const demandes: Demande[] = demandesResponse.data.data;

        // Filtrer selon la période sélectionnée
        const demandesFiltrees = filterDemandesByPeriod(demandes, periode);

        // Calculer les statistiques de base
        const total = demandesFiltrees.length;
        const approuvees = demandesFiltrees.filter(d => 
          d.status === 'Approuvé' || d.status === 'approuvee' || d.status.toLowerCase().includes('approuv')
        ).length;
        const rejetees = demandesFiltrees.filter(d => 
          d.status === 'rejetee' || d.status === 'Rejeté'|| d.status.toLowerCase().includes('rejet')
        ).length;

        setTotalDemandes(total);
        setTauxApprovation(total > 0 ? Math.round((approuvees / total) * 100) : 0);
        setTauxRejet(total > 0 ? Math.round((rejetees / total) * 100) : 0);

        // Calculer les statistiques par mois
        const statsParMois = groupByMonth(demandesFiltrees);
        setStatsDemandes(statsParMois);

        // Calculer le temps moyen de traitement
        const tempsMoyen = statsParMois.reduce((sum, stat) => sum + stat.tempsTraitementMoyen, 0) / statsParMois.length;
        setTempsMoyenTraitement(tempsMoyen || 0);

        // Calculer les métriques de performance
        setPerformanceMetrics(calculatePerformanceMetrics(demandesFiltrees, budgetsResponse.data.data));

      } catch (err) {
        setError("Erreur lors du chargement des données");
        console.error("Erreur lors du chargement des données:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [periode]);

  const articlesColumns: ColumnDef<Article>[] = [
    {
      accessorKey: 'nom',
      header: 'Article',
    },
    {
      accessorKey: 'reference',
      header: 'Référence',
    },
    {
      accessorKey: 'categorie',
      header: 'Catégorie',
    },
    {
      accessorKey: 'quantite',
      header: 'Quantité',
    },
    {
      accessorKey: 'seuil_alerte',
      header: 'Seuil alerte',
    },
    {
      accessorKey: 'emplacement',
      header: 'Emplacement',
    },
    {
      id: 'status',
      header: 'Statut',
      cell: ({ row }) => {
        const quantite = row.original.quantite;
        const seuil = row.original.seuil_alerte;
        
        return (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            quantite <= seuil 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {quantite <= seuil ? 'Alerte stock bas' : 'Stock OK'}
          </span>
        );
      },
    },
  ];

  const budgetColumns: ColumnDef<Budget>[] = [
    {
      accessorKey: 'departement',
      header: 'Département',
    },
    {
      accessorKey: 'budget_alloue',
      header: 'Budget alloué',
      cell: ({ row }) => (
        new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'MGA',
          maximumFractionDigits: 0
        }).format(row.original.budget_alloue)
      ),
    },
    {
      accessorKey: 'budget_consomme',
      header: 'Budget consommé',
      cell: ({ row }) => (
        new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'MGA',
          maximumFractionDigits: 0
        }).format(row.original.budget_consomme)
      ),
    },
    {
      accessorKey: 'budget_disponible',
      header: 'Budget disponible',
      cell: ({ row }) => (
        new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'MGA',
          maximumFractionDigits: 0
        }).format(row.original.budget_disponible)
      ),
    },
    {
      id: 'pourcentage',
      header: '% Consommé',
      cell: ({ row }) => {
        const pourcentage = (row.original.budget_consomme / row.original.budget_alloue) * 100;
        return `${pourcentage.toFixed(1)}%`;
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  const handleExportPDF = () => {
    console.log("Export PDF pour l'onglet", activeTab);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tableaux de bord et reporting</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Partager
          </Button>
          <Button onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Exporter PDF
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">Période:</div>
            <Select value={periode} onValueChange={setPeriode}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sélectionner une période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1mois">Dernier mois</SelectItem>
                <SelectItem value="3mois">3 derniers mois</SelectItem>
                <SelectItem value="6mois">6 derniers mois</SelectItem>
                <SelectItem value="12mois">12 derniers mois</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'general' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('general')}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Général
          </Button>
          <Button 
            variant={activeTab === 'demandes' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('demandes')}
          >
            <FileText className="mr-2 h-4 w-4" />
            Demandes
          </Button>
          <Button 
            variant={activeTab === 'budget' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('budget')}
          >
            <PieChart className="mr-2 h-4 w-4" />
            Budget
          </Button>
          <Button 
            variant={activeTab === 'stocks' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('stocks')}
          >
            <LineChart className="mr-2 h-4 w-4" />
            Stocks
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total demandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDemandes}</div>
            <p className="text-xs text-muted-foreground">Sur {periode.replace('mois', ' mois')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taux d'approbation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tauxApprovation}%</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((tauxApprovation / 100) * totalDemandes)} approuvées
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Temps moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tempsMoyenTraitement.toFixed(1)} jours</div>
            <p className="text-xs text-muted-foreground">Traitement moyen</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Montant total</CardTitle>
            <CardDescription>Dépenses approuvées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'MGA',
                maximumFractionDigits: 0
              }).format(montantTotal)}
            </div>
            <p className="text-xs text-muted-foreground">Budget consommé</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="general" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">Vue générale</TabsTrigger>
          <TabsTrigger value="demandes">Demandes</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="stocks">Stocks</TabsTrigger>
          <TabsTrigger value="performances">Performances</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des dépenses par département</CardTitle>
                <CardDescription>Budget consommé par département</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={budgets}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="departement" type="category" width={100} />
                    <Tooltip 
                      formatter={(value) => new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'MGA'
                      }).format(value as number)}
                    />
                    <Legend />
                    <Bar 
                      dataKey="budget_consomme" 
                      name="Budget consommé (MGA)" 
                      fill="#4338ca" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Évolution des demandes</CardTitle>
                <CardDescription>Nombre de demandes par mois</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={statsDemandes}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="nbDemandes" name="Total demandes" fill="#4338ca" />
                    <Bar dataKey="nbApprouvees" name="Approuvées" fill="#10b981" />
                    <Bar dataKey="nbRejetees" name="Rejetées" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top départements demandeurs</CardTitle>
                <CardDescription>Par montant consommé</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topDepartements.slice(0, 5).map((dept, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: dept.color || colors[index % colors.length] }}
                        ></div>
                        <div className="font-medium">{dept.departement}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-right">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'MGA',
                            maximumFractionDigits: 0
                          }).format(dept.montantTotal)}
                        </div>
                        <div className="text-xs text-muted-foreground text-right">budget consommé</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Évolution du temps de traitement</CardTitle>
                <CardDescription>Temps moyen en jours par mois</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RechartsLineChart
                    data={statsDemandes}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="tempsTraitementMoyen" 
                      name="Temps moyen (jours)" 
                      stroke="#4338ca" 
                      activeDot={{ r: 8 }} 
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="demandes" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par statut</CardTitle>
                <CardDescription>Pourcentage des demandes par statut</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: 'Approuvées', value: Math.round((tauxApprovation / 100) * totalDemandes) },
                        { name: 'Rejetées', value: Math.round((tauxRejet / 100) * totalDemandes) },
                        { name: 'En cours', value: totalDemandes - Math.round((tauxApprovation / 100) * totalDemandes) - Math.round((tauxRejet / 100) * totalDemandes) }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                      <Cell fill="#0ea5e9" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Montants par département</CardTitle>
                <CardDescription>Budget consommé par département</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={budgets}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="departement" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'MGA'
                      }).format(value as number)}
                    />
                    <Legend />
                    <Bar 
                      dataKey="budget_consomme" 
                      name="Budget consommé (MGA)" 
                      fill="#4338ca" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="budget" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Consommation du budget</CardTitle>
                <CardDescription>Par département</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={budgets}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="departement" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'MGA'
                      }).format(value as number)}
                    />
                    <Legend />
                    <Bar dataKey="budget_alloue" name="Budget alloué" fill="#0ea5e9" />
                    <Bar dataKey="budget_consomme" name="Budget consommé" fill="#4338ca" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budgets par département</CardTitle>
                <CardDescription>Alloué, consommé et disponible</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {budgets.map((budget, index) => (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{budget.departement}</div>
                        <div className="text-sm text-muted-foreground">
                          {((budget.budget_consomme / budget.budget_alloue) * 100).toFixed(1)}% consommé
                        </div>
                      </div>
                      <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ 
                            width: `${Math.min(100, (budget.budget_consomme / budget.budget_alloue) * 100)}%`,
                            backgroundColor: colors[index % colors.length]
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Alloué</div>
                          <div>
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'MGA'
                            }).format(budget.budget_alloue)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Consommé</div>
                          <div>
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'MGA'
                            }).format(budget.budget_consomme)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Disponible</div>
                          <div>
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'MGA'
                            }).format(budget.budget_disponible)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Détail des budgets</CardTitle>
              <CardDescription>Tableau complet des données budgétaires</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={budgetColumns} 
                data={budgets}
                searchColumn="departement"
                searchPlaceholder="Rechercher un département..."
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stocks" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>État des stocks</CardTitle>
                <CardDescription>Quantités disponibles vs seuils d'alerte</CardDescription>
              </CardHeader>
              <CardContent>
                <StockChart 
                  data={articles.map(article => ({
                    nom: article.nom,
                    quantite: article.quantite,
                    seuil: article.seuil_alerte
                  }))} 
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Articles en alerte</CardTitle>
                <CardDescription>Articles sous le seuil minimum</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {articles
                    .filter(article => article.quantite <= article.seuil_alerte)
                    .slice(0, 5)
                    .map((article, index) => (
                      <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${article.quantite <= article.seuil_alerte ? 'bg-red-500' : 'bg-green-500'}`}></div>
                          <div>
                            <div className="font-medium">{article.nom}</div>
                            <div className="text-sm text-muted-foreground">{article.reference}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{article.quantite}/{article.seuil_alerte}</div>
                          <div className="text-sm text-muted-foreground">
                            {((article.quantite / article.seuil_alerte) * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Inventaire complet</CardTitle>
              <CardDescription>Liste de tous les articles en stock</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={articlesColumns} 
                data={articles}
                searchColumn="nom"
                searchPlaceholder="Rechercher un article..."
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performances" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {performanceMetrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{metric.name}</CardTitle>
                  <CardDescription>Cible: {metric.target}{metric.name.includes('Taux') ? '%' : metric.name.includes('Temps') ? ' jours' : ''}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">
                      {metric.value}{metric.name.includes('Taux') ? '%' : metric.name.includes('Temps') ? ' jours' : ''}
                    </div>
                    <div className={`text-lg font-semibold ${
                      metric.value >= metric.target * 0.9 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {metric.value >= metric.target * 0.9 ? '✓ Atteint' : '✗ Non atteint'}
                    </div>
                  </div>
                  <div className="mt-4 h-4 w-full bg-gray-200 rounded-full">
                    <div 
                      className="h-full rounded-full bg-primary" 
                      style={{ 
                        width: `${Math.min(100, (metric.value / metric.target) * 100)}%`,
                        backgroundColor: metric.value >= metric.target ? '#10b981' : '#ef4444'
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Comparaison des performances</CardTitle>
              <CardDescription>Valeurs réelles vs objectifs</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={performanceMetrics}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Valeur réelle" fill="#4338ca" />
                  <Bar dataKey="target" name="Objectif" fill="#6b7280" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reporting;