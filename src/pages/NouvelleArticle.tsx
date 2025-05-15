import React, { useState, useEffect } from 'react';
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
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function NouvelleArticle() {
  const [nom, setNom] = useState('');
  const [reference, setReference] = useState('');
  const [categorie, setCategorie] = useState('');
  const [quantiteInitiale, setQuantiteInitiale] = useState('');
  const [seuilAlerte, setSeuilAlerte] = useState('');
  const [emplacement, setEmplacement] = useState('Entrepôt 1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/stocks");
  };

  // Notification toast
  useEffect(() => {
    const toastId = toast.custom(
      (t) => (
        <div className="w-full max-w-md p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-start">
            <span className="mr-2 text-yellow-500 text-xl">⚠️</span>
            <div>
              <p className="font-semibold text-gray-800">Avant de soumettre :</p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-sm text-gray-700">
                <li>Les champs marqués d'un <span className="text-red-500 font-bold">*</span> sont obligatoires</li>
                <li>Veuillez vérifier que toutes les informations sont correctes</li>
                <li>Les données soumises ne pourront pas être modifiées ultérieurement</li>
                <li>Veillez à ce que toutes les données soient insérées dans le formulaire</li>
              </ul>
              <button 
                onClick={() => toast.dismiss(t)}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      ),
      { duration: 60000 }
    );

    return () => toast.dismiss(toastId);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!nom || !reference || !categorie || !quantiteInitiale || !emplacement) {
      toast.error('Veuillez remplir tous les champs obligatoires', {
        duration: 5000,
        description: 'Les champs marqués d\'un * sont requis'
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/articleStock/articlescreate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom,
          reference,
          categorie,
          quantite: parseInt(quantiteInitiale),
          seuil_alerte: seuilAlerte ? parseInt(seuilAlerte) : 1,
          emplacement
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création');
      }

      const data = await response.json();
    //   toast.success(`Article ajouté: ${data.nom} (${data.reference})`, {
      toast.success(`Article ajouté`, {
        description: `Stock initial: ${data.quantite} ${data.unite}`
      });

      // Réinitialisation
      setNom('');
      setReference('');
      setCategorie('');
      setQuantiteInitiale('');
      setSeuilAlerte('');
      setEmplacement('Entrepôt 1');

    } catch (error) {
      toast.error('Erreur', {
        description: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button 
            className="bg-gray-500 hover:bg-gray-600 text-white text-base font-medium px-4 py-2 rounded-md flex items-center"
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Retour
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Nouvel Article</h1>
      </div>
      
      {/* Contenu principal */}
      <div className='pt-4'>
        <Card className="h-full w-full">
          <CardHeader>
            <CardTitle>Ajout d'un nouvel article</CardTitle>
            <CardDescription>
              Complétez ces informations pour ajouter un nouvel article à l'inventaire
            </CardDescription>
          </CardHeader>
          
          <CardContent className="h-[calc(100%-120px)]">
            <form onSubmit={handleSubmit} className="h-full flex flex-col">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-auto p-1">
                {/* Colonne 1 */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Nom de l'article<span className='text-red-500 font-medium text-lg'>*</span></label>
                    <Input
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      placeholder="Nom complet de l'article"
                      required
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Catégorie<span className='text-red-500 font-medium text-lg'>*</span></label>
                    <Select value={categorie} onValueChange={setCategorie} required>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="informatique">Informatique</SelectItem>
                        <SelectItem value="mobilier">Mobilier</SelectItem>
                        <SelectItem value="fournitures">Fournitures</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Stock initial<span className='text-red-500 font-medium text-lg'>*</span></label>
                    <Input
                      type="number"
                      min="0"
                      value={quantiteInitiale}
                      onChange={(e) => setQuantiteInitiale(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>
                </div>
                
                {/* Colonne 2 */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Référence<span className='text-red-500 font-medium text-lg'>*</span></label>
                    <Input
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="Code unique de référence"
                      required
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Emplacement<span className='text-red-500 font-medium text-lg'>*</span></label>
                    <Select value={emplacement} onValueChange={setEmplacement} required>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner une unité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Entrepôt 1">Entrepôt 1</SelectItem>
                        <SelectItem value="Entrepôt 2">Entrepôt 2</SelectItem>
                        <SelectItem value="Entrepôt 3">Entrepôt 3</SelectItem>
                        <SelectItem value="Entrepôt 4">Entrepôt 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Seuil d'alerte stock</label>
                    <Input
                      type="number"
                      min="1"
                      value={seuilAlerte}
                      onChange={(e) => setSeuilAlerte(e.target.value)}
                      placeholder="Quantité minimale avant alerte"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-6 mt-auto">
                <Button 
                  type="submit" 
                  className="w-full lg:w-64 h-12 text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer l\'article'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default NouvelleArticle;