const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbxgw3c4feRsVlAyCQfhYEq_9h8yCLokGN_js_b4DpzVLyQuZJykqyZ64jBIvYEPuVRekg/exec"; 

function abrirInvitacion() {
    document.getElementById('overlay-invitacion').classList.add('overlay-hidden');
    document.getElementById('contenido-invitacion').classList.remove('hidden');
    document.body.classList.remove('no-scroll');
}

function iniciarReloj() {
    const evento = new Date('April 4, 2026 19:00:00').getTime();
    setInterval(() => {
        const ahora = new Date().getTime();
        const diff = evento - ahora;
        if (diff > 0) {
            document.getElementById("days").innerText = Math.floor(diff / 86400000).toString().padStart(2, '0');
            document.getElementById("hours").innerText = Math.floor((diff % 86400000) / 3600000).toString().padStart(2, '0');
            document.getElementById("minutes").innerText = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        }
    }, 1000);
}

async function declinarAsistencia() {
    if (!confirm("¿Estás seguro de que no podrás asistir? Nos hará falta tu presencia.")) return;

    const btn = document.querySelector('.btn-decline');
    const btnConfirm = document.querySelector('.btn-confirm-final');
    
    btn.disabled = true;
    btnConfirm.disabled = true;
    btn.innerText = "ENVIANDO...";

    try {
        // Enviamos '0' confirmados para indicar que no asiste
        await fetch(`${URL_WEB_APP}?action=confirmar&fila=${window.datosInvitado.fila}&confirmados=0`, { mode: 'no-cors' });
        
        // Personalizamos la vista final
        document.getElementById('step2').style.display = 'none';
        const ticket = document.getElementById('success-ticket');
        ticket.classList.remove('hidden');
        
        document.getElementById('final-name').innerText = window.datosInvitado.nombre;
        document.getElementById('final-pases').innerText = "Gracias por avisarnos. ¡Te extrañaremos!";
        document.querySelector('.ticket-status').innerText = "CANCELACIÓN REGISTRADA";
        document.querySelector('.ticket-status').style.color = "#888"; 
        
    } catch (e) { 
        alert("Hubo un error al registrar tu respuesta."); 
        btn.disabled = false; 
        btn.innerText = "No podré asistir";
    }
}

async function buscarInvitado() {
    const nIn = document.getElementById('nIn');
    const msg = document.getElementById('msg');
    if (nIn.value.trim().length < 3) return msg.innerText = "Escribe tu nombre completo";
    
    msg.innerText = "Buscando...";
    try {
        const res = await fetch(`${URL_WEB_APP}?action=buscar&nombre=${encodeURIComponent(nIn.value.trim())}`);
        const data = await res.json();
        
        if (data.status === "ya_confirmado") {
            // USAMOS data.confirmados (que viene de tu Excel) 
            // Si por alguna razón no existe, usamos data.cupos como respaldo
            const pasesYaRegistrados = data.confirmados || data.cupos;
            mostrarTicket(data.nombre, pasesYaRegistrados);
            msg.innerText = ""; 
        } else if (data.status === "ok") {
            window.datosInvitado = data;
            document.getElementById('step1').style.display = 'none';
            document.getElementById('step2').style.display = 'block';
            document.getElementById('welcome-txt').innerHTML = `Hola <strong>${data.nombre}</strong>`;
            document.getElementById('max-pases-hint').innerText = `Cupos para tu grupo: ${data.cupos}`;
            
            const sel = document.getElementById('cSel');
            sel.innerHTML = '<option value="" disabled selected>¿Cuántos asisten?</option>';
            for (let i = 1; i <= data.cupos; i++) {
                let opt = document.createElement('option');
                opt.value = i; 
                opt.text = i === 1 ? "1 Persona" : `${i} Personas`;
                sel.add(opt);
            }
            msg.innerText = "";
        } else { 
            msg.innerText = "No encontrado."; 
        }
    } catch (e) { 
        msg.innerText = "Error de conexión."; 
    }
}

async function confirmarFinal() {
    const sel = document.getElementById('cSel');
    const btn = document.querySelector('.btn-confirm-final');
    if (!sel.value) return alert("Selecciona cantidad");
    
    btn.disabled = true;
    btn.innerText = "REGISTRANDO...";

    try {
        await fetch(`${URL_WEB_APP}?action=confirmar&fila=${window.datosInvitado.fila}&confirmados=${sel.value}`, { mode: 'no-cors' });
        
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#b59a6d', '#ffffff'] });
        mostrarTicket(window.datosInvitado.nombre, sel.value);
    } catch (e) { alert("Error."); btn.disabled = false; }
}

function mostrarTicket(nombre, pases) {
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'none';
    
    const ticket = document.getElementById('success-ticket');
    ticket.classList.remove('hidden');
    
    document.getElementById('final-name').innerText = nombre;
    
    // Personalización del mensaje de pases
    const textoCupos = pases == 1 ? 'CUPO CONFIRMADO' : 'CUPOS CONFIRMADOS';
    document.getElementById('final-pases').innerText = `🎫 ${pases} ${textoCupos}`;
}

function agregarACalendario() {
    window.open("https://www.google.com/calendar/render?action=TEMPLATE&text=Mis+XV+Valeria+Unda&dates=20260404T190000/20260405T020000&details=Vestimenta:+Gala&location=Club+Biblos,+Guayaquil");
}

window.onload = iniciarReloj;
