import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import PageHeader from "@/components/layout/PageHeader";
import {
  Download,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  X,
  Camera,
  Upload,
} from "lucide-react";
import Webcam from "react-webcam";
import { useLanguage } from "@/language-context";

interface Facture {
  _id: string;
  Num_Facture: string;
  Date_facture: string;
  Fournisseur: string;
  Matériel: string;
  Département: string;
  Montant: number;
}

const Factures = () => {
  const { translate } = useLanguage();
  
  // États pour la gestion des factures
  const [searchTerm, setSearchTerm] = useState("");
  const [departementFilter, setDepartementFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour le formulaire de nouvelle facture
  const [newFacture, setNewFacture] = useState<Facture>({
    _id: "",
    Num_Facture: "",
    Date_facture: new Date().toISOString().split("T")[0],
    Fournisseur: "",
    Matériel: "",
    Département: "Informatique",
    Montant: 0,
  });

  // États pour le scan de facture
  const [showScanModal, setShowScanModal] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clé API OCR.Space
  const OCR_API_KEY = "K87927957088957";

  // Charger les factures depuis l'API
  useEffect(() => {
    const fetchFactures = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/facture/listeFactures/"
        );
        if (!response.ok) {
          throw new Error(translate("Erreur lors du chargement des factures"));
        }
        const data = await response.json();
        setFactures(data.data);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : translate("Une erreur inconnue est survenue")
        );
        setLoading(false);
      }
    };

    fetchFactures();
  }, [translate]);

  // Filtrer les factures selon les critères de recherche
  const filteredFactures = factures.filter((facture) => {
    const matchesSearch =
      facture.Num_Facture.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facture.Fournisseur.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facture.Matériel.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartement =
      departementFilter === "all" || facture.Département === departementFilter;

    return matchesSearch && matchesDepartement;
  });

  // Gestion du modal de création de facture
  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleModalOpen = () => {
    setShowModal(true);
  };

  // Gestion des changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewFacture({
      ...newFacture,
      [name]: name === "Montant" ? parseFloat(value) || 0 : value,
    });
  };

  // Soumission du formulaire de facture
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Créez un nouvel objet sans l'ID temporaire pour l'envoi au serveur
      const { _id, ...factureToSend } = newFacture;

      const response = await fetch(
        "http://localhost:8000/facture/ajouterFactures/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(factureToSend),
        }
      );

      if (!response.ok) {
        throw new Error(translate("Erreur lors de l'ajout de la facture"));
      }

      const result = await response.json();

      setFactures([
        ...factures,
        {
          ...newFacture,
          _id: result.id || result._id, // Utilisez l'ID retourné par le serveur
        },
      ]);

      handleModalClose();

      setNewFacture({
        _id: "",
        Num_Facture: "",
        Date_facture: new Date().toISOString().split("T")[0],
        Fournisseur: "",
        Matériel: "",
        Département: "Informatique",
        Montant: 0,
      });
    } catch (err) {
      console.error("Erreur:", err);
      setError(
        err instanceof Error
          ? err.message
          : translate("Une erreur est survenue lors de l'ajout")
      );
    }
  };

  // Compression d'image pour respecter la limite de taille
  const compressImage = async (
    base64Data: string,
    maxSizeMB = 1
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Data;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        let quality = 0.9;

        const sizeInMB = (width * height * 3) / (1024 * 1024);
        if (sizeInMB <= maxSizeMB) {
          resolve(base64Data);
          return;
        }

        const ratio = Math.sqrt(maxSizeMB / sizeInMB);
        width *= ratio;
        height *= ratio;

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      img.onerror = () => resolve(base64Data);
    });
  };

  // Traitement OCR avec OCR.Space
  const processScannedImage = async (image: string) => {
    setUploading(true);

    try {
      // Vérifier et compresser l'image si nécessaire
      let base64Image = image;
      if (!image.startsWith("data:")) {
        base64Image = `data:image/jpeg;base64,${image}`;
      }

      // Calculer la taille approximative
      const base64Length = base64Image.length - (base64Image.indexOf(",") + 1);
      const sizeInBytes = 4 * Math.ceil(base64Length / 3) * 0.5624896334383812;
      const sizeInMB = sizeInBytes / (1024 * 1024);

      if (sizeInMB > 1) {
        base64Image = await compressImage(base64Image);
      }

      const formData = new FormData();
      formData.append("base64Image", base64Image);
      formData.append("language", "fre");
      formData.append("isOverlayRequired", "false");
      formData.append("filetype", "jpg");
      formData.append("OCREngine", "2");

      const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        headers: {
          apikey: OCR_API_KEY,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (result.IsErroredOnProcessing) {
        throw new Error(result.ErrorMessage || "Erreur lors du traitement OCR");
      }

      const extractedText = result.ParsedResults?.[0]?.ParsedText;
      if (!extractedText) {
        throw new Error("Aucun texte trouvé dans l'image");
      }

      const extractedData = extractInvoiceData(extractedText);
      setNewFacture(extractedData);
    } catch (err) {
      console.error("Erreur OCR:", err);
      setError(
        `Erreur OCR: ${err instanceof Error ? err.message : "Erreur inconnue"}`
      );
    } finally {
      setUploading(false);
    }
  };

  // Extraction des données de la facture
  const extractInvoiceData = (text: string): Facture => {
    // Nettoyage du texte
    const cleanedText = text.replace(/\r\n/g, "\n").replace(/\s+/g, " ");

    // Extraction avec des regex améliorés
    const invoiceNumber =
      extractWithRegex(cleanedText, [
        /Num[_]?Facture\s*(\w+)/i,
        /Facture\s*N[°o]?\s*(\w+)/i,
      ]) || "";

    const dateMatch = extractWithRegex(cleanedText, [
      /Date[_]?Facture\s*(\d{4}-\d{2}-\d{2})/i,
      /(\d{2}[\/\-]\d{2}[\/\-]\d{4})/,
    ]);

    const supplier =
      extractWithRegex(cleanedText, [
        /Fournisseur\s*(.+?)(?:\n|$)/i,
        /Supplier\s*(.+?)(?:\n|$)/i,
      ]) || "";

    const materialMatch = cleanedText.match(/Matériel\s*(.+?)(?:\n|$)/i);
    const material = materialMatch ? materialMatch[1].trim() : "";

    const amountMatch = cleanedText.match(/Total\s+\$?\s*([\d\.,]+)/i);
    const amount = amountMatch
      ? parseFloat(amountMatch[1].replace(/\./g, "").replace(",", "."))
      : 0;

    return {
      _id: `temp-${Date.now()}`, // ID temporaire unique
      Num_Facture: invoiceNumber,
      Date_facture: dateMatch || new Date().toISOString().split("T")[0],
      Fournisseur: supplier,
      Matériel: material,
      Département: "Maintenance",
      Montant: amount,
    };
  };

  const extractWithRegex = (
    text: string,
    patterns: RegExp[]
  ): string | null => {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null;
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return new Date().toISOString().split("T")[0];

    if (dateString.includes("/")) {
      const [day, month, year] = dateString.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    if (dateString.includes("-")) {
      const [day, month, year] = dateString.split("-");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    return dateString;
  };

  // Capture d'image depuis la caméra
  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setImageSrc(imageSrc);
        processScannedImage(imageSrc);
      }
    }
  };

  // Upload d'image depuis le système de fichiers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const image = event.target?.result as string;
        setImageSrc(image);
        processScannedImage(image);
      };
      reader.readAsDataURL(file);
    }
  };

  // Gestion du modal de scan
  const handleOpenScanModal = () => {
    setShowScanModal(true);
  };

  const handleCloseScanModal = () => {
    setShowScanModal(false);
    setImageSrc(null);
    setCameraActive(false);
    setUploading(false);
  };

  // Activer/désactiver la caméra
  const toggleCamera = () => {
    setCameraActive(!cameraActive);
  };

  // Retour à l'interface de sélection
  const resetScanInterface = () => {
    setImageSrc(null);
    setCameraActive(false);
    setUploading(false);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <p>{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-2 bg-red-600 hover:bg-red-700"
        >
          {translate("Réessayer")}
        </Button>
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader title={translate("Gestion des Factures")}>
        <Button onClick={handleModalOpen} className="gap-2">
          <Plus className="h-4 w-4" />
          {translate("Nouvelle Facture")}
        </Button>
      </PageHeader>

      {/* Modal de création de facture */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {translate("Créer une nouvelle facture")}
                </h2>
                <button
                  onClick={handleOpenScanModal}
                  className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 transition-colors p-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  title={translate("Scanner une facture")}
                >
                  <Camera className="h-5 w-5" />
                </button>
              </div>
              <button
                onClick={handleModalClose}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="Num_Facture"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      {translate("Numéro de facture")}
                    </label>
                    <Input
                      type="text"
                      name="Num_Facture"
                      value={newFacture.Num_Facture}
                      onChange={handleChange}
                      placeholder="FAC-2023-001"
                      className="w-full"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="Date_facture"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      {translate("Date de facture")}
                    </label>
                    <Input
                      type="date"
                      name="Date_facture"
                      value={newFacture.Date_facture}
                      onChange={handleChange}
                      className="w-full"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="Fournisseur"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      {translate("Fournisseur")}
                    </label>
                    <Input
                      type="text"
                      name="Fournisseur"
                      value={newFacture.Fournisseur}
                      onChange={handleChange}
                      placeholder={translate("Nom du fournisseur")}
                      className="w-full"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="Matériel"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      {translate("Matériel")}
                    </label>
                    <Input
                      type="text"
                      name="Matériel"
                      value={newFacture.Matériel}
                      onChange={handleChange}
                      placeholder={translate("Description du matériel")}
                      className="w-full"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="Département"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      {translate("Département")}
                    </label>
                    <Input
                      type="text"
                      name="Département"
                      value={newFacture.Département}
                      onChange={handleChange}
                      placeholder={translate("Entrez le département")}
                      className="w-full"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="Montant"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      {translate("Montant (MGA)")}
                    </label>
                    <Input
                      type="number"
                      name="Montant"
                      value={newFacture.Montant}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleModalClose}
                  className="px-6"
                >
                  {translate("Annuler")}
                </Button>
                <Button
                  type="submit"
                  className="px-6 bg-blue-600 hover:bg-blue-700"
                >
                  {translate("Enregistrer la facture")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de scan de facture */}
      <Dialog open={showScanModal} onOpenChange={setShowScanModal}>
        <DialogContent className="sm:max-w-[625px]" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              {translate("Scanner une facture")}
            </DialogTitle>
            <DialogDescription id="scan-description">
              {translate("Prenez une photo ou importez une image de facture (max 1MB) pour extraction automatique des informations")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {imageSrc ? (
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <img
                    src={imageSrc}
                    alt={translate("Facture scannée")}
                    className="max-h-80 rounded-md border"
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center flex-col">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                      <span className="mt-2 text-white">
                        {translate("Analyse en cours...")}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {uploading
                    ? translate("Analyse OCR en cours...")
                    : translate("Facture analysée avec succès!")}
                </p>
              </div>
            ) : cameraActive ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-full h-64 border rounded-md overflow-hidden">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      facingMode: "environment",
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-4">
                  <Button onClick={toggleCamera} variant="outline">
                    {translate("Changer de caméra")}
                  </Button>
                  <Button onClick={captureImage} className="gap-2">
                    <Camera className="h-4 w-4" />
                    {translate("Prendre une photo")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 py-8">
                <Button
                  onClick={toggleCamera}
                  variant="outline"
                  className="gap-2"
                >
                  <Camera className="h-4 w-4" />
                  {translate("Prendre une photo")}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      {translate("Ou")}
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                      <Upload className="h-4 w-4" />
                      {translate("Uploader une image")}
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      ref={fileInputRef}
                    />
                  </label>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {translate("Formats supportés: JPG, PNG (max 1MB)")}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              {imageSrc ? (
                <>
                  <Button variant="outline" onClick={resetScanInterface}>
                    {translate("Nouveau scan")}
                  </Button>
                  {!uploading && (
                    <Button
                      onClick={() => {
                        handleCloseScanModal();
                        setShowModal(true);
                      }}
                    >
                      {translate("Utiliser les données scannées")}
                    </Button>
                  )}
                </>
              ) : (
                <Button variant="outline" onClick={handleCloseScanModal}>
                  {translate("Annuler")}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Liste des factures */}
      <Card>
        <CardHeader>
          <CardTitle>{translate("Factures matériels")}</CardTitle>
          <CardDescription>
            {translate("Gérez toutes les factures liées aux achats de matériels.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={translate("Rechercher une facture...")}
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4 flex-col sm:flex-row">
              <Select
                value={departementFilter}
                onValueChange={setDepartementFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={translate("Tous les départements")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{translate("Tous les départements")}</SelectItem>
                  <SelectItem value="Informatique">{translate("Informatique")}</SelectItem>
                  <SelectItem value="Marketing">{translate("Marketing")}</SelectItem>
                  <SelectItem value="Direction">{translate("Direction")}</SelectItem>
                  <SelectItem value="Logistique">{translate("Logistique")}</SelectItem>
                  <SelectItem value="Finance">{translate("Finance")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{translate("N° Facture")}</TableHead>
                  <TableHead>{translate("Date")}</TableHead>
                  <TableHead>{translate("Fournisseur")}</TableHead>
                  <TableHead>{translate("Matériel")}</TableHead>
                  <TableHead>{translate("Département")}</TableHead>
                  <TableHead>{translate("Montant")}</TableHead>
                  <TableHead className="text-right">{translate("Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFactures.length > 0 ? (
                  filteredFactures.map((facture) => (
                    <TableRow key={`facture-${facture._id}`}>
                      <TableCell className="font-medium">
                        {facture.Num_Facture}
                      </TableCell>
                      <TableCell>
                        {new Date(facture.Date_facture).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{facture.Fournisseur}</TableCell>
                      <TableCell>{facture.Matériel}</TableCell>
                      <TableCell>{facture.Département}</TableCell>
                      <TableCell>
                        {facture.Montant.toLocaleString(undefined, {
                          style: "currency",
                          currency: "MGA",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{translate("Actions")}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              {translate("Voir les détails")}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              {translate("Télécharger PDF")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              {translate("Supprimer")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {translate("Aucune facture trouvée")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Factures;