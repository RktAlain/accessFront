import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowDownUp, Download, Plus, RefreshCw, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { useLanguage } from '@/language-context';
import api from '@/lib/api';

interface BudgetDepartement {
  id: string;
  departement: string;
  alloue: number;
  consomme: number;
  disponible: number;
  previsionnel: number;
}

interface DepenseBudgetaire {
  id: string;
  date: string;
  reference: string;
  nature: string;
  departement: string;
  montant: number;
  categorie: string;
}

interface DevisApprouve {
  id: string;
  date_devis: string;
  reference_devis: string;
  nom_materiel: string;
  nom_departement: string;
  quantite: number;
  prix_unitaire: number;
  montant_total: number;
}

interface BudgetChartProps {
  data: { departement: string; alloue: number }[];
  title: string;
  description: string;
}

const departementColors: { [key: string]: string } = {
  Informatique: "#3b82f6",
  Marketing: "#f97316",
  Logistique: "#10b981",
  Finance: "#f43f5e",
  Direction: "#a855f7"
};

export const BudgetChart: React.FC<BudgetChartProps> = ({ data, title, description }) => {
  const { translate } = useLanguage();
  
  return (
    <div className="w-full p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold">{translate(title)}</h2>
      <p className="text-sm text-gray-500">{translate(description)}</p>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="departement" />
          <YAxis />
          <Tooltip 
            formatter={(value) => [
              new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'MGA',
                maximumFractionDigits: 0
              }).format(Number(value)),
              translate("Budget alloué")
            ]}
          />
          <Legend />
          <Bar 
            name={translate("Budget alloué")}
            dataKey="alloue" 
            radius={[5, 5, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={departementColors[entry.departement] || "#6b7280"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const Budgets = () => {
  const { translate } = useLanguage();
  const [selectedDepartement, setSelectedDepartement] = useState<string>('all');
  const [showNewAllocation, setShowNewAllocation] = useState(false);
  const [budgetsDepartements, setBudgetsDepartements] = useState<BudgetDepartement[]>([]);
  const [devisApprouves, setDevisApprouves] = useState<DevisApprouve[]>([]);
  const [newAllocation, setNewAllocation] = useState({
    departement: '',
    montant: ''
  });

  const departementsDisponibles = [
    "Informatique",
    "Marketing",
    "Logistique",
    "Finance",
    "Direction"
  ];

  const budgetColumns: ColumnDef<BudgetDepartement>[] = [
    {
      accessorKey: 'departement',
      header: ({ column }) => (
        <div className="flex items-center cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          {translate("Département")} <ArrowDownUp className="ml-2 h-4 w-4" />
        </div>
      ),
    },
    {
      accessorKey: 'alloue',
      header: translate("Budget alloué"),
      cell: ({ row }) => {
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'MGA',
          maximumFractionDigits: 0
        }).format(row.original.alloue);
      },
    },
    {
      accessorKey: 'consomme',
      header: translate("Consommé"),
      cell: ({ row }) => {
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'MGA',
          maximumFractionDigits: 0
        }).format(row.original.consomme);
      },
    },
    {
      accessorKey: 'disponible',
      header: translate("Disponible"),
      cell: ({ row }) => {
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'MGA',
          maximumFractionDigits: 0
        }).format(row.original.disponible);
      },
    },
    {
      id: 'progression',
      header: translate("Progression"),
      cell: ({ row }) => {
        const consomme = row.original.consomme;
        const alloue = row.original.alloue;
        const pourcentage = Math.round((consomme / alloue) * 100);
        
        let progressClass = 'bg-green-500';
        if (pourcentage >= 90) {
          progressClass = 'bg-red-500';
        } else if (pourcentage >= 75) {
          progressClass = 'bg-yellow-500';
        }
        
        return (
          <div className="w-full">
            <div className="flex justify-between items-center mb-1 text-xs">
              <span>{pourcentage}%</span>
              <span>{new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'MGA',
                maximumFractionDigits: 0
              }).format(consomme)} / {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'MGA',
                maximumFractionDigits: 0
              }).format(alloue)}</span>
            </div>
            <Progress value={pourcentage} className="h-2" indicatorClassName={progressClass} />
          </div>
        );
      },
    },
  ];

  const devisColumns: ColumnDef<DevisApprouve>[] = [
    {
      accessorKey: 'date_devis',
      header: translate("Date"),
    },
    {
      accessorKey: 'reference_devis',
      header: translate("Référence"),
    },
    {
      accessorKey: 'nom_materiel',
      header: translate("Nature"),
    },
    {
      accessorKey: 'nom_departement',
      header: translate("Département"),
    },
    {
      accessorKey: 'quantite',
      header: translate("Quantité"),
    },
    {
      accessorKey: 'prix_unitaire',
      header: translate("Prix unitaire"),
      cell: ({ row }) => {
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'MGA'
        }).format(row.original.prix_unitaire);
      },
    },
    {
      accessorKey: 'montant_total',
      header: translate("Montant total"),
      cell: ({ row }) => {
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'MGA'
        }).format(row.original.montant_total);
      },
    },
  ];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await api.get('/budget/listeBudgets/');
        const data =  response.data;
        
        if (data.status === 'success') {
          setBudgetsDepartements(data.data.map((budget: any) => ({
            id: budget.id,
            departement: budget.departement,
            alloue: budget.budget_alloue,
            consomme: budget.budget_consomme,
            disponible: budget.budget_disponible,
            previsionnel: 0
          })));
        }
      } catch (error) {
        console.error(translate("Erreur lors du chargement des données:"), error);
      }
    };

    const chargerDevisApprouves = async () => {
      try {
        const response = await api.get('/achatDevis/listeDevis/');
        const data = response.data;
        
        if (data.status === 'success') {
          const devisFiltres = data.data
            .filter((devis: any) => devis.status_devis === 'approuvé')
            .map((devis: any) => ({
              id: devis.id,
              date_devis: devis.date_devis,
              reference_devis: devis.reference_devis,
              nom_materiel: devis.nom_materiel,
              nom_departement: devis.nom_departement,
              quantite: parseInt(devis.quantite) || 0,
              prix_unitaire: parseFloat(devis.prix_unitaire) || 0,
              montant_total: parseFloat(devis.montant_total) || 0
            }));
          
          setDevisApprouves(devisFiltres);
        }
      } catch (error) {
        console.error(translate("Erreur lors du chargement des devis:"), error);
      }
    };

    fetchInitialData();
    chargerDevisApprouves();
  }, [translate]);

  const handleAddAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/budget/ajouterBudgets/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          departement: newAllocation.departement,
          budget_alloue: Number(newAllocation.montant),
          budget_consomme: 0
        }),
      });

      if (!response) {
        throw new Error(translate("Erreur lors de l'ajout du budget"));
      }

      const updatedResponse = await fetch('/budget/listeBudgets/');
      const updatedData = await updatedResponse.json();
      
      if (updatedData.status === 'success') {
        setBudgetsDepartements(updatedData.data.map((budget: any) => ({
          id: budget.id,
          departement: budget.departement,
          alloue: budget.budget_alloue,
          consomme: budget.budget_consomme,
          disponible: budget.budget_disponible,
          previsionnel: 0
        })));
      }

      setShowNewAllocation(false);
      setNewAllocation({ departement: '', montant: '' });
    } catch (error) {
      console.error(translate("Erreur:"), error);
      alert(translate("Une erreur est survenue lors de l'ajout du budget"));
    }
  };

  const chargerDevisApprouves = async () => {
    try {
      const response = await api.get('/devis/listeDevis/');
      const data = response.data;
      
      if (data.status === 'success') {
        const devisFiltres = data.data
          .filter((devis: any) => devis.status_devis === 'approuvé')
          .map((devis: any) => ({
            id: devis.id,
            date_devis: devis.date_devis,
            reference_devis: devis.reference_devis,
            nom_materiel: devis.nom_materiel,
            nom_departement: devis.nom_departement,
            quantite: parseInt(devis.quantite) || 0,
            prix_unitaire: parseFloat(devis.prix_unitaire) || 0,
            montant_total: parseFloat(devis.montant_total) || 0
          }));
        
        setDevisApprouves(devisFiltres);
      }
    } catch (error) {
      console.error(translate("Erreur lors du chargement des devis:"), error);
    }
  };

  // Calcul des totaux
  const totalAlloue = budgetsDepartements.reduce((acc, curr) => acc + curr.alloue, 0);
  const totalConsomme = budgetsDepartements.reduce((acc, curr) => acc + curr.consomme, 0);
  const totalDisponible = budgetsDepartements.reduce((acc, curr) => acc + curr.disponible, 0);
  const pourcentageConsomme = Math.round((totalConsomme / totalAlloue) * 100);

  const repartitionBudget = budgetsDepartements.map(({ departement, alloue }) => ({
    departement,
    alloue
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {showNewAllocation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{translate("Nouvelle allocation")}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowNewAllocation(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddAllocation} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{translate("Département")}</label>
                  <Select 
                    onValueChange={(value) => setNewAllocation({ ...newAllocation, departement: value })}
                    value={newAllocation.departement}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={translate("Sélectionner un département")} />
                    </SelectTrigger>
                    <SelectContent>
                      {departementsDisponibles.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {translate(dept)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">{translate("Montant")}</label>
                  <Input
                    required
                    type="number"
                    min="0"
                    placeholder={translate("Montant alloué")}
                    value={newAllocation.montant}
                    onChange={(e) => setNewAllocation({
                      ...newAllocation,
                      montant: e.target.value
                    })}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewAllocation(false)}
                  >
                    {translate("Annuler")}
                  </Button>
                  <Button type="submit">{translate("Enregistrer")}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{translate("Gestion budgétaire")}</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {translate("Exporter")}
          </Button>
          <Button onClick={() => setShowNewAllocation(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {translate("Nouvelle allocation")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{translate("Budget total")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'MGA',
                maximumFractionDigits: 0
              }).format(totalAlloue)}
            </div>
            <p className="text-xs text-muted-foreground">{translate("Budget annuel alloué")}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{translate("Consommé")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'MGA',
                maximumFractionDigits: 0
              }).format(totalConsomme)}
            </div>
            <p className="text-xs text-muted-foreground">{pourcentageConsomme}% {translate("du budget total")}</p>
            <Progress value={pourcentageConsomme} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{translate("Disponible")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'MGA',
                maximumFractionDigits: 0
              }).format(totalDisponible)}
            </div>
            <p className="text-xs text-muted-foreground">{Math.round((totalDisponible / totalAlloue) * 100)}% {translate("du budget total")}</p>
            
            <Button variant="link" className="p-0 h-auto text-xs mt-2">
              <RefreshCw className="h-3 w-3 mr-1" />
              {translate("Réallouer des fonds")}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="repartition">
        <TabsList>
          <TabsTrigger value="repartition">{translate("Répartition budgétaire")}</TabsTrigger>
          <TabsTrigger value="departements">{translate("Par département")}</TabsTrigger>
          <TabsTrigger value="depenses">{translate("Dépenses")}</TabsTrigger>
          <TabsTrigger value="previsionnel">{translate("Prévisionnel")}</TabsTrigger>
        </TabsList>

        <TabsContent value="repartition" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-1">
            <BudgetChart 
              data={repartitionBudget} 
              title="Répartition par département" 
              description="Budget alloué à chaque département"
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>{translate("Répartition budgétaire détaillée")}</CardTitle>
              <CardDescription>{translate("Vue d'ensemble des budgets par département")}</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={budgetColumns} 
                data={budgetsDepartements}
                searchColumn="departement"
                searchPlaceholder={translate("Rechercher un département...")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departements">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{translate("Budgets par département")}</CardTitle>
                  <CardDescription>{translate("Suivi détaillé par département")}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-medium">{translate("Département:")}</div>
                  <select 
                    className="border rounded px-2 py-1 text-sm"
                    value={selectedDepartement}
                    onChange={(e) => setSelectedDepartement(e.target.value)}
                  >
                    <option value="all">{translate("Tous les départements")}</option>
                    {budgetsDepartements.map((dept) => (
                      <option key={dept.id} value={dept.departement}>
                        {translate(dept.departement)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {(selectedDepartement === 'all' ? budgetsDepartements : budgetsDepartements.filter(d => d.departement === selectedDepartement)).map((dept) => (
                  <div key={dept.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">{translate(dept.departement)}</h3>
                      <div className="text-sm font-medium">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'MGA',
                          maximumFractionDigits: 0
                        }).format(dept.consomme)} / {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'MGA',
                          maximumFractionDigits: 0
                        }).format(dept.alloue)}
                      </div>
                    </div>
                    
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 rounded-full bg-green-200 text-green-800">
                            {Math.round((dept.consomme / dept.alloue) * 100)}%
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-muted-foreground">
                            {translate("Disponible:")} {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'MGA',
                              maximumFractionDigits: 0
                            }).format(dept.disponible)}
                          </span>
                        </div>
                      </div>
                      <div className="flex h-2 mb-4 overflow-hidden text-xs bg-muted rounded">
                        <div 
                          style={{ width: `${Math.round((dept.consomme / dept.alloue) * 100)}%` }}
                          className="flex flex-col justify-center text-center text-white bg-green-500 shadow-none whitespace-nowrap"
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{translate("Consommé:")} {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'MGA',
                          maximumFractionDigits: 0
                        }).format(dept.consomme)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="depenses">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{translate("Devis approuvés")}</CardTitle>
                  <CardDescription>{translate("Liste des devis approuvés et transformés en dépenses")}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-medium">{translate("Filtrer par département:")}</div>
                  <select 
                    className="border rounded px-2 py-1 text-sm"
                    value={selectedDepartement}
                    onChange={(e) => setSelectedDepartement(e.target.value)}
                  >
                    <option value="all">{translate("Tous les départements")}</option>
                    {Array.from(new Set(devisApprouves.map(d => d.nom_departement))).map((dept) => (
                      <option key={dept} value={dept}>
                        {translate(dept)}
                      </option>
                    ))}
                  </select>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={chargerDevisApprouves}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={devisColumns} 
                data={selectedDepartement === 'all' 
                  ? devisApprouves 
                  : devisApprouves.filter(d => d.nom_departement === selectedDepartement)}
                searchColumn="nom_materiel"
                searchPlaceholder={translate("Rechercher un matériel...")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="previsionnel">
          <Card>
            <CardHeader>
              <CardTitle>{translate("Prévisions budgétaires")}</CardTitle>
              <CardDescription>{translate("Analyse des tendances et prévisions de dépenses")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {budgetsDepartements.map((dept) => (
                  <div key={dept.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">{translate(dept.departement)}</h3>
                      <div className="text-sm text-muted-foreground">
                        {translate("Prévision:")} {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'MGA',
                          maximumFractionDigits: 0
                        }).format(dept.previsionnel)} / {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'MGA',
                          maximumFractionDigits: 0
                        }).format(dept.alloue)}
                      </div>
                    </div>
                    
                    <div className="relative pt-1">
                      <div className="flex h-2 mb-1 overflow-hidden text-xs bg-muted rounded">
                        <div 
                          style={{ width: `${Math.round((dept.consomme / dept.alloue) * 100)}%` }}
                          className="flex flex-col justify-center text-center text-white bg-green-500 shadow-none whitespace-nowrap"
                        ></div>
                      </div>
                      <div className="mt-1 mb-2 h-2 w-full relative">
                        <div className="absolute h-2 w-px bg-gray-500 top-0" style={{ left: `${Math.round((dept.previsionnel / dept.alloue) * 100)}%` }}></div>
                        <div className="absolute -top-6 transform -translate-x-1/2 text-xs font-medium" style={{ left: `${Math.round((dept.previsionnel / dept.alloue) * 100)}%` }}>
                          {translate("Prévision")}
                        </div>
                        <div 
                          className={`absolute -bottom-5 transform -translate-x-1/2 text-xs ${dept.previsionnel > dept.alloue ? 'text-red-600' : 'text-green-600'}`} 
                          style={{ left: `${Math.round((dept.previsionnel / dept.alloue) * 100)}%` }}
                        >
                          {dept.previsionnel > dept.alloue 
                            ? `+${Math.round(((dept.previsionnel - dept.alloue) / dept.alloue) * 100)}%` 
                            : `-${Math.round(((dept.alloue - dept.previsionnel) / dept.alloue) * 100)}%`}
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-4">
                        <span>{translate("Réel:")} {Math.round((dept.consomme / dept.alloue) * 100)}%</span>
                        <span>{translate("Prévision:")} {Math.round((dept.previsionnel / dept.alloue) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Budgets;