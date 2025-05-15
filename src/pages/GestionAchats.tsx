import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle2,
  Plus,
  Trash2,
  XCircle,
  Download,
  ArrowRight,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import api from "@/lib/api";

const departments = [
  "Informatique",
  "Finance",
  "Marketing",
  "Direction Générale",
  "Logistique",
];

interface Materiel {
  nom: string;
  quantite: number;
  prixUnitaire: number;
  prixTotal: number;
  referenceDemande: string;
}

interface Devis {
  _id: string;
  reference_devis: string;
  date_devis: string;
  nom_departement: string;
  nom_fournisseur: string;
  materiels: Materiel[];
  prix_unitaire: number;
  montant_total: number;
  status_devis: "envoyé" | "rejeté" | "approuvé";
  photo_signature?: string;
}

const DevisPDFContent = React.forwardRef<HTMLDivElement, { devis: Devis | null, budgetDisponible: Record<string, number> }>(
  ({ devis, budgetDisponible }, ref) => {
    if (!devis) return null;

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "MGA",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    return (
      <div ref={ref} className="p-6 bg-white text-gray-900">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Détails du devis {devis.reference_devis}</h1>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="text-gray-900">{devis.date_devis}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Département</p>
            <p className="text-gray-900">{devis.nom_departement}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fournisseur</p>
            <p className="text-gray-900">{devis.nom_fournisseur}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Statut</p>
            <div className="inline-flex items-center">
              {devis.status_devis === "rejeté" ? (
                <span className="inline-flex items-center bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  <XCircle className="h-4 w-4 mr-1" />
                  {devis.status_devis}
                </span>
              ) : devis.status_devis === "envoyé" ? (
                <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  <ArrowRight className="h-4 w-4 mr-1" />
                  {devis.status_devis}
                </span>
              ) : (
                <span className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  {devis.status_devis}
                </span>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Budget disponible</p>
            <p className="text-gray-900">
              {formatCurrency(budgetDisponible[devis.nom_departement] || 0)}
            </p>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Achat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix unitaire</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {devis.materiels.map((materiel, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{materiel.referenceDemande}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{materiel.nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{materiel.quantite}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(materiel.prixUnitaire)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(materiel.prixTotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={4} className="px-6 py-4 text-right text-sm font-medium text-gray-900">Total</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{formatCurrency(devis.montant_total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {devis.status_devis === "rejeté" && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-800 font-medium">Motif de rejet:</p>
            <p className="text-red-700">
              Dépassement du budget disponible (
              {formatCurrency(budgetDisponible[devis.nom_departement] || 0)})
            </p>
          </div>
        )}

        {devis.photo_signature && (
          <div className="mt-8">
            <p className="text-sm text-gray-500 mb-2">Signature</p>
            <div className="relative inline-flex">
              <img
                src={devis.photo_signature}
                alt="Signature du devis"
                className="h-24 rounded-lg bg-transparent"
              />
              <div className="absolute -inset-4 flex items-center justify-center pointer-events-none">
                <div className="relative">
                  <svg width="120" height="120" viewBox="0 0 120 120" className="absolute text-red-600">
                    <circle cx="60" cy="60" r="58" fill="none" stroke="currentColor" strokeWidth="3" />
                  </svg>
                  <svg width="120" height="120" viewBox="0 0 120 120" className="text-red-600">
                    <defs>
                      <path id="circlePath" d="M60,15 a45,45 0 1,1 0,90 a45,45 0 1,1 0,-90" />
                    </defs>
                    <circle cx="60" cy="60" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" opacity="0.7" />
                    <text fontSize="9" fontWeight="bold" fontFamily="Arial" fill="currentColor" letterSpacing="1.5">
                      <textPath href="#circlePath">• G-RTX • ACCESS-HUB-BANQUE • DEVHUB-2025 •</textPath>
                    </text>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-red-600 font-bold text-lg">VALIDÉ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-xs text-gray-500">
          <p>Document généré le {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    );
  }
);

const GestionAchats = () => {
  const [demandesReferences, setDemandesReferences] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    fournisseur: "",
    departement: "",
    demandeur: "Jean Dupont",
  });
  const [materiels, setMateriels] = useState<Materiel[]>([
    {
      nom: "",
      quantite: 1,
      prixUnitaire: 0,
      prixTotal: 0,
      referenceDemande: "",
    },
  ]);
  const [devisList, setDevisList] = useState<Devis[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingReferences, setLoadingReferences] = useState(false);
  const [budgetDisponible, setBudgetDisponible] = useState<
    Record<string, number>
  >({});
  const [pdfDevis, setPdfDevis] = useState<Devis | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  const generatePDF = () => {
    if (!pdfDevis) {
      toast.error("Aucun devis sélectionné pour le PDF");
      return;
    }
  
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) {
      toast.error("Impossible d'ouvrir la fenêtre d'impression. Vérifiez votre bloqueur de popups.");
      return;
    }
  
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Devis ${pdfDevis.reference_devis}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { size: A4; margin: 1cm; }
            @media print {
              body { -webkit-print-color-adjust: exact; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body class="bg-white">
    `);
  
    const content = pdfRef.current?.cloneNode(true) as HTMLElement;
    if (content) {
      // Ajouter les classes Tailwind manquantes pour l'impression
      content.querySelectorAll('.bg-gray-50').forEach(el => {
        el.classList.add('bg-gray-50');
      });
      content.querySelectorAll('.bg-red-50').forEach(el => {
        el.classList.add('bg-red-50');
      });
      content.querySelectorAll('.bg-green-100').forEach(el => {
        el.classList.add('bg-green-100');
      });
      content.querySelectorAll('.bg-blue-100').forEach(el => {
        el.classList.add('bg-blue-100');
      });
      content.querySelectorAll('.bg-red-100').forEach(el => {
        el.classList.add('bg-red-100');
      });
      
      printWindow.document.write(content.innerHTML);
    }
  
    printWindow.document.write(`
        </body>
      </html>
    `);
  
    printWindow.document.close();
  
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  };

  const getAvailableReferences = (currentIndex: number) => {
    const selectedReferences = materiels
      .filter((_, index) => index !== currentIndex)
      .map((m) => m.referenceDemande)
      .filter((ref) => ref !== "");

    return demandesReferences.filter(
      (ref) => !selectedReferences.includes(ref)
    );
  };

  const fetchDetailsDemande = async (reference: string) => {
    try {
      const response = await api.get(
        `/achatDevis/detailsDemande/${reference}/`
      );
      if (!response)
        throw new Error("Erreur lors de la récupération des détails");

      const data = response.data;
      if (data.status === "success") {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement des détails de la demande");
      return null;
    }
  };

  const fetchDevis = async () => {
    setLoading(true);
    try {
      const [devisResponse, budgetsResponse] = await Promise.all([
        api.get("/achatDevis/listeDevis/"),
        api.get("/budget/budgetsDisponiblesParDepartement/"),
      ]);

      if (!devisResponse)
        throw new Error("Erreur lors de la récupération des devis");

      const devisData = devisResponse.data;
      const budgetsData = budgetsResponse.data;

      if (budgetsData.status === "success") {
        const newBudgetDisponible = budgetsData.data.reduce(
          (acc: Record<string, number>, curr: any) => {
            acc[curr.departement] = curr.budget_disponible;
            return acc;
          },
          {}
        );
        setBudgetDisponible(newBudgetDisponible);
      }

      if (devisData.status === "success") {
        const formattedDevis = devisData.data.map((devis: any) => {
          const noms = devis.nom_materiel?.split(", ") || [];
          const quantites = devis.quantite?.split(", ").map(Number) || [];
          const prixUnitaires =
            devis.prix_unitaire?.split(", ").map(Number) || [];
          const refs = devis.reference_materiel?.split(", ") || [];

          const materiels = noms.map((nom: string, i: number) => ({
            nom: nom.trim(),
            quantite: quantites[i] || 0,
            prixUnitaire: prixUnitaires[i] || 0,
            prixTotal: (quantites[i] || 0) * (prixUnitaires[i] || 0),
            referenceDemande: refs[i] || "",
          }));

          return {
            _id: devis.id,
            reference_devis: devis.reference_devis,
            date_devis: devis.date_devis,
            nom_departement: devis.nom_departement,
            nom_fournisseur: devis.nom_fournisseur,
            materiels,
            montant_total: devis.montant_total,
            status_devis: devis.status_devis,
            photo_signature: devis.photo_signature
              ? `data:image/jpeg;base64,${devis.photo_signature}`
              : undefined,
          };
        });

        setDevisList(formattedDevis);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des devis");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgetDisponible = async (departement: string) => {
    try {
      const response = await api.get(
        `/budget/budgetsDisponiblesParDepartement/`
      );
      if (!response)
        throw new Error("Erreur lors de la récupération des budgets");

      const data = response.data;
      if (data.status === "success") {
        const budgetDepartement = data.data.find(
          (b: any) => b.departement === departement
        );
        return budgetDepartement?.budget_disponible || 0;
      }
      return 0;
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement du budget disponible");
      return 0;
    }
  };

  const handleSelectChange = async (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "departement") {
      setLoadingReferences(true);
      try {
        const referencesResponse = await api.get(
          `/achatDevis/demandesParDepartement/${value}/`
        );

        if (!referencesResponse)
          throw new Error("Erreur lors de la récupération des demandes");

        const referencesData = referencesResponse.data;

        if (referencesData.status === "success") {
          setDemandesReferences(referencesData.references);
        }

        const budgetDisponible = await fetchBudgetDisponible(value);
        setBudgetDisponible((prev) => ({
          ...prev,
          [value]: budgetDisponible,
        }));
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors du chargement des données du département");
        setDemandesReferences([]);
      } finally {
        setLoadingReferences(false);
      }
    }
  };

  useEffect(() => {
    fetchDevis();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "MGA",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMaterielChange = async (
    index: number,
    field: keyof Materiel,
    value: string | number
  ) => {
    const newMateriels = [...materiels];

    if (field === "referenceDemande" && typeof value === "string") {
      const details = await fetchDetailsDemande(value);
      if (details) {
        newMateriels[index] = {
          ...newMateriels[index],
          referenceDemande: value,
          nom: details.natureDemande || "",
          quantite: details.quantite || 1,
          prixTotal: (details.quantite || 1) * newMateriels[index].prixUnitaire,
        };
      } else {
        newMateriels[index] = {
          ...newMateriels[index],
          [field]: value,
        };
      }
    } else {
      newMateriels[index] = {
        ...newMateriels[index],
        [field]: value,
      };
    }

    if (field === "quantite" || field === "prixUnitaire") {
      newMateriels[index].prixTotal =
        Number(newMateriels[index].quantite) *
        Number(newMateriels[index].prixUnitaire);
    }

    setMateriels(newMateriels);
  };

  const addMateriel = () => {
    setMateriels([
      ...materiels,
      {
        nom: "",
        quantite: 1,
        prixUnitaire: 0,
        prixTotal: 0,
        referenceDemande: "",
      },
    ]);
  };

  const removeMateriel = (index: number) => {
    if (materiels.length > 1) {
      const newMateriels = [...materiels];
      newMateriels.splice(index, 1);
      setMateriels(newMateriels);
    }
  };

  const calculateTotal = () => {
    return materiels.reduce((sum, item) => sum + item.prixTotal, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    for (const materiel of materiels) {
      if (!materiel.referenceDemande) {
        toast.error(
          "Veuillez sélectionner une référence de demande pour chaque matériel"
        );
        return;
      }
    }

    if (!formData.fournisseur || !formData.departement) {
      toast.error(
        "Veuillez saisir un fournisseur et sélectionner un département"
      );
      return;
    }

    for (const materiel of materiels) {
      if (!materiel.nom || materiel.prixUnitaire <= 0) {
        toast.error("Veuillez remplir tous les champs des matériels");
        return;
      }
    }

    const total = calculateTotal();
    const budgetDisponibleDepartement =
      budgetDisponible[formData.departement] || 0;
    const statut = total > budgetDisponibleDepartement ? "rejeté" : "envoyé";

    const formDataToSend = new FormData();

    formDataToSend.append(
      "reference_devis",
      `DEV-${Date.now().toString().slice(-6)}`
    );
    formDataToSend.append("nom_departement", formData.departement);
    formDataToSend.append("nom_fournisseur", formData.fournisseur);
    formDataToSend.append(
      "reference_materiel",
      materiels.map((m) => m.referenceDemande).join(", ")
    );
    formDataToSend.append("date_devis", new Date().toISOString().split("T")[0]);
    formDataToSend.append(
      "nom_materiel",
      materiels.map((m) => m.nom).join(", ")
    );
    formDataToSend.append(
      "quantite",
      materiels.map((m) => m.quantite.toString()).join(", ")
    );
    formDataToSend.append(
      "prix_unitaire",
      materiels.map((m) => m.prixUnitaire.toString()).join(", ")
    );
    formDataToSend.append("montant_total", total.toString());
    formDataToSend.append("status_devis", statut);

    try {
      const response = await api.post(
        "/achatDevis/ajouterDevis/",
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      if (!response) {
        const errorData = await response.data.catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors de l'enregistrement du devis"
        );
      }

      const result = await response.data;

      const newDevis: Devis = {
        _id: result.id,
        reference_devis: `DEV-${Date.now().toString().slice(-6)}`,
        date_devis: new Date().toISOString().split("T")[0],
        nom_departement: formData.departement,
        nom_fournisseur: formData.fournisseur,
        materiels: [...materiels],
        prix_unitaire: materiels[0]?.prixUnitaire || 0,
        montant_total: total,
        status_devis: statut,
      };

      setDevisList([newDevis, ...devisList]);
      setPdfDevis(newDevis);

      setFormData({
        fournisseur: "",
        departement: "",
        demandeur: "Jean Dupont",
      });
      setMateriels([
        {
          nom: "",
          quantite: 1,
          prixUnitaire: 0,
          prixTotal: 0,
          referenceDemande: "",
        },
      ]);

      const motifMessage =
        statut === "rejeté"
          ? `Dépassement du budget disponible (${formatCurrency(
              budgetDisponibleDepartement
            )})`
          : undefined;

      toast[statut === "rejeté" ? "error" : "success"](
        statut === "rejeté"
          ? "Devis rejeté (dépassement budget)"
          : "Devis envoyé avec succès",
        {
          description:
            statut === "rejeté"
              ? motifMessage
              : "Le devis a été transmis pour traitement",
        }
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'enregistrement du devis"
      );
      console.error(error);
    }
  };

  const devisColumns: ColumnDef<Devis>[] = [
    { accessorKey: "reference_devis", header: "Référence" },
    { accessorKey: "date_devis", header: "Date" },
    { accessorKey: "nom_departement", header: "Département" },
    { accessorKey: "nom_fournisseur", header: "Fournisseur" },
    {
      accessorKey: "prix_unitaire",
      header: "Prix unitaire",
      cell: ({ row }) => formatCurrency(row.original.materiels[0].prixUnitaire),
    },
    {
      accessorKey: "montant_total",
      header: "Montant total",
      cell: ({ row }) => formatCurrency(row.original.montant_total),
    },
    {
      accessorKey: "status_devis",
      header: "Statut",
      cell: ({ row }) => {
        const devis = row.original;

        let variant: "destructive" | "default" | "outline" | "secondary" =
          "default";
        let icon = null;
        let className = "";

        if (devis.status_devis === "rejeté") {
          variant = "destructive";
          icon = <XCircle className="h-4 w-4 mr-1" />;
        } else if (devis.status_devis === "envoyé") {
          variant = "default";
          icon = <ArrowRight className="h-4 w-4 mr-1" />;
        } else if (devis.status_devis === "approuvé") {
          variant = "outline";
          className = "bg-green-50 text-green-600 border-green-200";
          icon = <CheckCircle2 className="h-4 w-4 mr-1" />;
        }

        return (
          <div className="flex flex-col">
            <Badge variant={variant} className={className}>
              {icon}
              {devis.status_devis}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const devis = row.original;
        const budgetDisponibleDepartement =
          budgetDisponible[devis.nom_departement] || 0;

        return (
          <div className="flex space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>
                    Détails du devis {devis.reference_devis}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p>{devis.date_devis}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Département
                      </p>
                      <p>{devis.nom_departement}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Fournisseur
                      </p>
                      <p>{devis.nom_fournisseur}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Statut</p>
                      <Badge
                        variant={
                          devis.status_devis === "rejeté"
                            ? "destructive"
                            : devis.status_devis === "envoyé"
                            ? "default"
                            : "outline"
                        }
                        className={
                          devis.status_devis === "approuvé"
                            ? "bg-green-50 text-green-600 border-green-200"
                            : ""
                        }
                      >
                        {devis.status_devis === "rejeté" ? (
                          <XCircle className="h-4 w-4 mr-1" />
                        ) : devis.status_devis === "envoyé" ? (
                          <ArrowRight className="h-4 w-4 mr-1" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                        )}
                        {devis.status_devis}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Matériels
                    </p>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Référence
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Achat
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quantité
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Prix unitaire
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {devis.materiels.map((materiel, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 whitespace-nowrap">
                                {materiel.referenceDemande}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                {materiel.nom}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                {materiel.quantite}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                {formatCurrency(materiel.prixUnitaire)}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                {formatCurrency(materiel.prixTotal)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-lg font-medium">
                      Montant total: {formatCurrency(devis.montant_total)}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPdfDevis(devis);
                        setTimeout(generatePDF, 100);
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger PDF
                    </Button>
                  </div>

                  {devis.status_devis === "rejeté" && (
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-red-600 font-medium">
                        Motif de rejet:
                      </p>
                      <p>
                        Dépassement du budget disponible (
                        {formatCurrency(budgetDisponibleDepartement)})
                      </p>
                    </div>
                  )}

                  {devis.photo_signature && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        Signature
                      </p>
                      <div className="relative inline-flex">
                        <img
                          src={devis.photo_signature}
                          alt="Signature du devis"
                          className="h-24 rounded-lg bg-transparent"
                        />
                        <div className="absolute -inset-4 flex items-center justify-center pointer-events-none">
                          <div className="relative">
                            <svg
                              width="120"
                              height="120"
                              viewBox="0 0 120 120"
                              className="absolute text-red-600"
                            >
                              <circle
                                cx="60"
                                cy="60"
                                r="58"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                              />
                            </svg>
                            <svg
                              width="120"
                              height="120"
                              viewBox="0 0 120 120"
                              className="text-red-600"
                            >
                              <defs>
                                <path
                                  id="circlePath"
                                  d="M60,15 a45,45 0 1,1 0,90 a45,45 0 1,1 0,-90"
                                />
                              </defs>
                              <circle
                                cx="60"
                                cy="60"
                                r="40"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1"
                                strokeDasharray="2,2"
                                opacity="0.7"
                              />
                              <text
                                fontSize="9"
                                fontWeight="bold"
                                fontFamily="Arial"
                                fill="currentColor"
                                letterSpacing="1.5"
                              >
                                <textPath href="#circlePath">
                                  • G-RTX • ACCESS-HUB-BANQUE • DEVHUB-2025 •
                                </textPath>
                              </text>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-red-600 font-bold text-lg">
                                VALIDÉ
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast.info(`Détails du devis ${devis.reference_devis}`, {
                  description: (
                    <div className="space-y-2 mt-2">
                      <p>
                        <strong>Département:</strong> {devis.nom_departement}
                      </p>
                      <p>
                        <strong>Fournisseur:</strong> {devis.nom_fournisseur}
                      </p>
                      <div className="mt-3">
                        <p className="font-medium">Matériels:</p>
                        <ul className="list-disc pl-5">
                          {devis.materiels.map((m, i) => (
                            <li key={i}>
                              <strong>Réf:</strong> {m.referenceDemande} -{" "}
                              {m.nom} -{m.quantite}x{" "}
                              {formatCurrency(m.prixUnitaire)} ={" "}
                              {formatCurrency(m.prixTotal)}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p className="font-medium">
                        Total: {formatCurrency(devis.montant_total)}
                      </p>
                      {devis.status_devis === "rejeté" && (
                        <p className="text-red-600">
                          <strong>Motif:</strong> Dépassement du budget
                          disponible (
                          {formatCurrency(budgetDisponibleDepartement)})
                        </p>
                      )}
                    </div>
                  ),
                });
              }}
            >
              Détails
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Gestion des achats
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nouveau devis</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departement">Département</Label>
                  <Select
                    value={formData.departement}
                    onValueChange={(value) =>
                      handleSelectChange("departement", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un département" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fournisseur">Fournisseur</Label>
                  <Input
                    id="fournisseur"
                    name="fournisseur"
                    value={formData.fournisseur}
                    onChange={handleInputChange}
                    placeholder="Nom du fournisseur"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Matériels</Label>

                <div className="grid grid-cols-12 gap-2 items-center font-medium text-sm text-muted-foreground pb-2 border-b">
                  <div className="col-span-2">Réf Dmd</div>
                  <div className="col-span-3">Matériel</div>
                  <div className="col-span-2 ">Qte</div>
                  <div className="col-span-2">P.U</div>
                  <div className="col-span-3">Total</div>
                  <div className="col-span-1"></div>
                </div>

                <div className="space-y-3">
                  {materiels.map((materiel, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 items-end"
                    >
                      <div className="col-span-2">
                        <Select
                          value={materiel.referenceDemande}
                          onValueChange={async (value) => {
                            await handleMaterielChange(
                              index,
                              "referenceDemande",
                              value
                            );
                          }}
                          disabled={loadingReferences}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                loadingReferences
                                  ? "Chargement..."
                                  : "Sélectionnez une référence"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {loadingReferences ? (
                              <SelectItem value="loading" disabled>
                                Chargement...
                              </SelectItem>
                            ) : getAvailableReferences(index).length > 0 ? (
                              getAvailableReferences(index).map((ref) => (
                                <SelectItem key={ref} value={ref}>
                                  {ref}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-ref" disabled>
                                {formData.departement
                                  ? "Aucune demande disponible"
                                  : "Sélectionnez un département"}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        <Input
                          placeholder="Nom du matériel"
                          value={materiel.nom}
                          onChange={(e) =>
                            handleMaterielChange(index, "nom", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="1"
                          value={materiel.quantite}
                          onChange={(e) =>
                            handleMaterielChange(
                              index,
                              "quantite",
                              parseInt(e.target.value) || 0
                            )
                          }
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="0"
                          step="1000"
                          value={materiel.prixUnitaire}
                          onChange={(e) =>
                            handleMaterielChange(
                              index,
                              "prixUnitaire",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          required
                        />
                      </div>
                      <div className="col-span-3 h-10 flex items-center px-3 border rounded-md text-sm">
                        {formatCurrency(materiel.prixTotal)}
                      </div>
                      <div className="col-span-1">
                        {materiels.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeMateriel(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={addMateriel}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un matériel
                </Button>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-lg font-medium">
                  Total: {formatCurrency(calculateTotal())}
                </div>
                <Button type="submit">Enregistrer</Button>
              </div>

              {formData.departement && (
                <div className="text-sm text-muted-foreground">
                  Budget disponible:{" "}
                  {formatCurrency(budgetDisponible[formData.departement] || 0)}
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historique des devis</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <p>Chargement des devis...</p>
              </div>
            ) : (
              <DataTable
                columns={devisColumns}
                data={devisList}
                searchPlaceholder="Rechercher un devis..."
                emptyMessage="Aucun devis enregistré"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Composant caché pour le PDF */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <DevisPDFContent ref={pdfRef} devis={pdfDevis} budgetDisponible={budgetDisponible} />
      </div>
    </div>
  );
};

export default GestionAchats;