import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Heart, Mail, Lock, User as UserIcon, ArrowRight, Phone } from 'lucide-react';
import { User } from '../types/dedication';
import { loginApi, registerApi } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        if (!name || !lastName) {
          setError('Por favor ingresa tu nombre y apellido.');
          setLoading(false);
          return;
        }
        await registerApi(email, password, name, lastName, whatsapp);
        setSuccessMessage('🎉 ¡Cuenta creada con éxito! Por favor inicia sesión a continuación.');
        setMode('login');
        setPassword('');
      } else {
        const loggedUser = await loginApi(email, password);
        onSuccess(loggedUser);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-romantic-card rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#F2E8D5] relative overflow-y-auto max-h-[90vh]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-romantic-text/60 hover:text-romantic-text transition-colors rounded-full"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-romantic-accent/10 rounded-full flex items-center justify-center mx-auto mb-3 text-romantic-accent">
            <Heart size={24} fill="currentColor" />
          </div>
          <h3 className="font-serif italic font-bold text-2xl text-romantic-accent">
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear mi Cuenta'}
          </h3>
          <p className="text-xs text-romantic-text/70 mt-1">
            {mode === 'login'
              ? 'Ingresa a tu cuenta para administrar y crear tus dedicatorias'
              : 'Regístrate para guardar y publicar tus regalos románticos'}
          </p>
        </div>

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold text-center">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-romantic-text/80">Nombre</label>
                  <div className="relative">
                    <UserIcon size={16} className="absolute left-3 top-3.5 text-romantic-text/40" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-romantic-text/20 bg-white text-sm focus:outline-none focus:border-romantic-accent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-romantic-text/80">Apellido</label>
                  <div className="relative">
                    <UserIcon size={16} className="absolute left-3 top-3.5 text-romantic-text/40" />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Tu apellido"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-romantic-text/20 bg-white text-sm focus:outline-none focus:border-romantic-accent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-romantic-text/80">
                  WhatsApp (opcional, para cupones)
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-3.5 text-romantic-text/40" />
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Ej: +51987654321"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-romantic-text/20 bg-white text-sm focus:outline-none focus:border-romantic-accent"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1 text-romantic-text/80">Correo Electrónico</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3.5 text-romantic-text/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-romantic-text/20 bg-white text-sm focus:outline-none focus:border-romantic-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-romantic-text/80">Contraseña</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3.5 text-romantic-text/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-romantic-text/20 bg-white text-sm focus:outline-none focus:border-romantic-accent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-romantic-accent hover:bg-romantic-accent-hover text-white py-3 rounded-full font-bold shadow-md flex items-center justify-center gap-2 text-sm transition-transform hover:scale-105 cursor-pointer disabled:opacity-50 mt-6"
          >
            {loading ? (
              'Cargando...'
            ) : (
              <>
                {mode === 'login' ? 'Ingresar' : 'Registrarme'} <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center pt-4 border-t border-romantic-text/10 text-xs">
          {mode === 'login' ? (
            <p className="text-romantic-text/70">
              ¿Aún no tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-bold text-romantic-accent hover:underline cursor-pointer ml-1"
              >
                Crear cuenta gratis
              </button>
            </p>
          ) : (
            <p className="text-romantic-text/70">
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-romantic-accent hover:underline cursor-pointer ml-1"
              >
                Iniciar sesión
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};
