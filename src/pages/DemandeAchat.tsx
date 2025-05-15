import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DemandeForm } from "@/components/forms/DemandeForm";
import { DataTable } from "@/components/ui/data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Eye, FileText, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import { toast } from "sonner";
import { useLanguage } from "@/language-context";

interface DemandeAchat {
  _id: string;
  reference: string;
  demandeur_id: string | number;
  natureDemande: string;
  departement: string;
  description: string;
  quantite: number;
  urgence: string;
  impactStrategique: string;
  justification: string;
  siConfidentiel: boolean;
  status: string;
  dateDemande: string;
  pieceJustificative?: string;
}

const StatusBadge = ({ status, className = "" }: { status: string; className?: string }) => {
  const { translate } = useLanguage();
  
  const statusMap: Record<string, string> = {
    'rejetee': translate("Rejetée"),
    'approuvee': translate("Approuvée"),
    'en_attente': translate("En attente"),
    'en_cours': translate("En cours")
  };

  const normalizedStatus = status.toLowerCase()
    .replace('é', 'e')
    .replace('ée', 'ee');
  
  const label = statusMap[normalizedStatus] || status;
  let color = 'bg-gray-500';

  if (normalizedStatus.includes('rejet')) {
    color = 'bg-red-500';
  } else if (normalizedStatus.includes('approuv')) {
    color = 'bg-green-500';
  } else if (normalizedStatus.includes('en_attente')) {
    color = 'bg-yellow-500';
  } else if (normalizedStatus.includes('en_cours')) {
    color = 'bg-blue-500';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} text-white ${className}`}>
      {label}
    </span>
  );
};

const DemandeDetail = ({ demande }: { demande: DemandeAchat }) => {
  const { translate } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {translate("Demande {reference}", { reference: demande.reference })}
          </h1>
          <StatusBadge status={demande.status} className="ml-4" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{translate("Informations générales")}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {translate("Référence")}
                </dt>
                <dd className="text-sm">{demande.reference}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {translate("Date de demande")}
                </dt>
                <dd className="text-sm">
                  {new Date(demande.dateDemande).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {translate("Nature")}
                </dt>
                <dd className="text-sm">{demande.natureDemande}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {translate("Département")}
                </dt>
                <dd className="text-sm">{demande.departement}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {translate("Quantité")}
                </dt>
                <dd className="text-sm">{demande.quantite}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{translate("Évaluation")}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {translate("Niveau d'urgence")}
                </dt>
                <dd className="text-sm capitalize">{demande.urgence}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {translate("Impact stratégique")}
                </dt>
                <dd className="text-sm capitalize">{demande.impactStrategique}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {translate("Statut")}
                </dt>
                <dd className="mt-1">
                  <StatusBadge status={demande.status} />
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {translate("Confidentiel")}
                </dt>
                <dd className="text-sm">
                  {demande.siConfidentiel ? translate("Oui") : translate("Non")}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{translate("Description et justification")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">
                {translate("Description")}
              </h3>
              <p className="mt-1 text-sm">{demande.description}</p>
            </div>
            <Separator />
            <div>
              <h3 className="text-sm font-medium">
                {translate("Justification")}
              </h3>
              <p className="mt-1 text-sm">{demande.justification}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {demande.pieceJustificative && (
        <Card>
          <CardHeader>
            <CardTitle>{translate("Pièce justificative")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <a
                href={demande.pieceJustificative}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                {translate("Voir le fichier joint")}
              </a>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const DemandeAchat = () => {
  const { id } = useParams();
  const { translate } = useLanguage();
  const [activeTab, setActiveTab] = useState("liste");
  const [demandes, setDemandes] = useState<DemandeAchat[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState<DemandeAchat | null>(null);

  const columns: ColumnDef<DemandeAchat>[] = [
    {
      accessorKey: "reference",
      header: translate("Référence"),
      cell: ({ row }) => (
        <Link 
          to={`/demande-achat/${row.original.reference}`} 
          className="font-medium hover:underline"
        >
          {row.original.reference}
        </Link>
      ),
    },
    {
      accessorKey: "natureDemande",
      header: translate("Nature"),
    },
    {
      accessorKey: "departement",
      header: translate("Département"),
    },
    {
      accessorKey: "quantite",
      header: translate("Quantité"),
      cell: ({ row }) => <span>{row.original.quantite}</span>,
    },
    {
      accessorKey: "urgence",
      header: translate("Urgence"),
      cell: ({ row }) => <span className="capitalize">{row.original.urgence}</span>,
    },
    {
      accessorKey: "status",
      header: translate("Statut"),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{translate("Actions")}</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to={`/demande-achat/${row.original.reference}`}>
                <Eye className="mr-2 h-4 w-4" />
                {translate("Voir les détails")}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  useEffect(() => {
    const fetchDemandes = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:8000/demandeAchat/demandes/");
        const demandesData = response.data.data.map((d: any) => ({
          _id: d.id,
          reference: d.reference,
          demandeur_id: d.demandeur_id,
          natureDemande: d.natureDemande,
          departement: d.departement,
          description: d.description,
          quantite: d.quantite,
          urgence: d.urgence,
          impactStrategique: d.impactStrategique,
          justification: d.justification,
          siConfidentiel: d.siConfidentiel,
          status: d.status,
          dateDemande: d.dateDemande,
          pieceJustificative: d.pieceJustificative
        }));
        setDemandes(demandesData);
      } catch (error) {
        toast.error(translate("Erreur lors du chargement des demandes"));
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const fetchDemandeDetails = async (ref: string) => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8000/demandeAchat/demandes/${ref}/`);
        const demandeDetails = {
          _id: response.data.demande.id,
          ...response.data.demande,
          status: response.data.demande.status
        };
        setSelectedDemande(demandeDetails);
      } catch (error) {
        toast.error(translate("Erreur lors du chargement de la demande"));
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDemandeDetails(id);
    } else {
      fetchDemandes();
    }
  }, [id, translate]);

  if (loading) {
    return <div className="flex justify-center py-8">{translate("Chargement...")}</div>;
  }

  if (id && selectedDemande) {
    return <DemandeDetail demande={selectedDemande} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {translate("Demandes d'achat")}
        </h1>
        <Button onClick={() => setActiveTab("nouvelle")}>
          {translate("Nouvelle demande")}
        </Button>
      </div>

      <Tabs defaultValue="liste" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="liste">
            {translate("Liste des demandes")}
          </TabsTrigger>
          <TabsTrigger value="nouvelle">
            {translate("Nouvelle demande")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="liste" className="space-y-4">
          <DataTable
            columns={columns}
            data={demandes}
            searchColumn="natureDemande"
            searchPlaceholder={translate("Rechercher une demande...")}
          />
        </TabsContent>
        <TabsContent value="nouvelle">
          <Card>
            <CardHeader>
              <CardTitle>{translate("Formulaire de demande d'achat")}</CardTitle>
              <CardDescription>
                {translate("Complétez ce formulaire pour soumettre une nouvelle demande d'achat.")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DemandeForm 
                onSuccess={() => {
                  setActiveTab("liste");
                  axios.get("http://localhost:8000/demandeAchat/demandes/")
                    .then(response => {
                      const demandesData = response.data.data.map((d: any) => ({
                        _id: d.id,
                        reference: d.reference,
                        demandeur_id: d.demandeur_id,
                        natureDemande: d.natureDemande,
                        departement: d.departement,
                        description: d.description,
                        quantite: d.quantite,
                        urgence: d.urgence,
                        impactStrategique: d.impactStrategique,
                        justification: d.justification,
                        siConfidentiel: d.siConfidentiel,
                        status: d.status,
                        dateDemande: d.dateDemande,
                        pieceJustificative: d.pieceJustificative
                      }));
                      setDemandes(demandesData);
                    })
                    .catch(error => {
                      console.error(translate("Erreur lors du rechargement des demandes:"), error);
                    });
                }} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DemandeAchat;