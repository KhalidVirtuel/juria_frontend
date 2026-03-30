// src/components/Knowledge/AddLegalDocumentDialog.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";

interface AddLegalDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; description: string; file: File }) => Promise<void>;
  uploading?: boolean;
}

const AddLegalDocumentDialogDocument: React.FC<AddLegalDocumentDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  uploading = false,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ name?: string; description?: string; file?: string }>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Vérifier que c'est un PDF
      if (selectedFile.type !== "application/pdf") {
        setErrors({ ...errors, file: "Seuls les fichiers PDF sont acceptés" });
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setErrors({ ...errors, file: undefined });
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "Le nom du document est requis";
    }

    if (!description.trim()) {
      newErrors.description = "La description est requise";
    }

    if (!file) {
      newErrors.file = "Veuillez sélectionner un fichier PDF";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        file: file!,
      });

      // Réinitialiser le formulaire
      setName("");
      setDescription("");
      setFile(null);
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting document:", error);
    }
  };

  const handleCancel = () => {
    setName("");
    setDescription("");
    setFile(null);
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Ajouter un document de lois
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nom du document */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nom du document <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ex: Modéle de Contrat de travail CDI"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={uploading}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Ex: Modéle de Contrat de travail CDI pour un employé à temps plein"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
              rows={3}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Upload fichier PDF */}
          <div className="space-y-2">
            <Label htmlFor="file">
              Fichier PDF <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={uploading}
                className={`flex-1 ${errors.file ? "border-red-500" : ""}`}
              />
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            {file && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <FileText className="h-4 w-4" />
                <span>{file.name}</span>
                <span className="text-muted-foreground">
                  ({(file.size / 1024 / 1024).toFixed(2)} Mo)
                </span>
              </div>
            )}
            {errors.file && (
              <p className="text-sm text-red-500">{errors.file}</p>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            * Champs obligatoires
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={uploading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={uploading}
            className="bg-primary hover:bg-primary/90"
          >
            {uploading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Upload en cours...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Ajouter le document
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddLegalDocumentDialogDocument;