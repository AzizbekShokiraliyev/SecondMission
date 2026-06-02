import { useSelector } from 'react-redux';
import type { RootState } from '@/features/store/store';
import { useMemo } from 'react';
import { Clock, Road } from 'lucide-react';

const RoadInfoCard = () => {
  const instructions = useSelector((state: RootState) => state.map.directionsInstructions);

  const totalDistance = useMemo(() => {
  return instructions.reduce((sum, s) => sum + s.distance, 0);
}, [instructions]);

  const totalDuration = useMemo(() => {
    return instructions.reduce((sum, s) => sum + s.duration, 0);
  }, [instructions]);

  const formatDistance = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`);
  const formatDuration = (s: number) => {
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    if (hours > 0) return `${hours} soat ${minutes} min`;
    return `${minutes} min`;
  };

  if (instructions.length === 0) {
    return (
      <div className="p-4 bg-muted rounded-lg mt-4 text-center text-sm text-muted-foreground">
        Yo‘nalish topilmadi
      </div>
    );
  }

  return (
    <div className="mt-4 border rounded-lg p-3">
      <div className="flex flex-col">
        <span className='flex gap-3 pb-2 items-center'><span><Road/></span> Masofa: {formatDistance(totalDistance)}</span>
        <span className='flex gap-3 items-center'><span><Clock/></span>Vaqt: {formatDuration(totalDuration)}</span>
      </div>
    </div>
  );
};

export default RoadInfoCard;