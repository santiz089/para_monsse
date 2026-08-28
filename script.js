"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* ─────────────────────────────────────────────
       CONFIGURACIÓN CENTRAL
    ───────────────────────────────────────────── */
    const CONFIG = {
        PASS:              "te quiero monsse",
        TYPEWRITER_SPEED:  38,   // ms por carácter
        NUM_TARJETAS:      5,
        ANGULO_TARJETA:    360 / 5,
        TRANS_DURATION:    2800, // ms duración del giro múltiple
        VUELTAS_GIRO:      5.5,  // vueltas al voltear
        TILT_MAX:          10,   // grados máx de inclinación
        TILT_LERP:         0.085,
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

    /* ─────────────────────────────────────────────
       1. COSMOS CANVAS — Partículas de fondo
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

        // Generar estrellas
        const initStars = () => {
            stars = [];
            const count = Math.floor((W * H) / 4000);
            for (let i = 0; i < count; i++) {
                stars.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    r: Math.random() * 1.4 + 0.2,
                    alpha: Math.random() * 0.7 + 0.2,
                    speed: Math.random() * 0.5 + 0.2,
                    phase: Math.random() * Math.PI * 2,
                    // Color variado: blanco, rosa pálido, dorado pálido
                    hue: Math.random() < 0.15 ? `rgba(245,200,100,` : Math.random() < 0.1 ? `rgba(244,143,177,` : `rgba(255,255,255,`,
                });
            }
        };
        initStars();
        window.addEventListener("resize", initStars);

        // Estrella fugaz
        const crearEstellaFugaz = () => {
            shootingStars.push({
                x: Math.random() * W * 0.7,
                y: Math.random() * H * 0.4,
                len: Math.random() * 120 + 60,
                speed: Math.random() * 8 + 6,
                alpha: 1,
                angle: Math.PI / 4 + (Math.random() - 0.5) * 0.4,
            });
        };
        setInterval(crearEstellaFugaz, 4500);

        let t = 0;
        const frame = () => {
            ctx.clearRect(0, 0, W, H);
            t += 0.012;

            // Dibujar estrellas
            stars.forEach(s => {
                const alpha = s.alpha * (0.65 + 0.35 * Math.sin(t * s.speed + s.phase));
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = s.hue + alpha + ")";
                ctx.fill();
            });

            // Dibujar estrellas fugaces
            shootingStars = shootingStars.filter(ss => {
                ss.x += Math.cos(ss.angle) * ss.speed;
                ss.y += Math.sin(ss.angle) * ss.speed;
                ss.alpha -= 0.022;
                if (ss.alpha <= 0) return false;

                const grad = ctx.createLinearGradient(
                    ss.x, ss.y,
                    ss.x - Math.cos(ss.angle) * ss.len,
                    ss.y - Math.sin(ss.angle) * ss.len
                );
                grad.addColorStop(0, `rgba(255,255,255,${ss.alpha})`);
                grad.addColorStop(1, "transparent");
                ctx.beginPath();
                ctx.moveTo(ss.x, ss.y);
                ctx.lineTo(ss.x - Math.cos(ss.angle) * ss.len, ss.y - Math.sin(ss.angle) * ss.len);
                ctx.strokeStyle = grad;
                ctx.lineWidth = 1.5;
                ctx.stroke();
                return true;
            });

            requestAnimationFrame(frame);
        };
        frame();
    })();

    /* ─────────────────────────────────────────────
       2. CURSOR PERSONALIZADO CON RASTRO
    ───────────────────────────────────────────── */
    (() => {
        const dot  = $("cursor-dot");
        const ring = $("cursor-ring");
        const trailCanvas  = $("cursor-trail");
        const trailCtx     = trailCanvas.getContext("2d");

        let mx = -100, my = -100;
        let rx = -100, ry = -100;
        let trail = [];

        trailCanvas.width  = window.innerWidth;
        trailCanvas.height = window.innerHeight;
        window.addEventListener("resize", () => {
            trailCanvas.width  = window.innerWidth;
            trailCanvas.height = window.innerHeight;
        });

        document.addEventListener("mousemove", e => {
            mx = e.clientX; my = e.clientY;
            dot.style.left = mx + "px";
            dot.style.top  = my + "px";

            // Agregar punto al rastro
            trail.push({ x: mx, y: my, alpha: 0.6, r: 3 });
            if (trail.length > 28) trail.shift();
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
            // Mover ring suavemente
            rx = lerp(rx, mx, 0.14);
            ry = lerp(ry, my, 0.14);
            ring.style.left = rx + "px";
            ring.style.top  = ry + "px";

            // Dibujar rastro
            trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
            trail.forEach((p, i) => {
                const progress = i / trail.length;
                trailCtx.beginPath();
                trailCtx.arc(p.x, p.y, p.r * progress, 0, Math.PI * 2);
                trailCtx.fillStyle = `rgba(245, 200, 66, ${p.alpha * progress * 0.6})`;
                trailCtx.fill();
            });

            requestAnimationFrame(animTrail);
        };
        animTrail();
    })();

    /* ─────────────────────────────────────────────
       3. EFECTO TILT MOUSE (Login)
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
       4. TYPEWRITER
    ───────────────────────────────────────────── */
    const textoTitulo = "Espero que te guste esta sorpresa, pero antes debes descifrar y encontrar la contraseña";
    let charIndex = 0;

    const escribirTitulo = () => {
        if (charIndex < textoTitulo.length) {
            tituloTexto.textContent += textoTitulo[charIndex++];
            setTimeout(escribirTitulo, CONFIG.TYPEWRITER_SPEED + Math.random() * 18);
        } else {
            // Termina typewriter: ocular cursor y mostrar pistas
            cursorTitulo.classList.add("oculto");
            setTimeout(() => {
                pistasContainer.style.opacity   = "1";
                pistasContainer.style.transform = "translateZ(35px) translateY(0)";
                setTimeout(() => {
                    inputWrapper.style.opacity   = "1";
                    estadoLogin.style.opacity    = "0.75";
                    dotsContainer.style.opacity  = "1";
                    inputPass.focus();
                }, 1100);
            }, 450);
        }
    };

    setTimeout(escribirTitulo, 700);

    /* ─────────────────────────────────────────────
       5. LÓGICA DE CONTRASEÑA
    ───────────────────────────────────────────── */
    inputPass.addEventListener("input", () => {
        const len      = inputPass.value.length;
        const progress = Math.min(len / (CONFIG.PASS.length * 1.1), 1);

        // Actualizar dots
        dots.forEach((d, i) => d.classList.toggle("activo", i < Math.floor(progress * 4)));

        // Barra de progreso e indicadores
        progressBar.style.width   = (progress * 100) + "%";
        progressBar.style.opacity = len > 0 ? "1" : "0";
        inputGlow.style.opacity   = len > 0 ? "0.8" : "0";

        procesarPass();
    });

    function procesarPass() {
        const pass = inputPass.value.trim().toLowerCase();
        if (pass !== CONFIG.PASS) {
            if (pass.length >= CONFIG.PASS.length) {
                mostrarError();
            }
            return;
        }
        // ✅ Contraseña correcta
        inputPass.disabled = true;
        estadoLogin.textContent  = "Verificando identidad...";
        estadoLogin.style.color  = "inherit";
        huellaBox.classList.add("escaneando");
        crearParticulasEscaner();

        setTimeout(() => {
            huellaBox.classList.remove("escaneando");
            huellaBox.classList.add("aprobado");
            estadoLogin.textContent = "¡Acceso concedido!";
            estadoLogin.style.color = "#22c55e";

            setTimeout(iniciarTransicionPortal, 1300);
        }, 2200);
    }

    function mostrarError() {
        huellaBox.classList.remove("error");
        // Forzar reflow para reanimar
        void huellaBox.offsetWidth;
        huellaBox.classList.add("error");
        estadoLogin.textContent = "Contraseña incorrecta";
        estadoLogin.style.color = "#ef4444";
        setTimeout(() => {
            huellaBox.classList.remove("error");
            estadoLogin.style.color = "inherit";
            estadoLogin.textContent = "Descifra el mensaje";
        }, 900);
    }

    /* ─────────────────────────────────────────────
       6. PARTÍCULAS DEL ESCÁNER
    ───────────────────────────────────────────── */
    function crearParticulasEscaner() {
        const container = $("scan-particles");
        for (let i = 0; i < 14; i++) {
            setTimeout(() => {
                const p = document.createElement("div");
                p.style.cssText = `
                    position:absolute; width:3px; height:3px; border-radius:50%;
                    background:${Math.random() > 0.5 ? "var(--rosa)" : "var(--gold)"};
                    left:${Math.random() * 88 + 6}%; top:${Math.random() * 76 + 12}%;
                    box-shadow:0 0 6px currentColor;
                `;
                container.appendChild(p);
                p.animate([
                    { opacity: 1, transform: "scale(1)" },
                    { opacity: 0, transform: `translate(${(Math.random()-0.5)*35}px, ${(Math.random()-0.5)*35}px) scale(0)` },
                ], { duration: 900, fill: "forwards" });
                setTimeout(() => p.remove(), 1000);
            }, i * 200);
        }
    }

    /* ─────────────────────────────────────────────
       7. TRANSICIÓN PORTAL
    ───────────────────────────────────────────── */
    function iniciarTransicionPortal() {
        const pantallaLog     = $("pantalla-login");
        const pantallaGaleria = $("pantalla-galeria");

        portalOverlay.classList.add("activo");

        // El flash ocurre a ~0.9s del inicio del portal
        setTimeout(() => {
            pantallaLog.classList.add("oculto");

            setTimeout(() => {
                pantallaLog.style.display = "none";
                pantallaGaleria.classList.remove("oculto");
                portalOverlay.classList.remove("activo");

                // Animar letras del título de galería
                animarTituloGaleria();
                // Iniciar partículas doradas flotantes
                iniciarParticulasGaleria();

            }, 500);
        }, 950);
    }

    /* ─────────────────────────────────────────────
       8. ANIMACIÓN TÍTULO GALERÍA (letras en cascada)
    ───────────────────────────────────────────── */
    function animarTituloGaleria() {
        const titulo = document.querySelector(".titulo-sorpresa");
        titulo.classList.add("visible");
        // Stagger por letra
        const spans = titulo.querySelectorAll("span");
        spans.forEach((span, i) => {
            span.style.transitionDelay = (i * 60) + "ms";
        });
    }

    /* ─────────────────────────────────────────────
       9. PARTÍCULAS DORADAS FLOTANTES (Galería)
    ───────────────────────────────────────────── */
    function iniciarParticulasGaleria() {
        const container = $("galeria-particles");

        const crearParticula = () => {
            const p = document.createElement("div");
            const size = Math.random() * 4 + 2;
            const isGold = Math.random() > 0.4;
            p.style.cssText = `
                position:absolute;
                width:${size}px; height:${size}px;
                border-radius:50%;
                background:${isGold ? "var(--gold)" : "var(--rosa)"};
                left:${Math.random() * 100}%;
                top:${110 + Math.random() * 10}%;
                opacity:0;
                pointer-events:none;
                box-shadow: 0 0 ${size * 3}px ${isGold ? "rgba(245,200,66,0.6)" : "rgba(194,24,91,0.5)"};
            `;
            container.appendChild(p);

            const driftX = (Math.random() - 0.5) * 200;
            const dur    = 4000 + Math.random() * 4000;

            p.animate([
                { transform: `translate(0, 0) scale(1)`,                opacity: 0 },
                { transform: `translate(${driftX * 0.3}px, -30%) scale(1.2)`,   opacity: 0.8, offset: 0.1 },
                { transform: `translate(${driftX}px, -110%) scale(0.6)`, opacity: 0 },
            ], { duration: dur, easing: "ease-in-out", fill: "forwards" });

            setTimeout(() => p.remove(), dur + 100);
        };

        // Crear partículas periódicamente
        const intervalo = setInterval(crearParticula, 280);
        // Guardar referencia por si se necesita limpiar
        window._galeria_interval = intervalo;
    }

    /* ─────────────────────────────────────────────
       10. CARRUSEL 3D
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
        // Normalizar el índice activo
        indexActual = ((indexActual - dir) % CONFIG.NUM_TARJETAS + CONFIG.NUM_TARJETAS) % CONFIG.NUM_TARJETAS;
        carrusel.style.transform = `rotateY(${anguloCarrusel}deg)`;
        actualizarIndicadores();
    }

    function actualizarIndicadores() {
        cardDots.forEach((d, i) => d.classList.toggle("active", i === indexActual));
    }

    btnPrev.addEventListener("click", e => { e.stopPropagation(); rotarCarrusel(1); });
    btnNext.addEventListener("click", e => { e.stopPropagation(); rotarCarrusel(-1); });

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

    /* ─────────────────────────────────────────────
       11. VOLTEO DE TARJETAS CON SQUASH
    ───────────────────────────────────────────── */
    tarjetas.forEach(tarjeta => {
        tarjeta.dataset.rotacion  = "0";
        tarjeta.dataset.animando  = "false";
        tarjeta.dataset.volteada  = "false";

        tarjeta.addEventListener("click", async function (e) {
            if (e.target.tagName.toLowerCase() === "video") return;
            if (this.dataset.animando === "true") return;

            this.dataset.animando = "true";
            const squash = this.parentElement;

            // 1. Squash & Stretch
            squash.classList.add("animacion-squash");
            await delay(620);
            squash.classList.remove("animacion-squash");

            const estaVolteada = this.dataset.volteada === "true";

            // 2. Confeti solo al revelar
            if (!estaVolteada) {
                const rect = this.getBoundingClientRect();
                estallarConfeti(rect.left + rect.width / 2, rect.top + rect.height / 2);
            }

            // 3. Calcular giro (normalizado para evitar números gigantes)
            let rot = parseInt(this.dataset.rotacion);
            // Normalizar a rango [-360, 360] para evitar acumulación infinita
            rot = rot % 360;

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
       12. CONFETI MULTIFORMA
    ───────────────────────────────────────────── */
    function estallarConfeti(x, y) {
        const colores = ["#F5C842", "#C2185B", "#F48FB1", "#FFFFFF", "#B39DDB", "#80DEEA"];
        const formas  = ["rect", "circle", "triangle"];

        for (let i = 0; i < 50; i++) {
            const conf   = document.createElement("div");
            conf.className = "particula-confeti";
            const color  = colores[Math.floor(Math.random() * colores.length)];
            const forma  = formas[Math.floor(Math.random() * formas.length)];
            const size   = Math.random() * 10 + 6;

            conf.style.left = x + "px";
            conf.style.top  = y + "px";
            conf.style.backgroundColor = color;
            conf.style.boxShadow = `0 0 ${size}px ${color}55`;

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
            } else {
                conf.style.width  = (size * 1.5) + "px";
                conf.style.height = size + "px";
            }

            document.body.appendChild(conf);

            const angle   = Math.random() * Math.PI * 2;
            const speed   = Math.random() * 160 + 60;
            const dx      = Math.cos(angle) * speed;
            const dy      = Math.sin(angle) * speed - 120;
            const spin    = Math.random() * 900 - 450;
            const dur     = 1100 + Math.random() * 900;

            conf.animate([
                { transform: `translate(-50%, -50%) rotate(0deg)`, opacity: 1 },
                { transform: `translate(calc(${dx}px - 50%), calc(${dy + 350}px - 50%)) rotate(${spin}deg)`, opacity: 0 },
            ], {
                duration: dur,
                easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                fill: "forwards",
            });

            setTimeout(() => conf.remove(), dur + 50);
        }
    }

    /* ─────────────────────────────────────────────
       UTILIDAD
    ───────────────────────────────────────────── */
    function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

});
