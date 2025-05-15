
import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { StockChart } from '@/components/charts/StockChart';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, ArrowDownUp, DownloadCloud, Eye, Plus, Settings, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import {Navigate, useNavigate } from 'react-router-dom';

// Interface pour les articles en stock
interface StockItem {
  id: string;
  categorie: string;
  nom: string;
  quantite: number;
  seuil: number;
  emplacement: string;
  dateMAJ: string;
  status: string;
}

// Données pour historique des mouvements
interface MouvementStock {
  id: string;
  date: string;
  article: string;
  quantite: number;
  type: 'entree' | 'sortie';
  utilisateur: string;
  reference: string;
}

const GestionStocks = () => {
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [mouvementsData, setMouvementsData] = useState<MouvementStock[]>([]);
  const [loading, setLoading] = useState({
    stock: true,
    mouvements: true
  });
  const [error, setError] = useState({
    stock: null,
    mouvements: null
  });

  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await fetch('http://localhost:8000/articleStock/article/');
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
        setStockData(data.data || []);
      } catch (err) {
        setError(prev => ({ ...prev, stock: err.message }));
        toast.error('Erreur lors du chargement des articles');
      } finally {
        setLoading(prev => ({ ...prev, stock: false }));
      }
    };

    const fetchMouvementsData = async () => {
      try {
        const response = await fetch('http://localhost:8000/stockMouvement/stock/movement/');
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
        setMouvementsData(data.data || []);
      } catch (err) {
        setError(prev => ({ ...prev, mouvements: err.message }));
        toast.error('Erreur lors du chargement des mouvements');
      } finally {
        setLoading(prev => ({ ...prev, mouvements: false }));
      }
    };
    
    fetchStockData();
    fetchMouvementsData();
  }, []);

// Données de démonstration
const stockColumns: ColumnDef<StockItem>[] = [
  {
    accessorKey: 'nom',
    header: ({ column }) => (
      <div className="flex items-center cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Article <ArrowDownUp className="ml-2 h-4 w-4" />
      </div>
    ),
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
    id: 'status',
    header: 'Statut',
    cell: ({ row }) => {
      const quantite = row.original.quantite;
      const seuil = row.original.seuil_alerte;
      
      let statusDisplay = 'ok';
      if (quantite <= seuil * 0.5) {
        statusDisplay = 'critical';
      } else if (quantite <= seuil) {
        statusDisplay = 'warning';
      }
      
      let statusLabel = '';
      if (statusDisplay === 'critical') {
        statusLabel = 'Critique';
      } else if (statusDisplay === 'warning') {
        statusLabel = 'Alerte';
      } else {
        statusLabel = 'Normal';
      }
      
      return <StatusBadge status={statusDisplay as any} label={statusLabel} />;
    },
  },
  {
    accessorKey: 'emplacement',
    header: 'Emplacement',
  },
  {
    accessorKey: 'date_creation',
    header: 'Date création',
    cell: ({ row }) => new Date(row.original.date_creation).toLocaleDateString(),
  },
  {
    id: 'actions',
    cell: () => (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm">Ajuster</Button>
      </div>
    ),
  },
];



const mouvementColumns: ColumnDef<MouvementStock>[] = [
  {
    accessorKey: 'date_mouvement',
    header: 'Date',
    cell: ({ row }) => {
      const dateStr = row.original.date_mouvement;
      const formattedDate = new Date(dateStr).toLocaleDateString('fr-FR'); // Format DD/MM/YYYY
      return <span>{formattedDate}</span>;
    },
  },
  {
    accessorKey: 'nom_article',
    header: 'Article',
  },
  {
    accessorKey: 'type_mouvement',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.original.type_mouvement;
      return (
        <div className="flex items-center">
          {type === 'entree' ? (
            <>
              <DownloadCloud className="h-4 w-4 mr-2 text-green-500" />
              <span>Entrée</span>
            </>
          ) : (
            <>
              <UploadCloud className="h-4 w-4 mr-2 text-red-500" />
              <span>Sortie</span>
            </>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'quantite',
    header: 'Quantité',
  },
  {
    accessorKey: 'reference',
    header: 'Référence',
  },
];


// Formulaire d'ajustement de stock
const StockAjustementForm = () => {
  const [articles, setArticles] = useState<any[]>([]); // Liste des articles avec noms et IDs
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null); // Article sélectionné
  const [quantite, setQuantite] = useState('');
  const [type, setType] = useState('entree');
  const [reference, setReference] = useState('');
  
 // Chargement des articles depuis l'API
 useEffect(() => {
  const fetchArticles = async () => {
    try {
      const response = await fetch('http://localhost:8000/articleStock/article/');
      const data = await response.json();

      // Vérification que 'data' est un tableau avant de le stocker
      if (Array.isArray(data.data)) {
        setArticles(data.data); // On accède à 'data' qui contient le tableau des articles
      } else {
        console.error('Les articles ne sont pas un tableau:', data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des articles:', error);
    }
  };

  fetchArticles(); // Appel de la fonction pour charger les articles au moment du rendu du composant
}, []);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!selectedArticle) {
    toast.error('Veuillez sélectionner un article.');
    return;
  }

  const actionToSend = type === 'entree' ? 'entrer' : 'retrait'; // Convertir 'entree' et 'sortie' en 'entrer' et 'retrait'

  try {
    const response = await fetch(`http://localhost:8000/stockMouvement/stock/movement/${selectedArticle.id}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        article: selectedArticle.id, // Utilise l'ID dans le body de la requête
        quantite: parseInt(quantite),
        action: actionToSend, // Utilisation de 'entrer' ou 'retrait'
        reference,
      }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'ajustement');
    }

    toast.success(`Stock ajusté: ${type === 'entree' ? '+' : '-'}${quantite} ${selectedArticle.nom}`);
    setQuantite('');
    setType('entree');
    setReference('');
  } catch (err) {
    toast.error(`Erreur: ${err.message}`);
  }
};

  
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-3 gap-4">
        {/* <div className="space-y-2">
            <label htmlFor="article" className="text-sm font-medium">Département</label>
            <Select value={selectedArticle ? selectedArticle.id : ''}  
              onValueChange={(value) => {
                const article = articles.find((a) => a.id === value);
                setSelectedArticle(article || null);
              }}
            >
              <SelectTrigger id="article">
                <SelectValue placeholder="Sélectionner un article" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(articles) && articles.length > 0 ? (
                  articles.map((article) => (
                    <SelectItem key={article.id} value={article.id}>
                      {article.nom}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled>Aucun article disponible</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div> */}
        <div className="space-y-2">
            <label htmlFor="article" className="text-sm font-medium">Article</label>
            <Select value={selectedArticle ? selectedArticle.id : ''}  
              onValueChange={(value) => {
                const article = articles.find((a) => a.id === value);
                setSelectedArticle(article || null);
              }}
            >
              <SelectTrigger id="article">
                <SelectValue placeholder="Sélectionner un article" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(articles) && articles.length > 0 ? (
                  articles.map((article) => (
                    <SelectItem key={article.id} value={article.id}>
                      {article.nom}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled>Aucun article disponible</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        
        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium">Type de mouvement</label>
          <Select value={type} onValueChange={setType} required>
            <SelectTrigger id="type">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entree">Entrée</SelectItem>
              <SelectItem value="sortie">Sortie</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <label htmlFor="quantite" className="text-sm font-medium">Quantité</label>
          <Input 
            id="quantite" 
            type="number" 
            min="1" 
            value={quantite} 
            onChange={(e) => setQuantite(e.target.value)} 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="reference" className="text-sm font-medium">Référence (optionnel)</label>
          <Input 
            id="reference" 
            value={reference} 
            onChange={(e) => setReference(e.target.value)} 
            placeholder="Bon de commande, demande..." 
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full">Valider l'ajustement</Button>
    </form>
  );
};

// Composant principal de gestion des stocks

  // Filtrer pour les alertes de stock
  const alertStock = stockData.filter(item => item.quantite <= item.seuil_alerte);
  
  // Données pour le graphique
  const chartData = [...stockData]
  .sort((a, b) => a.quantite - b.quantite)
  .slice(0, 8)
  .map(item => ({
    nom: item.nom,
    quantite: item.quantite,
    seuil: item.seuil_alerte // Transformation de seuil_alerte en seuil
  }));
  
  if (loading.stock || loading.mouvements) {
    return <div className="flex justify-center items-center h-64">Chargement en cours...</div>;
  }

  if (error.stock || error.mouvements) {
    return (
      <div className="text-red-500 p-4">
        Erreur: {error.stock || error.mouvements}
        <Button onClick={() => window.location.reload()} className="mt-2">
          Réessayer
        </Button>
      </div>
    );
  }
  // const navigate = useNavigate(); // Initialisation du hook

  // Exemple d'utilisation pour rediriger après une action
 
  const handleClickArticle = () => navigate("/articles");
  const handleClickDemande = () => navigate("/demandes");


  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gestion des stocks</h1>
        <div className="flex gap-2">
          <Button onClick={handleClickDemande}>
            <Eye className="mr-2 h-4 w-4" />
            Voir Demande
          </Button>
          <Button onClick={handleClickArticle}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle article
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Articles en stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockData.length}</div>
            <p className="text-xs text-muted-foreground">Types d'articles dans l'inventaire</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alertes de stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertStock.length}</div>
            <p className="text-xs text-muted-foreground">Articles sous le seuil minimal</p>
            {alertStock.length > 0 && (
              <div className="mt-2 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {alertStock.filter(i => i.status === 'critical').length} article(s) en état critique
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mouvements récents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mouvementsData.length}</div>
            <p className="text-xs text-muted-foreground">Dans les 30 derniers jours</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventaire">
        <TabsList>
          <TabsTrigger value="inventaire">Inventaire</TabsTrigger>
          <TabsTrigger value="ajustement">Ajustement de stock</TabsTrigger>
          <TabsTrigger value="mouvements">Historique des mouvements</TabsTrigger>
          <TabsTrigger value="alertes">Alertes de stock ({alertStock.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="inventaire" className="space-y-4">
          <StockChart 
            data={chartData} 
            title="Vue d'ensemble des stocks" 
            description="Articles avec les stocks les plus bas"
          />
          
          <DataTable 
            columns={stockColumns} 
            data={stockData}
            searchColumn="nom"
            searchPlaceholder="Rechercher un article..."
          />
        </TabsContent>

        <TabsContent value="ajustement">
          <Card>
            <CardHeader>
              <CardTitle>Ajustement de stock</CardTitle>
              <CardDescription>
                Utilisez ce formulaire pour enregistrer une entrée ou une sortie de stock.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StockAjustementForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mouvements">
          <DataTable 
            columns={mouvementColumns} 
            data={mouvementsData}
            searchColumn="article"
            searchPlaceholder="Rechercher un mouvement..."
          />
        </TabsContent>

        <TabsContent value="alertes">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Articles sous le seuil minimal</CardTitle>
              <CardDescription>
                Ces articles nécessitent une attention particulière et doivent être réapprovisionnés.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={stockColumns}

                data={alertStock}
                searchColumn="nom"
                searchPlaceholder="Rechercher un article en alerte..."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GestionStocks;
