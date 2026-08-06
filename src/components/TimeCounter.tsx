import { useEffect, useState } from 'react';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';

export function TimeCounter({ startDate }: { startDate: Date }) {
  const [timePassed, setTimePassed] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      
      const days = differenceInDays(now, startDate);
      const tempDateDays = new Date(startDate);
      tempDateDays.setDate(tempDateDays.getDate() + days);
      
      const hours = differenceInHours(now, tempDateDays);
      const tempDateHours = new Date(tempDateDays);
      tempDateHours.setHours(tempDateHours.getHours() + hours);
      
      const minutes = differenceInMinutes(now, tempDateHours);
      const tempDateMinutes = new Date(tempDateHours);
      tempDateMinutes.setMinutes(tempDateMinutes.getMinutes() + minutes);
      
      const seconds = differenceInSeconds(now, tempDateMinutes);

      setTimePassed({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  return (
    <div className="w-full bg-white/50 rounded-3xl p-6 sm:p-8 backdrop-blur-sm border border-romantic-text/5 text-center my-8 sm:my-12 shadow-sm">
      <h3 className="font-serif text-xl sm:text-2xl text-romantic-text mb-6 sm:mb-8 italic">Llevamos juntos...</h3>
      
      <div className="flex justify-center items-center gap-3 sm:gap-8 text-romantic-text">
        <TimeUnit value={timePassed.days} label="DÍAS" />
        <TimeUnit value={timePassed.hours} label="HORAS" />
        <TimeUnit value={timePassed.minutes} label="MINUTOS" />
        <TimeUnit value={timePassed.seconds} label="SEGUNDOS" />
      </div>

      <p className="font-serif text-romantic-text/70 mt-6 sm:mt-8 italic text-xs sm:text-sm">
        Desde el 24 de julio de 2026
      </p>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-serif text-3xl sm:text-4xl md:text-5xl mb-1 sm:mb-2">{value}</span>
      <span className="font-sans text-[9px] sm:text-[10px] tracking-widest text-romantic-text/60 uppercase">{label}</span>
    </div>
  );
}
