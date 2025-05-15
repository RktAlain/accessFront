import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import PageHeader from '@/components/layout/PageHeader';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Download,
  FileText,
  Search,
  ShoppingCart,
  ClipboardCheck,
  Truck,
  Box,
  CheckCircle,
  UserCheck,
  BarChart2,
  Settings,
  Users,
  CreditCard,
  Warehouse,
  Layers,
  AlertCircle,
  FileSpreadsheet,
  HelpCircle,
  Home
} from "lucide-react";
import { useLanguage } from "@/language-context";

const ProcessStep = ({ 
  step, 
  title, 
  description, 
  roles, 
  documents = [],
  isLast = false 
}: {
  step: number;
  title: string;
  description: string;
  roles: { name: string; icon: React.ReactNode }[];
  documents?: string[];
  isLast?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
    className="relative pb-8"
  >
    {!isLast && (
      <div className="absolute left-5 top-8 bottom-0 w-0.5 bg-gray-200"></div>
    )}
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
        {step}
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
        
        <div className="mt-2">
          <h4 className="text-sm font-medium text-muted-foreground">{useLanguage().translate("Acteurs")}:</h4>
          <div className="flex flex-wrap gap-2 mt-1">
            {roles.map((role, index) => (
              <span 
                key={index} 
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs"
              >
                {role.icon}
                {role.name}
              </span>
            ))}
          </div>
        </div>

        {documents.length > 0 && (
          <div className="mt-2">
            <h4 className="text-sm font-medium text-muted-foreground">{useLanguage().translate("Documents")}:</h4>
            <div className="flex flex-wrap gap-2 mt-1">
              {documents.map((doc, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs"
                >
                  <FileText className="h-3 w-3" />
                  {doc}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

const RoleCard = ({ 
  icon, 
  title, 
  description, 
  responsibilities 
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  responsibilities: string[];
}) => {
  const { translate } = useLanguage();
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full">
        <CardHeader className="flex flex-row items-start gap-4 pb-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <h4 className="text-sm font-medium mb-2">{translate("Responsabilités")}:</h4>
          <ul className="space-y-2 text-sm">
            {responsibilities.map((item, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Documentation = () => {
  const { translate } = useLanguage();

  const processSteps = [
    {
      step: 1,
      title: translate("Demande de matériel"),
      description: translate("Le collaborateur initie une demande d'achat via le portail dédié"),
      roles: [
        { name: translate("Demandeur"), icon: <UserCheck className="h-3 w-3" /> },
        { name: translate("Manager"), icon: <Users className="h-3 w-3" /> }
      ],
      documents: [translate("Formulaire de demande")]
    },
    {
      step: 2,
      title: translate("Validation hiérarchique"),
      description: translate("Approval par le manager selon les besoins et le budget"),
      roles: [
        { name: translate("Manager"), icon: <Users className="h-3 w-3" /> },
        { name: translate("Direction"), icon: <BarChart2 className="h-3 w-3" /> }
      ]
    },
    {
      step: 3,
      title: translate("Analyse financière"),
      description: translate("Vérification de la disponibilité budgétaire"),
      roles: [
        { name: translate("Finance"), icon: <CreditCard className="h-3 w-3" /> },
        { name: translate("Contrôle"), icon: <FileSpreadsheet className="h-3 w-3" /> }
      ],
      documents: [translate("Avis financier")]
    },
    {
      step: 4,
      title: translate("Traitement achats"),
      description: translate("Sélection fournisseur et négociation"),
      roles: [
        { name: translate("Acheteur"), icon: <ShoppingCart className="h-3 w-3" /> },
        { name: translate("Responsable"), icon: <ClipboardCheck className="h-3 w-3" /> }
      ],
      documents: [translate("Bon de commande")]
    },
    {
      step: 5,
      title: translate("Validation DG"),
      description: translate("Pour les achats stratégiques ou importants"),
      roles: [
        { name: translate("Direction"), icon: <Settings className="h-3 w-3" /> }
      ],
      documents: [translate("Approbation DG")]
    },
    {
      step: 6,
      title: translate("Réception"),
      description: translate("Contrôle qualité et conformité"),
      roles: [
        { name: translate("Logistique"), icon: <Warehouse className="h-3 w-3" /> },
        { name: translate("Qualité"), icon: <CheckCircle className="h-3 w-3" /> }
      ],
      documents: [translate("Bon de livraison")]
    },
    {
      step: 7,
      title: translate("Paiement"),
      description: translate("Traitement comptable et règlement"),
      roles: [
        { name: translate("Comptabilité"), icon: <CreditCard className="h-3 w-3" /> }
      ],
      documents: [translate("Facture"), translate("Paiement")],
      isLast: true
    }
  ];

  const rolesData = [
    {
      icon: <UserCheck className="h-5 w-5" />,
      title: translate("Demandeur"),
      description: translate("Collaborateur à l'origine du besoin"),
      responsibilities: [
        translate("Saisie de la demande complète"),
        translate("Fourniture des spécifications"),
        translate("Justification du besoin"),
        translate("Suivi du processus")
      ]
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: translate("Manager"),
      description: translate("Responsable hiérarchique"),
      responsibilities: [
        translate("Validation opérationnelle"),
        translate("Vérification budgétaire"),
        translate("Priorisation des demandes"),
        translate("Délégation si absent")
      ]
    },
    {
      icon: <ShoppingCart className="h-5 w-5" />,
      title: translate("Service Achats"),
      description: translate("Gestion des fournisseurs"),
      responsibilities: [
        translate("Comparaison des offres"),
        translate("Négociation commerciale"),
        translate("Émission des commandes"),
        translate("Suivi des livraisons")
      ]
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      title: translate("Finance"),
      description: translate("Gestion des budgets"),
      responsibilities: [
        translate("Contrôle des budgets"),
        translate("Analyse financière"),
        translate("Validation des paiements"),
        translate("Reporting comptable")
      ]
    },
    {
      icon: <Warehouse className="h-5 w-5" />,
      title: translate("Logistique"),
      description: translate("Gestion des stocks"),
      responsibilities: [
        translate("Réception des marchandises"),
        translate("Contrôle qualité"),
        translate("Gestion des retours"),
        translate("Mise à jour des stocks")
      ]
    },
    {
      icon: <Settings className="h-5 w-5" />,
      title: translate("Direction"),
      description: translate("Validation stratégique"),
      responsibilities: [
        translate("Approbation des gros achats"),
        translate("Décision stratégique"),
        translate("Supervision globale"),
        translate("Analyse des performances")
      ]
    }
  ];

  const validationRules = [
    {
      amount: translate("Moins de 1 000MGA"),
      approvers: translate("Manager"),
      delay: translate("24h"),
      exceptions: translate("Aucune")
    },
    {
      amount: translate("1 000MGA à 5 000MGA"),
      approvers: translate("Manager + Finances"),
      delay: translate("48h"),
      exceptions: translate("Urgences médicales")
    },
    {
      amount: translate("5 000MGA à 20 000MGA"),
      approvers: translate("Manager + Finances + Direction"),
      delay: translate("72h"),
      exceptions: translate("Maintenance critique")
    },
    {
      amount: translate("Plus de 20 000MGA"),
      approvers: translate("Comité d'achat + DG"),
      delay: translate("1 semaine"),
      exceptions: translate("Appel d'offres obligatoire")
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={translate("Processus d'Achat Entreprise")}>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          {translate("Télécharger le guide")}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={translate("Rechercher...")} className="pl-10" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-180px)]">
              <div className="p-4 space-y-1">
                <Button variant="ghost" className="w-full justify-start">
                  <Home className="mr-2 h-4 w-4" />
                  {translate("Vue d'ensemble")}
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  {translate("Processus complet")}
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  {translate("Rôles et responsabilités")}
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  {translate("Circuit de validation")}
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <CreditCard className="mr-2 h-4 w-4" />
                  {translate("Gestion financière")}
                </Button>
                <Separator className="my-2" />
                <Button variant="ghost" className="w-full justify-start">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  {translate("Cas particuliers")}
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  {translate("FAQ")}
                </Button>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{translate("Processus d'Achat")}</CardTitle>
              <CardDescription>
                {translate("Workflow complet de la demande à la réception")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="process">
                <TabsList className="mb-6">
                  <TabsTrigger value="process">{translate("Processus")}</TabsTrigger>
                  <TabsTrigger value="roles">{translate("Acteurs")}</TabsTrigger>
                  <TabsTrigger value="validation">{translate("Validation")}</TabsTrigger>
                  <TabsTrigger value="finance">{translate("Finance")}</TabsTrigger>
                </TabsList>

                <TabsContent value="process">
                  <div className="space-y-2 pl-2">
                    {processSteps.map((step) => (
                      <ProcessStep 
                        key={step.step} 
                        {...step} 
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="roles">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rolesData.map((role, index) => (
                      <RoleCard key={index} {...role} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="validation">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold">{translate("Règles de validation")}</h3>
                      <p className="text-muted-foreground text-sm">
                        {translate("Les seuils de validation sont déterminés par le montant de l'achat")}
                      </p>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-secondary">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-secondary-foreground">
                              {translate("Montant")}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-secondary-foreground">
                              {translate("Valideurs requis")}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-secondary-foreground">
                              {translate("Délai moyen")}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-secondary-foreground">
                              {translate("Exceptions")}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {validationRules.map((rule, index) => (
                            <tr key={index} className={index % 2 === 0 ? "bg-background" : "bg-secondary/50"}>
                              <td className="px-4 py-3 text-sm">{rule.amount}</td>
                              <td className="px-4 py-3 text-sm">{rule.approvers}</td>
                              <td className="px-4 py-3 text-sm">{rule.delay}</td>
                              <td className="px-4 py-3 text-sm">{rule.exceptions}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="finance">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold">{translate("Gestion financière")}</h3>
                      <p className="text-muted-foreground text-sm">
                        {translate("Processus budgétaire et comptable lié aux achats")}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                            {translate("Engagements budgétaires")}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            <li className="flex items-start">
                              <div className="flex-shrink-0 h-5 w-5 text-green-500 mr-2">
                                <CheckCircle className="h-full w-full" />
                              </div>
                              <span className="text-sm">
                                {translate("Les budgets sont réservés dès la validation de la demande")}
                              </span>
                            </li>
                            <li className="flex items-start">
                              <div className="flex-shrink-0 h-5 w-5 text-green-500 mr-2">
                                <CheckCircle className="h-full w-full" />
                              </div>
                              <span className="text-sm">
                                {translate("Alertes automatiques en cas de dépassement")}
                              </span>
                            </li>
                            <li className="flex items-start">
                              <div className="flex-shrink-0 h-5 w-5 text-green-500 mr-2">
                                <CheckCircle className="h-full w-full" />
                              </div>
                              <span className="text-sm">
                                {translate("Suivi mensuel par centre de coût")}
                              </span>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <FileSpreadsheet className="h-5 w-5 text-green-600" />
                            {translate("Processus de paiement")}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            <li className="flex items-start">
                              <div className="flex-shrink-0 h-5 w-5 text-green-500 mr-2">
                                <CheckCircle className="h-full w-full" />
                              </div>
                              <span className="text-sm">
                                {translate("Paiement sous 30 jours après réception conforme")}
                              </span>
                            </li>
                            <li className="flex items-start">
                              <div className="flex-shrink-0 h-5 w-5 text-green-500 mr-2">
                                <CheckCircle className="h-full w-full" />
                              </div>
                              <span className="text-sm">
                                {translate("Triple validation (réception, achat, finance)")}
                              </span>
                            </li>
                            <li className="flex items-start">
                              <div className="flex-shrink-0 h-5 w-5 text-green-500 mr-2">
                                <CheckCircle className="h-full w-full" />
                              </div>
                              <span className="text-sm">
                                {translate("Archivage numérique des pièces justificatives")}
                              </span>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Documentation;