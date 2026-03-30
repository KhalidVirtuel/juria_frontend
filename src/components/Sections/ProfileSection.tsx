import React from 'react';
import { ArrowLeft, User, Mail, Building2, Briefcase, Crown, Check, CreditCard, Bell, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

interface ProfileSectionProps {
  onBack: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ onBack }) => {
  const currentPlan = 'essential'; // 'essential' or 'pro'
    const { signOut } = useAuth();
  
  const plans = [
    {
      id: 'essential',
      name: 'Essential',
      price: '349',
      features: [
        'Conversations illimitées (usage raisonnable)',
        'Uploads de documents limités',
        'Toutes les fonctionnalités de base',
        'Support standard'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '499',
      features: [
        'Conversations illimitées',
        'Documents et dossiers illimités',
        'Mini-Word rédaction avancée',
        'Support prioritaire',
        'Réponses plus rapides'
      ],
      recommended: true
    }
  ];

  return (
    <div className="h-full bg-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-border z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Mon Profil</h1>
            <p className="text-sm text-muted-foreground">Gérez vos informations et votre abonnement</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Informations personnelles</CardTitle>
                <CardDescription>Vos informations de compte</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" placeholder="Votre prénom" defaultValue="Ahmed" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" placeholder="Votre nom" defaultValue="Benali" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="votre@email.com" defaultValue="ahmed.benali@cabinet.ma" className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lawFirm">Cabinet</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="lawFirm" placeholder="Nom du cabinet" defaultValue="Cabinet Benali & Associés" className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty">Spécialité</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="specialty" placeholder="Votre spécialité" defaultValue="Droit des affaires" className="pl-10" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button>Enregistrer les modifications</Button>
            </div>
          </CardContent>
        </Card>

        {/* Plan d'abonnement */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Crown className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Plan d'abonnement</CardTitle>
                <CardDescription>Votre plan actuel et options de mise à niveau</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-xl border-2 p-5 transition-all ${
                    currentPlan === plan.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {plan.recommended && (
                    <Badge className="absolute -top-2.5 right-4 bg-primary">Recommandé</Badge>
                  )}
                  {currentPlan === plan.id && (
                    <Badge variant="outline" className="absolute -top-2.5 left-4 border-primary text-primary">
                      Plan actuel
                    </Badge>
                  )}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">MAD/mois</span>
                    </div>
                  </div>
                  <ul className="space-y-2.5 mb-5">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={currentPlan === plan.id ? "outline" : "default"}
                    className="w-full"
                    disabled={currentPlan === plan.id}
                  >
                    {currentPlan === plan.id ? 'Plan actuel' : 'Passer à ce plan'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Facturation */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Facturation</CardTitle>
                <CardDescription>Gérez votre moyen de paiement</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">VISA</span>
                </div>
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-muted-foreground">Expire 12/26</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Modifier</Button>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Prochaine facturation</span>
              <span className="font-medium">17 janvier 2026</span>
            </div>
            <Button variant="outline" className="w-full">Voir l'historique des factures</Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Bell className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Notifications</CardTitle>
                <CardDescription>Gérez vos préférences de notification</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifications par email</p>
                <p className="text-sm text-muted-foreground">Recevez des résumés par email</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Rappels d'échéances</p>
                <p className="text-sm text-muted-foreground">Alertes pour vos deadlines</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Nouveautés produit</p>
                <p className="text-sm text-muted-foreground">Restez informé des nouvelles fonctionnalités</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Sécurité</CardTitle>
                <CardDescription>Protégez votre compte</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Changer le mot de passe
            </Button>
            <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive"  onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Se déconnecter
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSection;
