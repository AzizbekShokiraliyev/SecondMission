const StartMarker = () => {
  return (
      <div style={{ color: '#16a34a' }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50% 50% 50% 0',
        transform: 'rotate(-45deg)',
        background: 'linear-gradient(135deg,#22c55e,#16a34a)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 12px rgba(22,163,74,.5)',
        border: '3px solid #fff',
      }}>
        <span style={{ transform: 'rotate(45deg)', fontSize: 16 }}>🚗</span>
      </div>
      <div style={{color: '#16a34a', background: '#16a34a' }} />
    </div>
  )
}

export default StartMarker


