const StartMarker = ({ color = '#16a34a' }: { color?: string }) => {
  return (
    <div style={{ color }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50% 50% 50% 0',
        transform: 'rotate(-45deg)',
        background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 2px 12px ${color}80`,
        border: '3px solid #fff',
      }}>
        <span style={{ transform: 'rotate(45deg)', fontSize: 16 }}>🚗</span>
      </div>
    </div>
  );
};

export default StartMarker;