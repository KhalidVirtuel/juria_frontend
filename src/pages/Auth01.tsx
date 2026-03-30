import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('demo@juria.local');
  const [password, setPassword] = useState('demo123');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [lawFirm, setLawFirm] = useState('');
  const [specialty, setSpecialty] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Check if user is already logged in
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
      // Save token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur Jure AI",
      });

      // Navigate to app
      navigate('/app');
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.response?.data?.error || "Email ou mot de passe incorrect",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.register({
        email,
        password,
        firstName,
        lastName,
        lawFirm: lawFirm || undefined,
        legalSpecialty: specialty,
      });

      // Save token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès",
      });

      // Navigate to app
      navigate('/app');
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description: error.response?.data?.error || "Une erreur est survenue lors de l'inscription",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/30 px-4">

      <div className="relative z-10 ">
        <div className="backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-2xl">
                                
          <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="me-10 hidden md:block" style={{ maxWidth: "360px" }}>
                <img src="/lovable-uploads/mizen.png" alt="Jure Logo" className="w-25"  />
              </div>
              <div style={{ width: "360px" }}>
                <div className="text-center mb-8">
                      <h1 className="text-5xl font-bold text-blue-950 mb-3">
                        Mezin
                      <span className="inline-block font-medium transition-all text-blue-850 duration-300 hover:scale-105 ms-4" style={{ color: '#0187DA' }}>AI</span>
                    </h1>
                    <p className="text-muted-foreground mt-2">
                      {isLogin ? "Connectez-vous à votre compte" : "Créez votre compte"}
                    </p>
                </div>
                <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
                    {!isLogin && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">Prénom</Label>
                            <Input
                              id="firstName"
                              type="text"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              required={!isLogin}
                              className="bg-white/5 border-white/10"
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Nom</Label>
                            <Input
                              id="lastName"
                              type="text"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              required={!isLogin}
                              className="bg-white/5 border-white/10"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="lawFirm">Cabinet d'avocat (optionnel)</Label>
                          <Input
                            id="lawFirm"
                            type="text"
                            value={lawFirm}
                            onChange={(e) => setLawFirm(e.target.value)}
                            className="bg-white/5 border-white/10"
                          />
                        </div>

                        <div>
                          <Label htmlFor="specialty">Spécialité juridique</Label>
                          <Select value={specialty} onValueChange={setSpecialty}>
                            <SelectTrigger className="bg-white/5 border-white/10">
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
                      </>
                    )}

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-white/5 border-white/10"
                      />
                    </div>

                    <div>
                      <Label htmlFor="password">Mot de passe</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-white/5 border-white/10"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      {loading ? "Chargement..." : isLogin ? "Se connecter" : "S'inscrire"}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
                    </button>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;