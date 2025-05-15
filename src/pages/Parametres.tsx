import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import PageHeader from "@/components/layout/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "../theme-context";
import { useLanguage } from "../language-context";

const Parametres = () => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  // Données utilisateur statiques
  const currentUser = {
    name: "Jean Dupont",
    email: "j.dupont@optimachats.com",
    role: "Administrateur",
    avatar: "/avatars/01.png",
    lastLogin: "2025-04-15T14:32:00",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader title="Paramètres" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Colonne gauche - Profil utilisateur */}
        <div className="space-y-6 h-full">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Votre Profil</CardTitle>
              <CardDescription>
                Informations personnelles et paramètres de compte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-lg font-medium">{currentUser.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentUser.email}
                  </p>
                  <Badge variant="outline" className="mt-2">
                    {currentUser.role}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom complet</Label>
                  <Input id="name" defaultValue={currentUser.name} />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={currentUser.email}
                    disabled
                  />
                </div>

                <div>
                  <Label htmlFor="password">Mot de passe</Label>
                  <Button variant="outline" className="w-full">
                    Changer le mot de passe
                  </Button>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <div className="text-sm">
                  <Label>Ajouté le :</Label>
                  <p className="text-muted-foreground">
                    {new Date(currentUser.lastLogin).toLocaleString("fr-FR")}
                  </p>
                </div>
                <div className="text-sm">
                  <Label>Dernière connexion :</Label>
                  <p className="text-muted-foreground">
                    {new Date(currentUser.lastLogin).toLocaleString("fr-FR")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite - Paramètres généraux */}
        <div className="lg:col-span-2 space-y-6 h-full">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Préférences</CardTitle>
              <CardDescription>
                Personnalisez votre expérience utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Apparence</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Thème</Label>
                    <p className="text-sm text-muted-foreground">
                      Choisissez entre thème clair ou sombre
                    </p>
                  </div>
                  <RadioGroup
                    value={theme}
                    onValueChange={(value: Theme) => setTheme(value)}
                    className="flex space-x-2"
                  >
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="light" id="light" />
                      <Label htmlFor="light">Clair</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="dark" id="dark" />
                      <Label htmlFor="dark">Sombre</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="system" id="system" />
                      <Label htmlFor="system">Système</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Langue</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Langue de l'interface</Label>
                    <p className="text-sm text-muted-foreground">
                      Choisissez votre langue préférée
                    </p>
                  </div>
                  <Select
                    value={language}
                    onValueChange={(value: Language) => setLanguage(value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="mg">Malagasy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notifications</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications sonores</Label>
                    <p className="text-sm text-muted-foreground">
                      Activer les sons pour les notifications
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Options avancées</h3>
                <Button variant="outline">Exporter mes données</Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Enregistrer les modifications</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Parametres;
