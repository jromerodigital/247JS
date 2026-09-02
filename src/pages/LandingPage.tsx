import React from 'react';
import { motion } from 'motion/react';
import { Heart, Mail, Music, Camera, Gift, QrCode, Sparkles, ArrowRight, Star, Check } from 'lucide-react';
import { Logo } from '../components/Logo';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-romantic-bg text-romantic-text font-sans overflow-x-hidden">

      {/* ─── HEADER NAVBAR ─── */}
      <header className="fixed top-0 left-0 w-full bg-romantic-bg/80 backdrop-blur-md z-50 border-b border-romantic-accent/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo variant="horizontal" theme="dark" className="scale-75 origin-left" />
          <button 
            onClick={onGetStarted}
            className="text-xs font-bold bg-romantic-accent text-white px-4 py-2 rounded-full hover:bg-romantic-accent-hover transition-colors shadow-sm"
          >
            Iniciar Sesión
          </button>
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 pt-28 pb-20 text-center overflow-hidden">
        {/* Decorative blurred shapes */}
        <div className="absolute top-20 -left-20 w-72 h-72 bg-romantic-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -right-20 w-96 h-96 bg-romantic-accent/5 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-3xl mx-auto"
        >
          <span className="inline-flex items-center gap-1.5 text-romantic-accent font-semibold text-xs tracking-widest uppercase mb-4 bg-romantic-accent/10 px-4 py-1.5 rounded-full">
            <Heart size={12} fill="currentColor" /> Regalos digitales que enamoran
          </span>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            Sorprende a tu persona favorita con un
            <span className="text-romantic-accent italic"> detalle inolvidable</span>
          </h1>

          <p className="text-base sm:text-lg text-romantic-text/70 max-w-xl mx-auto mb-10 leading-relaxed">
            Crea una carta romántica interactiva con música, fotos y cupones rascables.
            Tu pareja la abrirá escaneando un código QR y vivirá una experiencia mágica.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGetStarted}
              className="bg-romantic-accent hover:bg-romantic-accent-hover text-white px-8 py-3.5 rounded-full font-bold shadow-lg flex items-center gap-2 text-sm transition-all hover:scale-105 cursor-pointer border-2 border-white/40"
            >
              Crear mi Dedicatoria <ArrowRight size={16} />
            </button>
            <a
              href="#como-funciona"
              className="text-romantic-accent font-semibold text-sm hover:underline cursor-pointer flex items-center gap-1"
            >
              ¿Cómo funciona? <ArrowRight size={14} />
            </a>
          </div>
        </motion.div>

        {/* Floating preview card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="relative z-10 mt-12 w-full max-w-md mx-auto"
        >
          <div className="bg-romantic-card rounded-2xl shadow-2xl border border-[#F2E8D5] p-6 text-left">
            {/* Mini envelope preview */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#A32020] rounded-full flex items-center justify-center shadow-md">
                <Heart size={16} className="text-white" fill="currentColor" />
              </div>
              <div>
                <p className="font-serif italic text-sm font-bold text-romantic-accent">Para alguien muy especial</p>
                <p className="text-[11px] text-romantic-text/50">Un detalle único y personalizado</p>
              </div>
            </div>
            <div className="bg-romantic-bg rounded-xl p-4 text-center">
              <p className="font-serif italic text-sm text-romantic-text/80 leading-relaxed">
                "Solo quiero robarte unos minutitos de tu día para decirte algo especial..."
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] text-romantic-text/40">
              <span className="flex items-center gap-1"><Music size={10} /> Música de fondo</span>
              <span className="flex items-center gap-1"><Camera size={10} /> 4 álbumes</span>
              <span className="flex items-center gap-1"><Gift size={10} /> 2 cupones</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="como-funciona" className="py-20 px-4 bg-white/50">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-3">
            ¿Cómo funciona?
          </h2>
          <p className="text-romantic-text/60 text-sm max-w-lg mx-auto">
            En solo 3 simples pasos tendrás listo un regalo digital que hará llorar de emoción a tu persona favorita.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              icon: <Sparkles size={24} />,
              title: 'Personaliza tu carta',
              description: 'Escribe tu mensaje, sube fotos de recuerdos juntos y elige la música de fondo perfecta.'
            },
            {
              step: '02',
              icon: <QrCode size={24} />,
              title: 'Obtén tu Código QR',
              description: 'Al publicar se genera un enlace único y un código QR imprimible para acompañar tu regalo físico.'
            },
            {
              step: '03',
              icon: <Heart size={24} fill="currentColor" />,
              title: 'Observa la magia',
              description: 'Tu pareja escanea el QR y vive la experiencia: sobre con lacre, música, fotos y cupones rascables.'
            }
          ].map((item) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Number(item.step) * 0.15 }}
              className="bg-romantic-card rounded-2xl p-6 border border-[#F2E8D5] shadow-sm text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-romantic-accent/20 font-serif text-5xl font-bold mb-2">{item.step}</div>
              <div className="w-12 h-12 bg-romantic-accent/10 rounded-full flex items-center justify-center mx-auto mb-3 text-romantic-accent">
                {item.icon}
              </div>
              <h3 className="font-serif font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-xs text-romantic-text/60 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-3">
            Todo lo que incluye tu dedicatoria
          </h2>
          <p className="text-romantic-text/60 text-sm max-w-lg mx-auto">
            Cada detalle está pensado para crear una experiencia emocional única e irrepetible.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { icon: <Mail size={20} />, title: 'Sobre con lacre de cera', desc: 'Animación de apertura interactiva que simula romper un sello de cera real.' },
            { icon: <Music size={20} />, title: 'Música de fondo sin anuncios', desc: 'Elige entre canciones románticas precargadas o sube tu propio MP3 favorito.' },
            { icon: <Camera size={20} />, title: 'Álbumes estilo Polaroid', desc: 'Hasta 4 álbumes de fotos con títulos personalizados y formato cuadrado.' },
            { icon: <Gift size={20} />, title: 'Cupones "Raspa y Gana"', desc: 'Sorpresas interactivas: vale por una cena, un masaje, un viaje... ¡tú decides!' },
            { icon: <QrCode size={20} />, title: 'Código QR imprimible', desc: 'Tarjeta física lista para imprimir en PDF y adjuntar a flores, chocolates o regalos.' },
            { icon: <Star size={20} />, title: 'Contador de días juntos', desc: 'Un reloj en tiempo real que muestra los días, horas y minutos de amor compartido.' },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -15 : 15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="flex items-start gap-4 bg-romantic-card rounded-xl p-5 border border-[#F2E8D5] shadow-sm"
            >
              <div className="w-10 h-10 bg-romantic-accent/10 rounded-full flex items-center justify-center flex-shrink-0 text-romantic-accent">
                {feature.icon}
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm mb-1">{feature.title}</h4>
                <p className="text-xs text-romantic-text/60 leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="precio" className="py-20 px-4 bg-white/50">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-3">
            Un precio especial
          </h2>
          <p className="text-romantic-text/60 text-sm mb-10">
            Tu dedicatoria estará activa y disponible para siempre. Sin costos ocultos.
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-romantic-card rounded-2xl p-8 border-2 border-romantic-accent/30 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-romantic-accent text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl">
              OFERTA DE LANZAMIENTO
            </div>

            <div className="mb-6">
              <span className="font-serif text-5xl font-bold text-romantic-accent">S/ 19.90</span>
              <span className="text-romantic-text/50 text-sm ml-1">por dedicatoria</span>
            </div>

            <ul className="text-left space-y-3 mb-8 max-w-xs mx-auto">
              {[
                'Enlace personalizado permanente',
                'Código QR en alta definición',
                'Tarjeta física imprimible en PDF',
                'Música de fondo sin anuncios',
                'Hasta 4 álbumes de fotos',
                'Cupones rascables ilimitados',
                'Contador de días en tiempo real',
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-sm text-romantic-text/80">
                  <Check size={16} className="text-romantic-accent flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <button
              onClick={onGetStarted}
              className="w-full bg-romantic-accent hover:bg-romantic-accent-hover text-white py-3.5 rounded-full font-bold shadow-lg text-sm transition-all hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
            >
              Crear mi Dedicatoria ahora <Heart size={16} fill="currentColor" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-10 px-4 border-t border-romantic-text/10 text-center">
        <div className="flex justify-center mb-4">
          <Logo variant="full" theme="accent" showTagline={true} className="scale-[0.8]" />
        </div>
        <p className="text-[11px] text-romantic-text/40 max-w-sm mx-auto mt-2">
          Regalos digitales que enamoran. Hecho con amor para quienes quieren sorprender a su persona favorita.
        </p>
        <p className="text-[10px] text-romantic-text/30 mt-4">
          © {new Date().getFullYear()} LinkLove. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
};
