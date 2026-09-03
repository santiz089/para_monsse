"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* ─────────────────────────────────────────────
       CONFIGURACIÓN CENTRAL
    ───────────────────────────────────────────── */
    const CONFIG = {
        PASS:              "te quiero monsse",
        TYPEWRITER_SPEED:  36,
        NUM_TARJETAS:      5,
        ANGULO_TARJETA:    360 / 5,
        TRANS_DURATION:    2800,
        VUELTAS_GIRO:      5.5,
        TILT_MAX:          9,
        TILT_LERP:         0.08,
    };

    /* ─────────────────────────────────────────────
       REFERENCIAS DOM
    ───────────────────────────────────────────── */
    const $ = id => document.getElementById(id);
    const tituloTexto     = $("titulo-texto");
    const cursorTitulo    = $("cursor-texto");
    const pistasContainer = $("pistas-container");
    const inputWrapper    = document.querySelector(".input-wrapper");
    const inputPass       = $("input-password");
    const progressBar     = $("input-progress-bar");
    const inputGlow       = $("input-glow");
    const huellaBox       = $("huella-box");
    const estadoLogin     = $("estado-login");
    const dotsContainer   = $("login-dots");
    const dots            = document.querySelectorAll(".login-dot");
    const tiltWrapper     = $("tilt-wrapper");
    const portalOverlay   = $("portal-overlay");
    const cosmoCanvas     = $("cosmos-canvas");
    const auroraCanvas    = $("aurora-canvas");

    /* ─────────────────────────────────────────────
       1. COSMOS CANVAS — Estrellas y estrellas fugaces
    ───────────────────────────────────────────── */
    (() => {
        const ctx = cosmoCanvas.getContext("2d");
        let W, H, stars = [], shootingStars = [];

        const resize = () => {
            W = cosmoCanvas.width  = window.innerWidth;
            H = cosmoCanvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        const initStars = () => {
            stars = [];
            const count = Math.floor((W * H) / 3800);
            for (let i = 0; i < count; i++) {
                const type = Math.random();
                stars.push({
                    x:     Math.random() * W,
                    y:     Math.random() * H,
                    r:     Math.random() * 1.5 + 0.2,
                    alpha: Math.random() * 0.75 + 0.15,
                    speed: Math.random() * 0.5 + 0.15,
                    phase: Math.random() * Math.PI * 2,
                    // Algunos son en cruz (4 puntas)
                    cross: Math.random() < 0.04,
                    hue:   type < 0.12
                               ? `rgba(245,200,100,`
                               : type < 0.2
                               ? `rgba(244,143,177,`
                               : type < 0.24
                               ? `rgba(180,160,255,`
                               : `rgba(255,255,255,`,
                });
            }
        };
        initStars();
        window.addEventListener("resize", initStars);

        const crearEstellaFugaz = () => {
            shootingStars.push({
                x:     Math.random() * W * 0.75,
                y:     Math.random() * H * 0.45,
                len:   Math.random() * 130 + 60,
                speed: Math.random() * 9 + 5,
                alpha: 1,
                angle: Math.PI / 4 + (Math.random() - 0.5) * 0.35,
                tail:  [],
            });
        };
        setInterval(crearEstellaFugaz, 4200);

        let t = 0;
        const frame = () => {
            ctx.clearRect(0, 0, W, H);
            t += 0.011;

            stars.forEach(s => {
                const alpha = s.alpha * (0.6 + 0.4 * Math.sin(t * s.speed + s.phase));
                ctx.globalAlpha = alpha;
                if (s.cross) {
                    // Estrella de 4 puntas
                    const r = s.r * 2.2;
                    ctx.strokeStyle = s.hue + "0.8)";
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(s.x - r, s.y); ctx.lineTo(s.x + r, s.y);
                    ctx.moveTo(s.x, s.y - r); ctx.lineTo(s.x, s.y + r);
                    ctx.stroke();
                } else {
                    ctx.beginPath();
                    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                    ctx.fillStyle = s.hue + alpha + ")";
                    ctx.fill();
                }
                ctx.globalAlpha = 1;
            });

            shootingStars = shootingStars.filter(ss => {
                ss.x += Math.cos(ss.angle) * ss.speed;
                ss.y += Math.sin(ss.angle) * ss.speed;
                ss.alpha -= 0.02;
                if (ss.alpha <= 0) return false;

                const grad = ctx.createLinearGradient(
                    ss.x, ss.y,
                    ss.x - Math.cos(ss.angle) * ss.len,
                    ss.y - Math.sin(ss.angle) * ss.len
                );
                grad.addColorStop(0, `rgba(255,255,255,${ss.alpha})`);
                grad.addColorStop(0.3, `rgba(245,200,100,${ss.alpha * 0.6})`);
                grad.addColorStop(1, "transparent");
                ctx.beginPath();
                ctx.moveTo(ss.x, ss.y);
                ctx.lineTo(ss.x - Math.cos(ss.angle) * ss.len, ss.y - Math.sin(ss.angle) * ss.len);
                ctx.strokeStyle = grad;
                ctx.lineWidth = 1.8;
                ctx.stroke();
                return true;
            });

            requestAnimationFrame(frame);
        };
        frame();
    })();

    /* ─────────────────────────────────────────────
       2. AURORA BOREAL CANVAS
    ───────────────────────────────────────────── */
    (() => {
        const ctx = auroraCanvas.getContext("2d");
        let W, H;

        const resize = () => {
            W = auroraCanvas.width  = window.innerWidth;
            H = auroraCanvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        // Bandas de aurora
        const bands = [
            { y: 0.18, amp: 0.07, freq: 0.6,  speed: 0.22, phase: 0,     color: [123, 47, 190],  alpha: 0.18, width: 0.25 },
            { y: 0.14, amp: 0.05, freq: 0.85,  speed: 0.31, phase: 1.2,   color: [194, 24, 91],   alpha: 0.14, width: 0.18 },
            { y: 0.22, amp: 0.06, freq: 0.45,  speed: 0.18, phase: 2.5,   color: [27, 108, 168],  alpha: 0.12, width: 0.22 },
            { y: 0.10, amp: 0.04, freq: 1.0,   speed: 0.38, phase: 0.8,   color: [245, 200, 66],  alpha: 0.08, width: 0.14 },
        ];

        let t = 0;
        const frame = () => {
            ctx.clearRect(0, 0, W, H);
            t += 0.008;

            bands.forEach(band => {
                const baseY = band.y * H;
                const bandH = band.width * H;

                ctx.save();

                // Crear puntos de la curva de aurora
                const pts = [];
                const steps = 80;
                for (let i = 0; i <= steps; i++) {
                    const x = (i / steps) * W;
                    const wave1 = Math.sin(i * band.freq * 0.08 + t * band.speed + band.phase) * band.amp * H;
                    const wave2 = Math.sin(i * band.freq * 0.04 + t * band.speed * 0.7 + band.phase + 1) * band.amp * H * 0.4;
                    pts.push({ x, y: baseY + wave1 + wave2 });
                }

                // Dibujar la banda
                const top = pts.map(p => ({ x: p.x, y: p.y - bandH * 0.5 }));
                const bot = pts.map(p => ({ x: p.x, y: p.y + bandH * 0.5 }));

                ctx.beginPath();
                ctx.moveTo(top[0].x, top[0].y);
                for (let i = 1; i < top.length; i++) {
                    const cp = { x: (top[i-1].x + top[i].x) / 2, y: (top[i-1].y + top[i].y) / 2 };
                    ctx.quadraticCurveTo(top[i-1].x, top[i-1].y, cp.x, cp.y);
                }
                for (let i = bot.length - 1; i >= 0; i--) {
                    if (i === bot.length - 1) { ctx.lineTo(bot[i].x, bot[i].y); continue; }
                    const cp = { x: (bot[i+1].x + bot[i].x) / 2, y: (bot[i+1].y + bot[i].y) / 2 };
                    ctx.quadraticCurveTo(bot[i+1].x, bot[i+1].y, cp.x, cp.y);
                }
                ctx.closePath();

                const [r, g, b] = band.color;
                const grd = ctx.createLinearGradient(0, baseY - bandH, 0, baseY + bandH);
                grd.addColorStop(0, `rgba(${r},${g},${b},0)`);
                grd.addColorStop(0.4, `rgba(${r},${g},${b},${band.alpha})`);
                grd.addColorStop(0.6, `rgba(${r},${g},${b},${band.alpha})`);
                grd.addColorStop(1, `rgba(${r},${g},${b},0)`);

                ctx.fillStyle = grd;
                ctx.filter = `blur(${Math.floor(bandH * 0.3)}px)`;
                ctx.fill();
                ctx.restore();
            });

            requestAnimationFrame(frame);
        };
        frame();
    })();

    /* ─────────────────────────────────────────────
       3. CURSOR PERSONALIZADO CON RASTRO
    ───────────────────────────────────────────── */
    (() => {
        const dot       = $("cursor-dot");
        const ring      = $("cursor-ring");
        const trailCvs  = $("cursor-trail");
        const trailCtx  = trailCvs.getContext("2d");

        let mx = -100, my = -100;
        let rx = -100, ry = -100;
        let trail = [];

        const resizeTrail = () => {
            trailCvs.width  = window.innerWidth;
            trailCvs.height = window.innerHeight;
        };
        resizeTrail();
        window.addEventListener("resize", resizeTrail);

        document.addEventListener("mousemove", e => {
            mx = e.clientX; my = e.clientY;
            dot.style.left = mx + "px";
            dot.style.top  = my + "px";
            trail.push({ x: mx, y: my, alpha: 0.55, r: 3.5 });
            if (trail.length > 30) trail.shift();
        });

        document.addEventListener("mouseleave", () => {
            dot.style.opacity  = "0";
            ring.style.opacity = "0";
        });
        document.addEventListener("mouseenter", () => {
            dot.style.opacity  = "1";
            ring.style.opacity = "1";
        });

        const lerp = (a, b, t) => a + (b - a) * t;

        const animTrail = () => {
            rx = lerp(rx, mx, 0.13);
            ry = lerp(ry, my, 0.13);
            ring.style.left = rx + "px";
            ring.style.top  = ry + "px";

            trailCtx.clearRect(0, 0, trailCvs.width, trailCvs.height);
            trail.forEach((p, i) => {
                const prog = i / trail.length;
                trailCtx.beginPath();
                trailCtx.arc(p.x, p.y, p.r * prog, 0, Math.PI * 2);
                trailCtx.fillStyle = `rgba(245,200,66,${p.alpha * prog * 0.55})`;
                trailCtx.fill();
            });
            requestAnimationFrame(animTrail);
        };
        animTrail();
    })();

    /* ─────────────────────────────────────────────
       4. PÉTALOS FLOTANTES (siempre presentes)
    ───────────────────────────────────────────── */
    (() => {
        const container = $("petalo-container");
        if (!container) return;

        const crearPetalo = () => {
            const p = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            const size = Math.random() * 12 + 7;
            const isHeart = Math.random() < 0.35;
            const col = Math.random() < 0.5
                ? `rgba(244,143,177,${Math.random() * 0.3 + 0.15})`
                : `rgba(245,200,66,${Math.random() * 0.2 + 0.1})`;

            p.setAttribute("viewBox", "0 0 24 24");
            p.setAttribute("width", size);
            p.setAttribute("height", size);
            p.style.cssText = `
                position:absolute;
                left:${Math.random() * 100}%;
                top:-${size + 10}px;
                pointer-events:none;
            `;

            if (isHeart) {
                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute("d","M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z");
                path.setAttribute("fill", col);
                p.appendChild(path);
            } else {
                // Pétalo ovalado
                const ellipse = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
                ellipse.setAttribute("cx", "12");
                ellipse.setAttribute("cy", "12");
                ellipse.setAttribute("rx", "5");
                ellipse.setAttribute("ry", "10");
                ellipse.setAttribute("fill", col);
                ellipse.setAttribute("transform", `rotate(${Math.random() * 40 - 20} 12 12)`);
                p.appendChild(ellipse);
            }

            container.appendChild(p);

            const driftX = (Math.random() - 0.5) * 220;
            const dur    = 7000 + Math.random() * 8000;
            const rot    = Math.random() * 360 - 180;

            p.animate([
                { transform: `translate(0, 0) rotate(0deg)`, opacity: 0 },
                { transform: `translate(${driftX * 0.2}px, 15vh) rotate(${rot * 0.3}deg)`, opacity: 0.85, offset: 0.1 },
                { transform: `translate(${driftX}px, 105vh) rotate(${rot}deg)`, opacity: 0 },
            ], { duration: dur, easing: "ease-in-out", fill: "forwards" });

            setTimeout(() => p.remove(), dur + 100);
        };

        // Crear pétalos periódicamente (lento, decorativo)
        setInterval(crearPetalo, 1800);
        // Inicio con algunos pétalos
        for (let i = 0; i < 4; i++) {
            setTimeout(crearPetalo, i * 600);
        }
    })();

    /* ─────────────────────────────────────────────
       5. EFECTO TILT MOUSE
    ───────────────────────────────────────────── */
    let cRotX = 0, cRotY = 0, tRotX = 0, tRotY = 0;

    window.addEventListener("mousemove", e => {
        if (!$("pantalla-galeria").classList.contains("oculto")) return;
        const x = (e.clientX / window.innerWidth  - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        tRotY =  x * CONFIG.TILT_MAX;
        tRotX = -y * CONFIG.TILT_MAX;
    });

    const lerp = (a, b, t) => a + (b - a) * t;

    (function tickTilt() {
        cRotX = lerp(cRotX, tRotX, CONFIG.TILT_LERP);
        cRotY = lerp(cRotY, tRotY, CONFIG.TILT_LERP);
        tiltWrapper.style.transform = `rotateX(${cRotX.toFixed(3)}deg) rotateY(${cRotY.toFixed(3)}deg)`;
        requestAnimationFrame(tickTilt);
    })();

    /* ─────────────────────────────────────────────
       6. TYPEWRITER
    ───────────────────────────────────────────── */
    const textoTitulo = "Espero que te guste esta sorpresa, pero antes debes descifrar y encontrar la contraseña";
    let charIndex = 0;

    const escribirTitulo = () => {
        if (charIndex < textoTitulo.length) {
            tituloTexto.textContent += textoTitulo[charIndex++];
            setTimeout(escribirTitulo, CONFIG.TYPEWRITER_SPEED + Math.random() * 16);
        } else {
            cursorTitulo.classList.add("oculto");
            setTimeout(() => {
                pistasContainer.style.opacity   = "1";
                pistasContainer.style.transform = "translateZ(35px) translateY(0)";
                setTimeout(() => {
                    inputWrapper.style.opacity  = "1";
                    estadoLogin.style.opacity   = "0.75";
                    dotsContainer.style.opacity = "1";
                    inputPass.focus();
                }, 1100);
            }, 450);
        }
    };
    setTimeout(escribirTitulo, 700);

    /* ─────────────────────────────────────────────
       7. LÓGICA DE CONTRASEÑA
    ───────────────────────────────────────────── */
    inputPass.addEventListener("input", () => {
        const len      = inputPass.value.length;
        const progress = Math.min(len / (CONFIG.PASS.length * 1.1), 1);

        dots.forEach((d, i) => d.classList.toggle("activo", i < Math.floor(progress * 4)));
        progressBar.style.width   = (progress * 100) + "%";
        progressBar.style.opacity = len > 0 ? "1" : "0";
        inputGlow.style.opacity   = len > 0 ? "0.85" : "0";

        procesarPass();
    });

    function procesarPass() {
        const pass = inputPass.value.trim().toLowerCase();
        if (pass !== CONFIG.PASS) {
            if (pass.length >= CONFIG.PASS.length) mostrarError();
            return;
        }
        inputPass.disabled = true;
        estadoLogin.textContent = "Verificando identidad...";
        estadoLogin.style.color = "inherit";
        huellaBox.classList.add("escaneando");
        crearParticulasEscaner();

        setTimeout(() => {
            huellaBox.classList.remove("escaneando");
            huellaBox.classList.add("aprobado");
            estadoLogin.textContent = "¡Acceso concedido!";
            estadoLogin.style.color = "#4ade80";

            // Mini confeti de aprobación
            setTimeout(() => estallarConfeti(window.innerWidth/2, window.innerHeight/2, 25), 200);
            setTimeout(iniciarTransicionPortal, 1400);
        }, 2200);
    }

    function mostrarError() {
        huellaBox.classList.remove("error");
        void huellaBox.offsetWidth;
        huellaBox.classList.add("error");
        estadoLogin.textContent = "Contraseña incorrecta";
        estadoLogin.style.color = "#f87171";
        setTimeout(() => {
            huellaBox.classList.remove("error");
            estadoLogin.style.color = "inherit";
            estadoLogin.textContent = "Descifra el mensaje";
        }, 900);
    }

    /* ─────────────────────────────────────────────
       8. PARTÍCULAS DEL ESCÁNER
    ───────────────────────────────────────────── */
    function crearParticulasEscaner() {
        const container = $("scan-particles");
        for (let i = 0; i < 18; i++) {
            setTimeout(() => {
                const p = document.createElement("div");
                const isGold = Math.random() > 0.5;
                p.style.cssText = `
                    position:absolute; width:3px; height:3px; border-radius:50%;
                    background:${isGold ? "var(--gold)" : "var(--rosa)"};
                    left:${Math.random() * 88 + 6}%; top:${Math.random() * 76 + 12}%;
                    box-shadow:0 0 8px ${isGold ? "var(--gold)" : "var(--rosa)"};
                `;
                container.appendChild(p);
                p.animate([
                    { opacity: 1, transform: "scale(1)" },
                    { opacity: 0, transform: `translate(${(Math.random()-0.5)*40}px, ${(Math.random()-0.5)*40}px) scale(0)` },
                ], { duration: 1000, fill: "forwards" });
                setTimeout(() => p.remove(), 1100);
            }, i * 140);
        }
    }

    /* ─────────────────────────────────────────────
       9. TRANSICIÓN PORTAL
    ───────────────────────────────────────────── */
    function iniciarTransicionPortal() {
        const pantallaLog     = $("pantalla-login");
        const pantallaGaleria = $("pantalla-galeria");

        portalOverlay.classList.add("activo");

        setTimeout(() => {
            pantallaLog.classList.add("oculto");
            setTimeout(() => {
                pantallaLog.style.display = "none";
                pantallaGaleria.classList.remove("oculto");
                portalOverlay.classList.remove("activo");

                animarTituloGaleria();
                iniciarParticulasGaleria();
                iniciarLluviaCorazones();
                iniciarOrbitaEspecial();

                // Mostrar subtítulo
                setTimeout(() => {
                    const sub = $("subtitulo-galeria");
                    if (sub) sub.classList.add("visible");
                }, 1400);

            }, 500);
        }, 980);
    }

    /* ─────────────────────────────────────────────
       10. ANIMACIÓN TÍTULO GALERÍA
    ───────────────────────────────────────────── */
    function animarTituloGaleria() {
        const titulo = document.querySelector(".titulo-sorpresa");
        titulo.classList.add("visible");
        const spans = titulo.querySelectorAll("span");
        spans.forEach((span, i) => {
            span.style.transitionDelay = (i * 70) + "ms";
        });
    }

    /* ─────────────────────────────────────────────
       11. PARTÍCULAS DORADAS FLOTANTES (Galería)
    ───────────────────────────────────────────── */
    function iniciarParticulasGaleria() {
        const container = $("galeria-particles");

        const crearParticula = () => {
            const p = document.createElement("div");
            const size   = Math.random() * 5 + 2;
            const isGold = Math.random() > 0.38;
            const isPurp = !isGold && Math.random() > 0.5;
            const color  = isGold
                ? "var(--gold)"
                : isPurp
                ? "rgba(180,160,255,0.7)"
                : "var(--rosa)";
            const glow   = isGold
                ? "rgba(245,200,66,0.6)"
                : isPurp
                ? "rgba(180,160,255,0.5)"
                : "rgba(194,24,91,0.5)";

            p.style.cssText = `
                position:absolute;
                width:${size}px; height:${size}px;
                border-radius:50%;
                background:${color};
                left:${Math.random() * 100}%;
                top:${110 + Math.random() * 10}%;
                opacity:0;
                pointer-events:none;
                box-shadow: 0 0 ${size * 3}px ${glow};
            `;
            container.appendChild(p);

            const driftX = (Math.random() - 0.5) * 230;
            const dur    = 4500 + Math.random() * 4500;

            p.animate([
                { transform: `translate(0, 0) scale(1)`, opacity: 0 },
                { transform: `translate(${driftX*0.25}px, -30%) scale(1.3)`, opacity: 0.85, offset: 0.08 },
                { transform: `translate(${driftX}px, -115%) scale(0.5)`, opacity: 0 },
            ], { duration: dur, easing: "ease-in-out", fill: "forwards" });

            setTimeout(() => p.remove(), dur + 100);
        };

        setInterval(crearParticula, 270);
    }

    /* ─────────────────────────────────────────────
       12. LLUVIA DE CORAZONES (entrada a galería)
    ───────────────────────────────────────────── */
    function iniciarLluviaCorazones() {
        const container = $("lluvia-corazones");

        const crearCorazon = () => {
            const size = Math.random() * 22 + 10;
            const svg  = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("viewBox", "0 0 24 24");
            svg.setAttribute("width", size);
            svg.setAttribute("height", size);

            const colores = [
                `rgba(244,143,177,${Math.random()*0.55+0.3})`,
                `rgba(194,24,91,${Math.random()*0.45+0.25})`,
                `rgba(245,200,66,${Math.random()*0.35+0.2})`,
            ];
            const col = colores[Math.floor(Math.random() * colores.length)];

            svg.innerHTML = `<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="${col}"/>`;
            svg.style.cssText = `
                position:absolute;
                left:${Math.random()*95}%;
                top:-35px;
                pointer-events:none;
                filter: drop-shadow(0 0 6px ${col});
            `;
            container.appendChild(svg);

            const driftX = (Math.random() - 0.5) * 120;
            const dur    = 2500 + Math.random() * 2000;

            svg.animate([
                { transform: `translate(0,0) rotate(0deg) scale(1)`, opacity: 0 },
                { transform: `translate(${driftX*0.3}px,15vh) rotate(${driftX*0.3}deg) scale(1.1)`, opacity: 1, offset: 0.1 },
                { transform: `translate(${driftX}px,100vh) rotate(${driftX}deg) scale(0.8)`, opacity: 0 },
            ], { duration: dur, easing: "cubic-bezier(0.4,0,0.6,1)", fill: "forwards" });

            setTimeout(() => svg.remove(), dur + 50);
        };

        // Lluvia intensa al inicio, luego se reduce
        let count = 0;
        const burst = setInterval(() => {
            crearCorazon();
            count++;
            if (count >= 30) clearInterval(burst);
        }, 90);

        // Lluvia suave continua
        setTimeout(() => {
            setInterval(crearCorazon, 600);
        }, 3000);
    }

    /* ─────────────────────────────────────────────
       13. ÓRBITA DE PARTÍCULAS EN TARJETA ESPECIAL
    ───────────────────────────────────────────── */
    function iniciarOrbitaEspecial() {
        const container = $("orbita-particulas");
        if (!container) return;

        for (let i = 0; i < 6; i++) {
            const orb = document.createElement("div");
            orb.style.cssText = `
                position:absolute;
                width:5px; height:5px;
                border-radius:50%;
                background:${i % 2 === 0 ? "var(--gold)" : "var(--rosa-suave)"};
                box-shadow: 0 0 8px ${i % 2 === 0 ? "var(--gold)" : "var(--rosa)"};
                pointer-events:none;
                top:50%; left:50%;
            `;
            orb.style.animation = `orbitar-esp ${2.5 + i * 0.5}s linear infinite`;
            orb.style.animationDelay = `${i * 0.42}s`;
            container.appendChild(orb);
        }

        if (!document.getElementById("orbita-style")) {
            const style = document.createElement("style");
            style.id = "orbita-style";
            style.textContent = `
                @keyframes orbitar-esp {
                    0%   { transform: rotate(0deg)   translateX(45px) scale(1); }
                    50%  { transform: rotate(180deg) translateX(45px) scale(1.4); }
                    100% { transform: rotate(360deg) translateX(45px) scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /* ─────────────────────────────────────────────
       14. CARRUSEL 3D
    ───────────────────────────────────────────── */
    const carrusel     = $("carrusel");
    const btnPrev      = $("btn-prev");
    const btnNext      = $("btn-next");
    const tarjetas     = document.querySelectorAll(".tarjeta-interactiva");
    const cardDots     = document.querySelectorAll(".card-dot");
    let anguloCarrusel = 0;
    let indexActual    = 0;

    function rotarCarrusel(dir) {
        anguloCarrusel += dir * CONFIG.ANGULO_TARJETA;
        indexActual = ((indexActual - dir) % CONFIG.NUM_TARJETAS + CONFIG.NUM_TARJETAS) % CONFIG.NUM_TARJETAS;
        carrusel.style.transform = `rotateY(${anguloCarrusel}deg)`;
        actualizarIndicadores();
    }

    function actualizarIndicadores() {
        cardDots.forEach((d, i) => d.classList.toggle("active", i === indexActual));
    }

    btnPrev.addEventListener("click", e => { e.stopPropagation(); rotarCarrusel(1); });
    btnNext.addEventListener("click", e => { e.stopPropagation(); rotarCarrusel(-1); });

    btnPrev.addEventListener("touchstart", e => {
        e.preventDefault(); e.stopPropagation(); rotarCarrusel(1);
    }, { passive: false });

    btnNext.addEventListener("touchstart", e => {
        e.preventDefault(); e.stopPropagation(); rotarCarrusel(-1);
    }, { passive: false });

    // Swipe táctil
    let touchStartX = 0;
    const zonaSwipe = $("pantalla-galeria");
    zonaSwipe.addEventListener("touchstart", e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    zonaSwipe.addEventListener("touchend", e => {
        const dx = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(dx) > 50) rotarCarrusel(dx > 0 ? 1 : -1);
    }, { passive: true });

    // Teclado
    document.addEventListener("keydown", e => {
        if (!$("pantalla-galeria").classList.contains("oculto")) {
            if (e.key === "ArrowLeft")  rotarCarrusel(1);
            if (e.key === "ArrowRight") rotarCarrusel(-1);
        }
    });

    // Scroll para rotar
    zonaSwipe.addEventListener("wheel", e => {
        if (e.deltaY > 30) rotarCarrusel(-1);
        else if (e.deltaY < -30) rotarCarrusel(1);
    }, { passive: true });

    /* ─────────────────────────────────────────────
       15. VOLTEO DE TARJETAS CON SQUASH
    ───────────────────────────────────────────── */
    tarjetas.forEach(tarjeta => {
        tarjeta.dataset.rotacion = "0";
        tarjeta.dataset.animando = "false";
        tarjeta.dataset.volteada = "false";

        tarjeta.addEventListener("click", async function (e) {
            if (e.target.tagName.toLowerCase() === "iframe") return;
            if (this.dataset.animando === "true") return;

            this.dataset.animando = "true";
            const squash = this.parentElement;

            squash.classList.add("animacion-squash");
            await delay(630);
            squash.classList.remove("animacion-squash");

            const estaVolteada = this.dataset.volteada === "true";

            if (!estaVolteada) {
                const rect = this.getBoundingClientRect();
                estallarConfeti(rect.left + rect.width / 2, rect.top + rect.height / 2);

                // Si es la tarjeta especial, explosión extra
                if (this.classList.contains("tarjeta-especial")) {
                    setTimeout(() => explosionEspecial(rect.left + rect.width / 2, rect.top + rect.height / 2), 200);
                }
            }

            let rot = parseInt(this.dataset.rotacion) % 360;
            const vueltas = Math.round(CONFIG.VUELTAS_GIRO) * 360;

            if (!estaVolteada) {
                rot -= (180 + vueltas);
                this.dataset.volteada = "true";
            } else {
                rot += (180 + vueltas);
                this.dataset.volteada = "false";
            }

            this.dataset.rotacion = rot;
            this.style.transition = `transform ${CONFIG.TRANS_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`;
            this.style.transform  = `rotateY(${rot}deg)`;

            setTimeout(() => { this.dataset.animando = "false"; }, CONFIG.TRANS_DURATION);
        });
    });

    /* ─────────────────────────────────────────────
       16. CONFETI MULTIFORMA
    ───────────────────────────────────────────── */
    function estallarConfeti(x, y, cantidad = 52) {
        const colores = ["#F5C842", "#C2185B", "#F48FB1", "#FFFFFF", "#B39DDB", "#80DEEA", "#FFD700"];
        const formas  = ["rect", "circle", "triangle", "estrella"];

        for (let i = 0; i < cantidad; i++) {
            const conf  = document.createElement("div");
            conf.className = "particula-confeti";
            const color = colores[Math.floor(Math.random() * colores.length)];
            const forma = formas[Math.floor(Math.random() * formas.length)];
            const size  = Math.random() * 11 + 6;

            conf.style.left = x + "px";
            conf.style.top  = y + "px";
            conf.style.backgroundColor = color;
            conf.style.boxShadow = `0 0 ${size}px ${color}66`;

            if (forma === "circle") {
                conf.style.width  = size + "px";
                conf.style.height = size + "px";
                conf.style.borderRadius = "50%";
            } else if (forma === "triangle") {
                conf.style.width  = "0";
                conf.style.height = "0";
                conf.style.backgroundColor = "transparent";
                conf.style.borderLeft   = `${size/2}px solid transparent`;
                conf.style.borderRight  = `${size/2}px solid transparent`;
                conf.style.borderBottom = `${size}px solid ${color}`;
                conf.style.boxShadow    = "none";
            } else if (forma === "estrella") {
                // Mini corazón SVG
                conf.style.width  = "0";
                conf.style.height = "0";
                conf.style.background = "transparent";
            } else {
                conf.style.width  = (size * 1.6) + "px";
                conf.style.height = size + "px";
            }

            document.body.appendChild(conf);

            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 175 + 65;
            const dx    = Math.cos(angle) * speed;
            const dy    = Math.sin(angle) * speed - 130;
            const spin  = Math.random() * 1000 - 500;
            const dur   = 1200 + Math.random() * 1000;

            conf.animate([
                { transform: `translate(-50%, -50%) rotate(0deg)`, opacity: 1 },
                { transform: `translate(calc(${dx}px - 50%), calc(${dy + 370}px - 50%)) rotate(${spin}deg)`, opacity: 0 },
            ], {
                duration: dur,
                easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                fill: "forwards",
            });
            setTimeout(() => conf.remove(), dur + 50);
        }
    }

    /* ─────────────────────────────────────────────
       17. EXPLOSIÓN ESPECIAL (tarjeta ★)
    ───────────────────────────────────────────── */
    function explosionEspecial(x, y) {
        // Onda de choque
        const onda = document.createElement("div");
        onda.style.cssText = `
            position:fixed;
            left:${x}px; top:${y}px;
            width:10px; height:10px;
            border-radius:50%;
            border:2px solid var(--gold);
            transform:translate(-50%,-50%) scale(0);
            pointer-events:none;
            z-index:10001;
        `;
        document.body.appendChild(onda);
        onda.animate([
            { transform: "translate(-50%,-50%) scale(0)", opacity: 1 },
            { transform: "translate(-50%,-50%) scale(22)", opacity: 0 },
        ], { duration: 900, easing: "ease-out", fill: "forwards" });
        setTimeout(() => onda.remove(), 950);

        // Corazones voladores
        for (let i = 0; i < 12; i++) {
            const h = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            const sz = Math.random() * 18 + 10;
            h.setAttribute("viewBox", "0 0 24 24");
            h.setAttribute("width", sz);
            h.setAttribute("height", sz);
            h.innerHTML = `<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="rgba(244,143,177,${Math.random()*0.5+0.5})"/>`;
            h.style.cssText = `position:fixed;left:${x}px;top:${y}px;pointer-events:none;z-index:10001;`;
            document.body.appendChild(h);

            const ang = (i / 12) * Math.PI * 2;
            const spd = Math.random() * 140 + 60;
            const dx  = Math.cos(ang) * spd;
            const dy  = Math.sin(ang) * spd - 80;

            h.animate([
                { transform: `translate(-50%,-50%) scale(0)`, opacity: 1 },
                { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 250}px)) scale(1) rotate(${Math.random()*360}deg)`, opacity: 0 },
            ], { duration: 1400 + Math.random() * 600, easing: "cubic-bezier(0.2,0.8,0.2,1)", fill: "forwards" });
            setTimeout(() => h.remove(), 2100);
        }
    }

    /* ─────────────────────────────────────────────
       UTILIDAD
    ───────────────────────────────────────────── */
    function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

});
