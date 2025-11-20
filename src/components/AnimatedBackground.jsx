import React from 'react';

const AnimatedBackground = ({ variant = 'default', className = '' }) => {
  // Adjust opacity based on variant
  // default (Login): keeps original intensity (approx 0.6)
  // subtle (Dashboard): significantly reduced (approx 0.2 - 0.3)
  const opacity = variant === 'subtle' ? 0.25 : 0.6;

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`} style={{ zIndex: 0 }}>
      <style>{`
        @keyframes float1 {
          0% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(100px, -50px) rotate(10deg); }
          66% { transform: translate(-50px, 100px) rotate(-5deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        @keyframes float2 {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-80px, 80px) scale(1.2); }
          66% { transform: translate(50px, -50px) scale(0.8); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes float3 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(60px, 60px) scale(1.1); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .blob {
           position: absolute;
           filter: blur(80px);
           mix-blend-mode: screen;
           transition: opacity 0.5s ease-in-out;
        }
      `}</style>

      {/* Electric Indigo Blob */}
      <div
        className="blob"
        style={{
          opacity: opacity,
          top: '-10%', left: '-10%', width: '50vw', height: '50vw',
          background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, rgba(0,0,0,0) 70%)',
          animation: 'float1 20s infinite ease-in-out'
        }}
      />

      {/* Vibrant Fuchsia Blob */}
      <div
        className="blob"
        style={{
          opacity: opacity,
          bottom: '-10%', right: '-10%', width: '45vw', height: '45vw',
          background: 'radial-gradient(circle, rgba(217,70,239,0.3) 0%, rgba(0,0,0,0) 70%)',
          animation: 'float2 25s infinite ease-in-out reverse'
        }}
      />

      {/* Deep Violet Center Blob */}
      <div
        className="blob"
        style={{
          opacity: opacity,
          top: '30%', left: '30%', width: '40vw', height: '40vw',
          background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(0,0,0,0) 70%)',
          animation: 'float3 18s infinite ease-in-out'
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
