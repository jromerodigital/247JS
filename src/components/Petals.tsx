import { useEffect, useState } from 'react';

interface PetalProps {
  color: string;
  size: number;
  left: string;
  animationDuration: string;
  delay: string;
}

export function Petals({ active }: { active: boolean }) {
  const [petals, setPetals] = useState<PetalProps[]>([]);

  useEffect(() => {
    if (!active) return;

    const colors = ['#f472b6', '#fb7185', '#fca5a5', '#ffffff']; // Pink shades
    
    const generatePetal = () => ({
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 15 + 10, // 10px to 25px
      left: `${Math.random() * 100}vw`,
      animationDuration: `${Math.random() * 5 + 5}s`, // 5s to 10s fall
      delay: `${Math.random() * 2}s`,
    });

    // Initial burst
    const initialPetals = Array.from({ length: 30 }, generatePetal);
    setPetals(initialPetals);

    // Continuous falling
    const interval = setInterval(() => {
      setPetals(current => {
        // Keep a max of 60 petals on screen
        const newPetals = [...current.slice(-50), generatePetal(), generatePetal()];
        return newPetals;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {petals.map((petal, i) => (
        <div
          key={i}
          className="petal"
          style={{
            left: petal.left,
            width: `${petal.size}px`,
            height: `${petal.size * 1.2}px`,
            backgroundColor: petal.color,
            borderRadius: '50% 0 50% 50%',
            opacity: 0.7,
            animationDuration: petal.animationDuration,
            animationDelay: petal.delay,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
          }}
        />
      ))}
    </div>
  );
}
