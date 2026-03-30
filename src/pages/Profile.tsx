import React, { useEffect, useState } from 'react';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName]   = useState(user?.lastName || '');
  const [lawFirm, setLawFirm]     = useState(user?.lawFirm || '');
  const [legalSpecialty, setLegalSpecialty] = useState(user?.legalSpecialty || '');
  const [language, setLanguage]   = useState<string>('fr');

  const [saving, setSaving] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const pref = await authAPI.getPreferences();
        setLanguage(pref.preferences.language || 'fr');
      } catch {}
    })();
  }, []);

  const saveProfile = async () => {
    alert(firstName)
    try {
      setSaving(true);
      const { user: updated } = await authAPI.updateProfile({
        firstName, lastName, lawFirm, legalSpecialty,
      });
      // met à jour le localStorage pour cohérence
      localStorage.setItem('user', JSON.stringify(updated));
      toast({ title: 'Profil mis à jour', description: 'Vos informations ont été enregistrées.' });
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.response?.data?.error || 'Impossible de mettre à jour le profil', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async () => {
    try {
      const { preferences } = await authAPI.updatePreferences({ language });
      localStorage.setItem('lang', preferences.language);
      toast({ title: 'Préférences', description: 'Langue sauvegardée.' });
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.response?.data?.error || 'Impossible de sauvegarder la langue', variant: 'destructive' });
    }
  };

  const changePassword = async () => {
    try {
      setSavingPwd(true);
      await authAPI.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      toast({ title: 'Mot de passe', description: 'Mot de passe changé avec succès.' });
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.response?.data?.error || 'Impossible de changer le mot de passe', variant: 'destructive' });
    } finally {
      setSavingPwd(false);
    }
  };

  if (!user) return <div className="p-6">Non connecté.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Mon profil</h1>

      <section className="space-y-4 rounded-xl border p-4">
        <h2 className="font-medium">Informations personnelles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Prénom</Label>
            <Input value={firstName} onChange={e => setFirstName(e.target.value)} />
          </div>
          <div>
            <Label>Nom</Label>
            <Input value={lastName} onChange={e => setLastName(e.target.value)} />
          </div>
          <div>
            <Label>Cabinet</Label>
            <Input value={lawFirm} onChange={e => setLawFirm(e.target.value)} />
          </div>
          <div>
            <Label>Spécialité</Label>
            <Input value={legalSpecialty} onChange={e => setLegalSpecialty(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={saveProfile} disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Button>
          <Button variant="secondary" onClick={signOut}>Se déconnecter</Button>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border p-4">
        <h2 className="font-medium">Préférences</h2>
        <div className="max-w-xs">
          <Label>Langue</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger><SelectValue placeholder="Choisir la langue" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ar">العربية</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={savePreferences}>Sauvegarder</Button>
      </section>

      <section className="space-y-4 rounded-xl border p-4">
        <h2 className="font-medium">Sécurité</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Mot de passe actuel</Label>
            <Input type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} />
          </div>
          <div>
            <Label>Nouveau mot de passe</Label>
            <Input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} />
          </div>
        </div>
        <Button onClick={changePassword} disabled={savingPwd}>
          {savingPwd ? 'Changement…' : 'Changer le mot de passe'}
        </Button>
      </section>
    </div>
  );
};

export default Profile;
