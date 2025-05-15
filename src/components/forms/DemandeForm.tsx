import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { toast } from "sonner";
import { useLanguage } from "@/language-context";
import api from "@/lib/api";

const formSchema = z.object({
  natureDemande: z.string().min(2, {
    message: "La nature de la demande est requise",
  }),
  departement: z.string().min(1, {
    message: "Le département est requis",
  }),
  description: z.string().min(5, {
    message: "La description doit contenir au moins 5 caractères",
  }),
  quantite: z.coerce.number().min(1, {
    message: "La quantité doit être d'au moins 1",
  }),
  urgence: z.enum(["faible", "moyenne", "elevee", "critique"], {
    required_error: "Le niveau d'urgence est requis",
  }),
  impactStrategique: z.enum(["faible", "moyen", "important", "critique"], {
    required_error: "L'impact stratégique est requis",
  }),
  justification: z.string().min(5, {
    message: "La justification doit contenir au moins 5 caractères",
  }),
  siConfidentiel: z.boolean().default(false),
  pieceJustificative: z.instanceof(File).optional(),
});

interface DemandeFormProps {
  onSuccess?: () => void;
}

export function DemandeForm({ onSuccess }: DemandeFormProps) {
  const { translate } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      natureDemande: "",
      departement: "",
      description: "",
      quantite: 1,
      urgence: "moyenne",
      impactStrategique: "moyen",
      justification: "",
      siConfidentiel: false,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const generateDemandeurId = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 4; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true);

    try {
      const formData = new FormData();
      const demandeurId = generateDemandeurId();
      formData.append("demandeur_id", demandeurId);

      Object.entries(values).forEach(([key, value]) => {
        if (key !== "pieceJustificative") {
          formData.append(key, String(value));
        }
      });

      if (file) {
        formData.append("pieceJustificative", file);
      }

      const response = await api.post("/demandeAchat/creer/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(translate("Demande créée avec succès"), {
        description: `${translate("Référence")}: ${response.data.reference}`,
      });

      form.reset();
      setFile(null);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(translate("Erreur lors de la création de la demande:"), error);
      toast.error(translate("Erreur lors de la création de la demande"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="natureDemande"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{translate("Nature de la demande")}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={translate("Nature de la demande")} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="departement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{translate("Département")}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={translate("Département")} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{translate("Description détaillée")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={translate("Décrivez en détail votre demande...")}
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="quantite"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{translate("Quantité")}</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="urgence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translate("Niveau d'urgence")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={translate("Sélectionner")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="faible">{translate("Faible")}</SelectItem>
                      <SelectItem value="moyenne">{translate("Moyenne")}</SelectItem>
                      <SelectItem value="elevee">{translate("Élevée")}</SelectItem>
                      <SelectItem value="critique">{translate("Critique")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="impactStrategique"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translate("Impact stratégique")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={translate("Sélectionner")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="faible">{translate("Faible")}</SelectItem>
                      <SelectItem value="moyen">{translate("Moyen")}</SelectItem>
                      <SelectItem value="important">{translate("Important")}</SelectItem>
                      <SelectItem value="critique">{translate("Critique")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="justification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{translate("Justification")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={translate("Pourquoi cet achat est-il nécessaire?")}
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="siConfidentiel"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{translate("Demande confidentielle")}</FormLabel>
                <FormDescription>
                  {translate("Cochez cette case si la demande contient des informations sensibles")}
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div>
          <FormLabel>
            {translate("Pièce justificative (optionnelle)")}
          </FormLabel>
          <Input 
            type="file" 
            onChange={handleFileChange} 
            className="mt-2" 
          />
          <FormDescription>
            {translate("Vous pouvez joindre un devis, une facture proforma ou tout autre document justificatif.")}
          </FormDescription>
        </div>

        <Separator />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              setFile(null);
            }}
          >
            {translate("Annuler")}
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving 
              ? translate("Envoi en cours...") 
              : translate("Soumettre la demande")}
          </Button>
        </div>
      </form>
    </Form>
  );
}