
import React, { useEffect, useState } from 'react';
import { Bell, ChevronDown, Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '@/lib/api';


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AuthService } from '@/lib/authService';

const Navbar = () => {
  const navigate = useNavigate();
  // const [utilisateurData, setUtilisateurData] = useState<{ nom: string; email: string; role: string } | null>(null);

  // const user = JSON.parse(localStorage.getItem('user'));
  // useEffect(() => {
    
  //   if (!user) {
  //     navigate('/login');
  //     return;
  //   }

  //   const fetchUserData = async () => {
  //     try {
  //       const response = await api.get(`/utilisateur/afficher/${user.id}/`);
  //       setUtilisateurData(response.data);
  //     } catch (error) {
  //       console.error('Erreur de chargement:', error);
  //       navigate('/login');
  //     }
  //   };

  //   fetchUserData();
  // }, []);

  const deconnexion = () => {
    AuthService.logout();
    navigate('/login', {
      state: null,
      replace:true
    })
  };
  return (
    <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-4 w-full max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="search"
            placeholder="Rechercher..."
            className="pl-10 bg-secondary"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  G
                </div>
                {/* <span className="hidden md:inline-block">{user?.email}</span> */}
                <ChevronDown className="h-4 w-4" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Paramètres</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={deconnexion}
            >
              <span>Se déconnecter</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Navbar;
