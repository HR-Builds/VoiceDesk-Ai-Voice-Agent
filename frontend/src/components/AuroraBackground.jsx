import { useEffect, useRef } from 'react'

export default function AuroraBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Constellation particles with jewel colors
    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      size: Math.random() * 2 + 0.3,
      opacity: Math.random() * 0.5 + 0.1,
      color: ['#14b8a6', '#7c3aed', '#be185d', '#c2410c', '#2dd4bf'][Math.floor(Math.random() * 5)],
    }))

    let time = 0
    const animate = () => {
      time += 0.003
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw constellation lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 180) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(20, 184, 166, ${0.04 * (1 - dist / 180)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      particles.forEach(p => {
        p.x += p.vx + Math.sin(time + p.y * 0.008) * 0.08
        p.y += p.vy + Math.cos(time + p.x * 0.008) * 0.08

        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity
        ctx.fill()
        ctx.globalAlpha = 1
      })

      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      
      {/* ─── MASSIVE CSS AURORA LAYERS ─── */}
      
      {/* Layer 1: Turquoise — massive, top-left, slow */}
      <div
        className="absolute -top-[30%] -left-[20%] w-[140%] h-[100%] rounded-full opacity-40"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(20, 184, 166, 0.5) 0%, rgba(20, 184, 166, 0.2) 30%, transparent 70%)',
          filter: 'blur(120px)',
          animation: 'aurora-drift-1 25s ease-in-out infinite',
        }}
      />
      
      {/* Layer 2: Tyrian Violet — right side, deep */}
      <div
        className="absolute top-[10%] -right-[30%] w-[120%] h-[90%] rounded-full opacity-35"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(124, 58, 237, 0.45) 0%, rgba(124, 58, 237, 0.15) 35%, transparent 70%)',
          filter: 'blur(140px)',
          animation: 'aurora-drift-2 30s ease-in-out infinite',
        }}
      />
      
      {/* Layer 3: Amaranth — bottom, warm */}
      <div
        className="absolute -bottom-[20%] left-[10%] w-[100%] h-[80%] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(190, 24, 93, 0.4) 0%, rgba(190, 24, 93, 0.12) 40%, transparent 70%)',
          filter: 'blur(130px)',
          animation: 'aurora-drift-3 22s ease-in-out infinite',
        }}
      />
      
      {/* Layer 4: Heliocrome — center glow, smaller but intense */}
      <div
        className="absolute top-[40%] left-[30%] w-[60%] h-[50%] rounded-full opacity-25"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(194, 65, 12, 0.35) 0%, rgba(194, 65, 12, 0.08) 45%, transparent 70%)',
          filter: 'blur(100px)',
          animation: 'aurora-drift-4 18s ease-in-out infinite',
        }}
      />
      
      {/* Layer 5: Turquoise wave — bottom sweep */}
      <div
        className="absolute -bottom-[10%] left-[-10%] w-[120%] h-[60%] opacity-30"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(20, 184, 166, 0.15) 50%, rgba(20, 184, 166, 0.3) 100%)',
          filter: 'blur(80px)',
          animation: 'aurora-drift-1 20s ease-in-out infinite reverse',
        }}
      />

      {/* ─── SVG AURORA WAVES ─── */}
      <svg className="absolute bottom-0 left-[-50%] w-[200%] h-[50vh] opacity-50" viewBox="0 0 1000 300" preserveAspectRatio="none">
        <defs>
          <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0f766e" stopOpacity="0" />
            <stop offset="20%" stopColor="#14b8a6" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#2dd4bf" stopOpacity="0.8" />
            <stop offset="80%" stopColor="#14b8a6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0f766e" stopOpacity="0" />
          </linearGradient>
          <filter id="blur1"><feGaussianBlur stdDeviation="25" /></filter>
        </defs>
        <path d="M0,150 C200,50 400,250 600,100 C800,0 900,200 1000,150 L1000,300 L0,300 Z" fill="url(#wave1)" filter="url(#blur1)">
          <animate attributeName="d" dur="14s" repeatCount="indefinite" values="
            M0,150 C200,50 400,250 600,100 C800,0 900,200 1000,150 L1000,300 L0,300 Z;
            M0,120 C300,220 500,20 700,180 C850,80 950,150 1000,120 L1000,300 L0,300 Z;
            M0,180 C150,80 350,280 550,60 C800,180 900,120 1000,180 L1000,300 L0,300 Z;
            M0,150 C200,50 400,250 600,100 C800,0 900,200 1000,150 L1000,300 L0,300 Z
          " />
        </path>
      </svg>

      <svg className="absolute bottom-0 left-[-50%] w-[200%] h-[40vh] opacity-40" viewBox="0 0 1000 300" preserveAspectRatio="none">
        <defs>
          <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0" />
            <stop offset="30%" stopColor="#a78bfa" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#7c3aed" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#5b21b6" stopOpacity="0" />
          </linearGradient>
          <filter id="blur2"><feGaussianBlur stdDeviation="20" /></filter>
        </defs>
        <path d="M0,180 C300,80 500,280 700,120 C850,220 950,80 1000,180 L1000,300 L0,300 Z" fill="url(#wave2)" filter="url(#blur2)">
          <animate attributeName="d" dur="18s" repeatCount="indefinite" values="
            M0,180 C300,80 500,280 700,120 C850,220 950,80 1000,180 L1000,300 L0,300 Z;
            M0,150 C200,250 400,50 600,200 C800,100 900,250 1000,150 L1000,300 L0,300 Z;
            M0,200 C250,100 450,300 650,80 C800,180 900,120 1000,200 L1000,300 L0,300 Z;
            M0,180 C300,80 500,280 700,120 C850,220 950,80 1000,180 L1000,300 L0,300 Z
          " />
        </path>
      </svg>

      {/* ─── Canvas Constellation ─── */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* ─── Spotlight Beams ─── */}
      <div className="spotlight-sweep top-0 left-[15%]" style={{ animationDelay: '0s' }} />
      <div className="spotlight-sweep top-0 left-[45%]" style={{ animationDelay: '-4s', height: '350px' }} />
      <div className="spotlight-sweep top-0 left-[75%]" style={{ animationDelay: '-7s', height: '280px' }} />

      {/* ─── Film Grain ─── */}
      <div className="grain-overlay" />
    </div>
  )
}