const EndMarker = () => {
  return (
    <div style={{ color: '#dc2626' }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50% 50% 50% 0',
        transform: 'rotate(-45deg)',
        background: 'linear-gradient(135deg,#f87171,#dc2626)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 12px rgba(220,38,38,.5)',
        border: '3px solid #fff',
      }}>
        <span style={{ transform: 'rotate(45deg)', fontSize: 16 }}>📍</span>
      </div>
      <div style={{ background: '#dc2626' }} />
    </div>
  )
}

export default EndMarker