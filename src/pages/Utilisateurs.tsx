import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Plus, Search, UserPlus, X } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";

interface User {
  id: string;
  nom: string;
  email: string;
  role: string;
  departement: string;
  statut: string;
  date_ajout: string;
  date_derniere_connexion: string | null;
}

const Utilisateurs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [newUser, setNewUser] = useState({
    nom: "",
    email: "",
    role: "",
    departement: "",
    mdp: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Récupérer la liste des utilisateurs
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(
        "/utilisateur/afficher_tous/"
      );
      if (!response) {
        throw new Error("Erreur lors de la récupération des utilisateurs");
      }
      const data = await response.data;
      setUsers(data.data);
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesDepartment =
      departmentFilter === "all" || user.departement === departmentFilter;

    return matchesSearch && matchesRole && matchesDepartment;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));

    if (name === "mdp" && passwordError) {
      setPasswordError("");
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const validatePassword = () => {
    if (newUser.mdp.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères");
      return false;
    }
    if (newUser.mdp !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return false;
    }
    setPasswordError("");
    return true;
  };

  // Ajouter un nouvel utilisateur
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    try {
      const response = await fetch(
        "/utilisateur/ajouter/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newUser),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors de l'ajout de l'utilisateur"
        );
      }

      toast({
        title: "Succès",
        description: "Utilisateur ajouté avec succès",
      });

      setIsAddUserModalOpen(false);
      setNewUser({
        nom: "",
        email: "",
        role: "",
        departement: "",
        mdp: "",
      });
      setConfirmPassword("");
      fetchUsers(); // Rafraîchir la liste
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  // Activer/Désactiver un utilisateur
  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const isActive = currentStatus === "actif";
      const endpoint = `/utilisateur/${
        isActive ? "desactiver" : "activer"
      }/${userId}/`;
  
      const response = await fetch(endpoint, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error(
          `Erreur lors de la ${isActive ? "désactivation" : "activation"}`
        );
      }

      toast({
        title: "Succès",
        description: `Utilisateur ${
          isActive ? "désactivé" : "activé"
        } avec succès`,
      });

      fetchUsers(); // Rafraîchir la liste
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "Jamais";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader title="Gestion des Utilisateurs">
        <Button onClick={() => setIsAddUserModalOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Nouvel Utilisateur
        </Button>
      </PageHeader>

      <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Ajouter un nouvel utilisateur
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations ci-dessous pour créer un nouveau
              compte utilisateur.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom complet *</Label>
                <Input
                  id="nom"
                  name="nom"
                  placeholder="Jean Dupont"
                  value={newUser.nom}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="jean.dupont@example.com"
                  value={newUser.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mdp">Mot de passe *</Label>
                <Input
                  id="mdp"
                  name="mdp"
                  type="password"
                  placeholder="••••••••"
                  value={newUser.mdp}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  Le mot de passe doit contenir au moins 8 caractères.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirmer le mot de passe *
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
            </div>

            {passwordError && (
              <div className="text-sm text-destructive">{passwordError}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Rôle *</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => handleSelectChange("role", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Directeur">Directeur</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Acheteur">Demandeur</SelectItem>
                    <SelectItem value="Logistique">Logistique</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Administrateur">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="departement">Département *</Label>
                <Select
                  value={newUser.departement}
                  onValueChange={(value) =>
                    handleSelectChange("departement", value)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un département" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Direction">Direction</SelectItem>
                    <SelectItem value="Direction">Informatique</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Achats">Marketing</SelectItem>
                    <SelectItem value="Logistique">Logistique</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                Créer l'utilisateur
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs</CardTitle>
          <CardDescription>
            Gérez les comptes utilisateurs, les rôles et les permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher un utilisateur..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4 flex-col sm:flex-row">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tous les rôles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Rôle</SelectItem>
                  <SelectItem value="Direction">Direction</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Achats">Marketing</SelectItem>
                  <SelectItem value="Logistique">Logistique</SelectItem>
                  <SelectItem value="IT">Informatique</SelectItem>
                  <SelectItem value="IT">Demandeur</SelectItem>
                  <SelectItem value="Administrateur">Administrateur</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tous les départements" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Départements</SelectItem>
                  <SelectItem value="Direction">Direction</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Achats">Achats</SelectItem>
                  <SelectItem value="Logistique">Logistique</SelectItem>
                  <SelectItem value="Logistique">Marketing</SelectItem>
                  <SelectItem value="IT">Informatique</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Département</TableHead>
                  <TableHead>Date d'ajout</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernière connexion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow key="loading">
                    <TableCell colSpan={6} className="text-center">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow key="no-users">
                    <TableCell colSpan={6} className="text-center">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const uniqueKey =
                      user.id || `fallback-${user.email}-${user.date_ajout}`;
                    return (
                      <TableRow key={uniqueKey}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {user.nom
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.nom}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>{user.departement}</TableCell>
                        <TableCell>{formatDate(user.date_ajout)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Switch
                              checked={user.statut === "actif"}
                              onCheckedChange={() =>
                                toggleUserStatus(user.id, user.statut)
                              }
                            />
                            <span className="ml-2">
                              {user.statut === "actif" ? "Actif" : "Inactif"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDateTime(user.date_derniere_connexion)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Utilisateurs;
