import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Eye, FileText, Plus, Box, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Type pour les demandes d'achat
interface DemandeAchat {
  id: string;
  date: string;
  nature: string;
  departement: string;
  demandeur: string;
  quantite: number;
  quantiteDisponible: number; // Nouveau champ
  urgence: number;
  impact: number;
  status: string;
  description: string;
  Justification: string;
  // piecesJustificatives: string[];
}

// Données de test pour les demandes d'achat
const dummyDemandes: DemandeAchat[] = [
  { 
    id: 'DEM-2023-001', 
    date: '15/06/2023', 
    nature: 'Ordinateurs portables', 
    departement: 'Informatique', 
    demandeur: 'Marie Lambert', 
    quantite: 5,
    quantiteDisponible: 2, // Exemple de quantité disponible
    urgence: 4, 
    impact: 4, 
    status: 'approved',
    description: 'Acquisition de 5 ordinateurs portables haute performance pour les développeurs.',
    Justification: 'Les modèles actuels sont obsolètes et ne permettent pas de compiler efficacement.',
    // piecesJustificatives: ['devis_dell_xps.pdf', 'specs_techniques.pdf']
  },
  { 
    id: 'DEM-2023-002', 
    date: '14/06/2023', 
    nature: 'Mobilier de bureau', 
    departement: 'RH', 
    demandeur: 'Thomas Dubois', 
    quantite: 10,
    quantiteDisponible: 15,
    urgence: 2, 
    impact: 2, 
    status: 'pending',
    description: 'Remplacement des chaises de bureau dans l\'open space RH.',
    Justification: 'Les chaises actuelles ne sont plus ergonomiques et causent des maux de dos.',
    // piecesJustificatives: ['catalogue_mobilier.pdf', 'devis_fournisseur.pdf']
  },
  { 
    id: 'DEM-2023-002', 
    date: '14/06/2023', 
    nature: 'Mobilier de bureau', 
    departement: 'RH', 
    demandeur: 'Thomas Dubois', 
    quantite: 10,
    quantiteDisponible: 15,
    urgence: 2, 
    impact: 2, 
    status: 'pending',
    description: 'Remplacement des chaises de bureau dans l\'open space RH.',
    Justification: 'Les chaises actuelles ne sont plus ergonomiques et causent des maux de dos.',
    // piecesJustificatives: ['catalogue_mobilier.pdf', 'devis_fournisseur.pdf']
  },
  { 
    id: 'DEM-2023-002', 
    date: '14/06/2023', 
    nature: 'Mobilier de bureau', 
    departement: 'RH', 
    demandeur: 'Thomas Dubois', 
    quantite: 10,
    quantiteDisponible: 15,
    urgence: 2, 
    impact: 2, 
    status: 'pending',
    description: 'Remplacement des chaises de bureau dans l\'open space RH.',
    Justification: 'Les chaises actuelles ne sont plus ergonomiques et causent des maux de dos.',
    // piecesJustificatives: ['catalogue_mobilier.pdf', 'devis_fournisseur.pdf']
  },
  { 
    id: 'DEM-2023-002', 
    date: '14/06/2023', 
    nature: 'Mobilier de bureau', 
    departement: 'RH', 
    demandeur: 'Thomas Dubois', 
    quantite: 10,
    quantiteDisponible: 15,
    urgence: 2, 
    impact: 2, 
    status: 'pending',
    description: 'Remplacement des chaises de bureau dans l\'open space RH.',
    Justification: 'Les chaises actuelles ne sont plus ergonomiques et causent des maux de dos.',
    // piecesJustificatives: ['catalogue_mobilier.pdf', 'devis_fournisseur.pdf']
  },
  // ... autres demandes
];

const ListeDemandesAchats = () => {

const navigate = useNavigate();

  const handleBack = () => {
    navigate("/stocks");
  };

  return (
    <div className="space-y-6 animate-fade-in">
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
        <h1 className="text-3xl font-bold tracking-tight">Liste des demandes</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {dummyDemandes.map((demande) => (
          <Card key={demande.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{demande.nature}</CardTitle>
                  <p className="text-sm text-muted-foreground">Réf: {demande.id}</p>
                </div>
                <StatusBadge status={demande.status as any} />
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Demandeur</p>
                  <p>{demande.demandeur}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Département</p>
                  <p>{demande.departement}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p>{demande.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <Box className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-sm">Quantité demandée</p>
                    <p className="font-medium">{demande.quantite}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Box className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-sm">Disponible en stock</p>
                    <p className={`font-medium ${
                      demande.quantiteDisponible >= demande.quantite 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {demande.quantiteDisponible}
                      {demande.quantiteDisponible < demande.quantite && (
                        <span className="text-xs text-muted-foreground ml-1">(insuffisant)</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-2" />

              <div>
                <p className="text-sm font-medium mb-1">Description:</p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {demande.description}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Justification:</p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {demande.Justification}
                </p>
              </div>

              {/* {demande.piecesJustificatives.length > 0 && (
                <>
                  <Separator className="my-2" />
                  <div>
                    <p className="text-sm font-medium mb-1">Pièces jointes</p>
                    <div className="space-y-1">
                      {demande.piecesJustificatives.map((piece, index) => (
                        <div key={index} className="flex items-center text-sm text-muted-foreground">
                          <FileText className="h-4 w-4 mr-2 text-primary" />
                          <span className="truncate">{piece}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )} */}
            </CardContent>

            <CardFooter className="flex justify-end">
              <Button asChild variant="outline" size="sm">
                <Link to={`/demande-achat/${demande.id}`}>
                  <Eye className="mr-2 h-4 w-4" /> Voir détails
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ListeDemandesAchats;