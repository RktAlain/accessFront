import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  UserCheck,
  X,
  Upload,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import api from "@/lib/api";

interface Devis {
  id: string;
  reference_devis: string;
  nom_departement: string;
  nom_fournisseur: string;
  reference_materiel: string;
  date_devis: string;
  nom_materiel: string;
  quantite: string;
  prix_unitaire: number;
  montant_total: number;
  status_devis: "envoyé" | "approuvé" | string;
  photo_signature?: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    envoyé: {
      display: "en attente", // Changement uniquement pour l'affichage
      bg: "bg-yellow-100",
      text: "text-yellow-800",
    },
    approuvé: {
      display: "approuvé",
      bg: "bg-green-100",
      text: "text-green-800",
    },
    default: {
      display: status,
      bg: "bg-gray-100",
      text: "text-gray-800",
    },
  };

  const { display, bg, text } =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.default;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bg} ${text}`}
    >
      {display}
    </span>
  );
};

const pendingColumns: ColumnDef<Devis>[] = [
  {
    accessorKey: "reference_devis",
    header: "Référence",
  },
  {
    accessorKey: "date_devis",
    header: "Date",
    cell: ({ row }) =>
      new Date(row.original.date_devis).toLocaleDateString("fr-FR"),
  },
  {
    accessorKey: "nom_departement",
    header: "Département",
  },
  {
    accessorKey: "nom_materiel",
    header: "Matériel",
  },
  {
    accessorKey: "montant_total",
    header: "Montant",
    cell: ({ row }) =>
      new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "MGA",
      }).format(row.original.montant_total),
  },
  {
    accessorKey: "status_devis",
    header: "Statut",
    cell: ({ row }) => <StatusBadge status={row.original.status_devis} />,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) =>
      row.original.status_devis === "envoyé" ? (
        <ValidationDialog devis={row.original} />
      ) : null,
  },
];

const processedColumns: ColumnDef<Devis>[] = [
  {
    accessorKey: "reference_devis",
    header: "Référence",
  },
  {
    accessorKey: "date_devis",
    header: "Date",
    cell: ({ row }) =>
      new Date(row.original.date_devis).toLocaleDateString("fr-FR"),
  },
  {
    accessorKey: "nom_departement",
    header: "Département",
  },
  {
    accessorKey: "nom_materiel",
    header: "Matériel",
  },
  {
    accessorKey: "qte_materiel",
    header: "Quantité",
  },
  {
    accessorKey: "montant_total",
    header: "Montant",
    cell: ({ row }) =>
      new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "MGA",
      }).format(row.original.montant_total),
  },
  {
    accessorKey: "status_devis",
    header: "Statut",
    cell: ({ row }) => <StatusBadge status={row.original.status_devis} />,
  },
];

const ValidationDialog = ({ devis }: { devis: Devis }) => {
  const [commentaire, setCommentaire] = useState("");
  const [open, setOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();

      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.resetTransform();
        ctx.scale(dpr, dpr);
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, rect.width, rect.height);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [open]);

  const getCanvasCoordinates = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handleStartDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCanvasCoordinates(e.nativeEvent);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e.nativeEvent);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleStopDrawing = () => {
    setIsDrawing(false);
    saveSignature();
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setSignatureData(canvas.toDataURL());
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.match("image.*")) {
      toast.error("Veuillez sélectionner une image valide");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const ratio = Math.min(
          canvas.width / img.width,
          canvas.height / img.height
        );
        ctx.drawImage(
          img,
          (canvas.width - img.width * ratio) / 2,
          (canvas.height - img.height * ratio) / 2,
          img.width * ratio,
          img.height * ratio
        );
        saveSignature();
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const approverDemandeAchat = async (reference_materiel: string) => {
    try {
      const references = reference_materiel.split(",").map((ref) => ref.trim());

      const response = await api.post(
        "/validationDemande/approverDemande/",
        {
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reference_materiel: references.join(","),
          }),
        }
      );

      if (!response) {
        const errorData = response.data;
        throw new Error(
          errorData.message || "Erreur lors de l'approbation des demandes"
        );
      }

      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'approbation des demandes:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!signatureData) {
      toast.error("Veuillez ajouter votre signature");
      return;
    }

    try {
      // 1. Mettre à jour la signature du devis
      const blob = await fetch(signatureData).then((res) => res.blob());
      const formData = new FormData();
      formData.append("photo_signature", blob, "signature.png");

      const updateResponse = await api.post(
        `/validationDemande/majPhotoDevis/${devis.id}/`,
        {
          body: formData,
        }
      );

      if (!updateResponse) {
        const errorData = await updateResponse.data;
        throw new Error(errorData.message || "Erreur lors de la mise à jour");
      }

      // 2. Mettre à jour les demandes associées
      await approverDemandeAchat(devis.reference_materiel);

      const budgetResponse = await api.put(
        "/budget/montantsApprouvesParDepartement/"
      );
      if (!budgetResponse) {
        throw new Error(
          "Erreur lors de la récupération des données budgétaires"
        );
      }

      toast.success(
        `Devis ${devis.reference_devis} approuvé avec succès et demandes mises à jour`
      );
      setOpen(false);

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Erreur lors de l'approbation:", error);
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="default"
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle2 className="h-4 w-4 mr-1" />
          Approuver
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Approuver le devis {devis.reference_devis}</DialogTitle>
          <DialogDescription>
            Veuillez signer dans la zone prévue ou uploader une image de
            signature
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Département
              </p>
              <p>{devis.nom_departement}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Fournisseur
              </p>
              <p>{devis.nom_fournisseur}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Matériel
              </p>
              <p>
                {devis.nom_materiel} (Ref: {devis.reference_materiel})
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Quantité
              </p>
              <p>
                {devis.quantite} ×{" "}
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "MGA",
                }).format(devis.prix_unitaire)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Montant total
            </p>
            <p className="font-bold">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "MGA",
              }).format(devis.montant_total)}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="commentaire" className="text-sm font-medium">
              Commentaire (optionnel)
            </label>
            <Textarea
              id="commentaire"
              placeholder="Ajouter un commentaire..."
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Signature <span className="text-red-500">*</span>
            </label>
            <div className="border rounded-md p-2">
              <canvas
                ref={canvasRef}
                onMouseDown={handleStartDrawing}
                onMouseMove={handleDrawing}
                onMouseUp={handleStopDrawing}
                onMouseLeave={handleStopDrawing}
                onTouchStart={handleStartDrawing}
                onTouchMove={handleDrawing}
                onTouchEnd={handleStopDrawing}
                className="w-full h-32 bg-white border cursor-crosshair touch-none"
              />
              <div className="flex justify-between mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Importer signature
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSignature}
                  className="text-destructive"
                >
                  <X className="h-4 w-4 mr-1" />
                  Effacer
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Signez dans la zone ci-dessus ou importez une image de signature
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!signatureData}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Confirmer l'approbation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ValidationDemandes = () => {
  const [selectedTab, setSelectedTab] = useState("pending");
  const [devis, setDevis] = useState<Devis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevis = async () => {
      try {
        const response = await api.get(
          "/validationDemande/listeValidations/"
        );
        if (!response) throw new Error("Erreur réseau");

        const data = response.data;

        if (data.status === "success") {
          setDevis(
            data.data.map((d: any) => ({
              ...d,
              status_devis: d.status_devis?.toLowerCase() || "inconnu",
            }))
          );
        } else {
          throw new Error(data.message || "Erreur inconnue");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        toast.error("Erreur lors du chargement des devis");
      } finally {
        setLoading(false);
      }
    };

    fetchDevis();
  }, []);

  // On garde le filtre sur 'envoyé' (valeur réelle du backend)
  const devisEnAttente = devis.filter((d) => d.status_devis === "envoyé");
  const devisTraites = devis.filter((d) => d.status_devis === "approuvé");

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Chargement en cours...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">Erreur: {error}</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Validation des devis
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">À valider</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devisEnAttente.length}</div>
            <p className="text-xs text-muted-foreground">
              Devis en attente de validation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approuvés</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devisTraites.length}</div>
            <p className="text-xs text-muted-foreground">
              Devis que vous avez approuvés
            </p>
            <div className="mt-2 text-xs text-green-600 flex items-center">
              <FileText className="h-3 w-3 mr-1" />
              Sur {devis.length} devis au total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Délégation</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Aucune</div>
            <p className="text-xs text-muted-foreground">
              Pas de délégation de validation active
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="pending">
            En attente{" "}
            <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
              {devisEnAttente.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="processed">Traités</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <DataTable
            columns={pendingColumns}
            data={devisEnAttente}
            searchColumn="nom_materiel"
            searchPlaceholder="Rechercher un devis..."
          />
        </TabsContent>

        <TabsContent value="processed" className="space-y-4">
          <DataTable
            columns={processedColumns}
            data={devisTraites}
            searchColumn="nom_materiel"
            searchPlaceholder="Rechercher un devis traité..."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ValidationDemandes;
