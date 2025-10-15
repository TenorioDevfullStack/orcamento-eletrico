import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

function ElectricBackground() {
  const canvasRef = useRef(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return undefined;
    }
    let animationFrameId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      dx: (Math.random() - 0.5) * 2,
      dy: (Math.random() - 0.5) * 2,
    });

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < 80; i += 1) {
        particles.push(createParticle());
      }
    };

    const getColors = () => {
      if (typeof window === "undefined") {
        return {
          particle: "rgba(56, 189, 248, 0.55)",
          link: "rgba(56, 189, 248, 0.2)",
        };
      }

      const styles = getComputedStyle(document.documentElement);

      return {
        particle:
          styles.getPropertyValue("--electric-particle").trim() ||
          "rgba(56, 189, 248, 0.55)",
        link:
          styles.getPropertyValue("--electric-link").trim() ||
          "rgba(56, 189, 248, 0.2)",
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const colors = getColors();

      ctx.fillStyle = colors.particle;
      particles.forEach((particle) => {
        const updatedParticle = particle;
        updatedParticle.x += updatedParticle.dx;
        updatedParticle.y += updatedParticle.dy;

        if (updatedParticle.x < 0 || updatedParticle.x > canvas.width) {
          updatedParticle.dx *= -1;
        }
        if (updatedParticle.y < 0 || updatedParticle.y > canvas.height) {
          updatedParticle.dy *= -1;
        }

        ctx.beginPath();
        ctx.arc(updatedParticle.x, updatedParticle.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.strokeStyle = colors.link;
      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const p1 = particles[i];
          const p2 = particles[j];
          const distance = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (distance < 80) {
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      resize();
      initParticles();
    };

    resize();
    initParticles();
    draw();
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 -z-10 pointer-events-none"
    />
  );
}

export default ElectricBackground;
