import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Lock, User, Eye, EyeOff, Clock, CheckCircle2, AlertCircle, X } from 'lucide-react';

type Tab = 'login' | 'waitlist';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  // Login state
  const [email, setEmail] = useState('demo@juria.local');
  const [password, setPassword] = useState('demo123');

  // Waitlist state
  const [waitlistFirstName, setWaitlistFirstName] = useState('');
  const [waitlistLastName, setWaitlistLastName] = useState('');
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/app');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur Mezin AI",
      });

      document.location.href = '/app';
    } catch (error: any) {
      setErrorModal("Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.waitlist({
        firstName: waitlistFirstName,
        lastName: waitlistLastName,
        email: waitlistEmail,
      });

      setWaitlistSubmitted(true);
      toast({
        title: "Inscription enregistrée !",
        description: "Nous vous contacterons dès que Mezin AI sera disponible.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const tabClass = (tab: Tab) =>
    `pb-3 px-1 font-medium transition-colors relative ${
      activeTab === tab
        ? 'text-mezin-ciel border-b-4 border-[#0187DA]'
        : 'text-gray-400 hover:text-mezin'
    }`;

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Form */}
      <div className="flex-1 flex justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-mezin mb-2">
              Mezin
              <span className="ml-2 text-2xl text-mezin-ciel">AI</span>
            </h1>
            <p className="text-mezin text-sm">
              Votre assistant juridique intelligent
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-gray-200">
            <button onClick={() => setActiveTab('login')} className={tabClass('login')}>
              Connexion
            </button>
            {/* Inscription désactivée — utiliser la liste d'attente */}
            {/*
            <button onClick={() => setActiveTab('signup')} className={tabClass('signup')}>
              Inscription
            </button>
            */}
            <button onClick={() => setActiveTab('waitlist')} className={tabClass('waitlist')}>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Liste d'attente
              </span>
            </button>
          </div>

          {/* ── Connexion ── */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-mezin text-sm mb-2 block">
                  Adresse email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-11 border-gray-300 focus:border-[#0187DA] focus:ring-[#0187DA]"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-mezin text-sm mb-2 block">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10 h-11 border-gray-300 focus:border-[#0187DA] focus:ring-[#0187DA]"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-[#0187DA] focus:ring-[#0187DA]" />
                  <span className="text-mezin">Se souvenir de moi</span>
                </label>
                <button type="button" className="text-[#0187DA] hover:text-[#0187DA]/80 font-medium">
                  Mot de passe oublié ?
                </button>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-mezin-ciel hover:bg-mezin text-white font-medium text-base"
              >
                {loading ? "Chargement..." : "Se connecter"}
              </Button>
            </form>
          )}

          {/* ── Bloc Inscription (commenté / désactivé) ── */}
          {/*
          {activeTab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-5" action="#">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-mezin text-sm mb-2 block">Prénom</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input id="firstName" type="text" value={firstName}
                      onChange={(e) => setFirstName(e.target.value)} required
                      className="pl-10 h-11 border-gray-300" placeholder="Jean" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-mezin text-sm mb-2 block">Nom</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input id="lastName" type="text" value={lastName}
                      onChange={(e) => setLastName(e.target.value)} required
                      className="pl-10 h-11 border-gray-300" placeholder="Dupont" />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="lawFirm" className="text-mezin text-sm mb-2 block">
                  Cabinet d'avocat <span className="text-gray-400 font-normal">(optionnel)</span>
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input id="lawFirm" type="text" value={lawFirm}
                    onChange={(e) => setLawFirm(e.target.value)}
                    className="pl-10 h-11 border-gray-300" placeholder="Cabinet Dupont & Associés" />
                </div>
              </div>
              <div>
                <Label htmlFor="specialty" className="text-mezin text-sm mb-2 block">Spécialité juridique</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
                  <Select value={specialty} onValueChange={setSpecialty}>
                    <SelectTrigger className="pl-10 h-11 border-gray-300">
                      <SelectValue placeholder="Sélectionnez une spécialité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="droit_civil">Droit Civil</SelectItem>
                      <SelectItem value="droit_penal">Droit Pénal</SelectItem>
                      <SelectItem value="droit_commercial">Droit Commercial</SelectItem>
                      <SelectItem value="droit_travail">Droit du Travail</SelectItem>
                      <SelectItem value="droit_famille">Droit de la Famille</SelectItem>
                      <SelectItem value="droit_immobilier">Droit Immobilier</SelectItem>
                      <SelectItem value="droit_administratif">Droit Administratif</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="signupEmail" className="text-mezin text-sm mb-2 block">Adresse email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input id="signupEmail" type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)} required
                    className="pl-10 h-11 border-gray-300" placeholder="votre@email.com" />
                </div>
              </div>
              <div>
                <Label htmlFor="signupPassword" className="text-mezin text-sm mb-2 block">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input id="signupPassword" type={showPassword ? 'text' : 'password'} value={password}
                    onChange={(e) => setPassword(e.target.value)} required
                    className="pl-10 pr-10 h-11 border-gray-300" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading}
                className="w-full h-11 bg-mezin-ciel hover:bg-mezin text-white font-medium text-base">
                {loading ? "Chargement..." : "Créer mon compte"}
              </Button>
              <p className="mt-2 text-xs text-mezin text-center">
                En vous inscrivant, vous acceptez nos{' '}
                <a href="#" className="text-[#0187DA] hover:underline">Conditions d'utilisation</a>
                {' '}et notre{' '}
                <a href="#" className="text-[#0187DA] hover:underline">Politique de confidentialité</a>
              </p>
            </form>
          )}
          */}

          {/* ── Liste d'attente ── */}
          {activeTab === 'waitlist' && (
            <>
              {waitlistSubmitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                  <CheckCircle2 className="w-14 h-14 text-[#0187DA]" />
                  <h2 className="text-xl font-semibold text-mezin">Vous êtes sur la liste !</h2>
                  <p className="text-gray-500 text-sm max-w-xs">
                    Merci <strong>{waitlistFirstName}</strong>. Nous vous enverrons un email à{' '}
                    <strong>{waitlistEmail}</strong> dès que l'accès sera disponible.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleWaitlist} className="space-y-5">
                  <p className="text-sm text-gray-500 -mt-2">
                    Mezin AI est actuellement en accès limité. Inscrivez-vous pour être notifié en priorité.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="wFirstName" className="text-mezin text-sm mb-2 block">
                        Prénom
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="wFirstName"
                          type="text"
                          value={waitlistFirstName}
                          onChange={(e) => setWaitlistFirstName(e.target.value)}
                          required
                          className="pl-10 h-11 border-gray-300 focus:border-[#0187DA] focus:ring-[#0187DA]"
                          placeholder="Jean"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="wLastName" className="text-mezin text-sm mb-2 block">
                        Nom
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="wLastName"
                          type="text"
                          value={waitlistLastName}
                          onChange={(e) => setWaitlistLastName(e.target.value)}
                          required
                          className="pl-10 h-11 border-gray-300 focus:border-[#0187DA] focus:ring-[#0187DA]"
                          placeholder="Dupont"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="wEmail" className="text-mezin text-sm mb-2 block">
                      Adresse email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="wEmail"
                        type="email"
                        value={waitlistEmail}
                        onChange={(e) => setWaitlistEmail(e.target.value)}
                        required
                        className="pl-10 h-11 border-gray-300 focus:border-[#0187DA] focus:ring-[#0187DA]"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-mezin-ciel hover:bg-mezin text-white font-medium text-base"
                  >
                    {loading ? "Enregistrement..." : "Rejoindre la liste d'attente"}
                  </Button>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Side - Image/Illustration */}
      <div
        className="hidden lg:flex flex-1 bg-mezin items-end justify-center m-4 relative overflow-hidden rounded-lg"
        style={{ backgroundImage: "url('/lovable-uploads/mezin_login1.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      />

      {/* ── Modal erreur connexion ── */}
      {errorModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setErrorModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-mezin text-base">Erreur de connexion</h3>
                <p className="text-sm text-gray-500 mt-1">{errorModal}</p>
              </div>
              <button
                onClick={() => setErrorModal(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Button
              onClick={() => setErrorModal(null)}
              className="w-full h-10 bg-mezin-ciel hover:bg-mezin text-white font-medium"
            >
              Réessayer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
