/* ==========================================================
   1. SIMULAÇÃO DE BANCO DE DADOS (JSON + LocalStorage)
   ========================================================== */

// Dados iniciais para "sedar" o sistema se estiver vazio
const DADOS_INICIAIS = {
    usuarios: [
        { id: 1, nome: "Administrador Geral", email: "admin@luzayana.com", senha: "123", tipo: "admin" },
        { id: 2, nome: "João Cliente", email: "cliente@gmail.com", senha: "123", tipo: "cliente" }
    ],
    reservas: [
        { id: 101, cliente: "João Cliente", data: "2024-12-25", hora: "20:00", pessoas: 4, status: "Confirmado" },
        { id: 102, cliente: "Maria Silva", data: "2024-12-31", hora: "21:00", pessoas: 2, status: "Pendente" }
    ]
};

// Inicializa o BD ao carregar a página
function inicializarBD() {
    if (!localStorage.getItem('bd_luzayana')) {
        localStorage.setItem('bd_luzayana', JSON.stringify(DADOS_INICIAIS));
        console.log("Banco de dados criado com sucesso.");
    }
}
inicializarBD();

// Funções Auxiliares de BD
function lerBD() {
    return JSON.parse(localStorage.getItem('bd_luzayana'));
}

function salvarBD(dados) {
    localStorage.setItem('bd_luzayana', JSON.stringify(dados));
}

function pegarUsuarioLogado() {
    return JSON.parse(localStorage.getItem('usuario_logado'));
}

/* ==========================================================
   2. INTERFACE E MENU (Animação Lava Lamp)
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Lógica do Menu Mobile
    const btnMobile = document.getElementById('btn-mobile');
    const menuLista = document.getElementById('menu-lista');
    
    if(btnMobile){
        btnMobile.addEventListener('click', () => {
            menuLista.classList.toggle('ativo');
        });
    }
    // Lógica do Menu "Segue o Rato" (Apenas Desktop)
    const links = document.querySelectorAll('.menu-pc a');
    const marcador = document.querySelector('.marcador-menu');

    if (marcador && window.innerWidth > 768) {
        function moverMarcador(e) {
            const link = e.target;
            marcador.style.opacity = '1';
            marcador.style.width = `${link.offsetWidth}px`;
            marcador.style.left = `${link.offsetLeft}px`;
        }

        links.forEach(link => {
            link.addEventListener('mouseenter', moverMarcador);
        });

        // Quando o mouse sai do menu, esconde o marcador
        document.querySelector('.menu-pc').addEventListener('mouseleave', () => {
            marcador.style.opacity = '0';
        });
    }
});

/* ==========================================================
   3. SISTEMA DE LOGIN
   ========================================================== */

function logar(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const bd = lerBD();

    const usuario = bd.usuarios.find(u => u.email === email && u.senha === senha);

    if (usuario) {
        localStorage.setItem('usuario_logado', JSON.stringify(usuario));
        if (usuario.tipo === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'cliente.html';
        }
    } else {
        alert("E-mail ou senha incorretos! Tente: admin@luzayana.com / 123");
    }
}
function sair() {
    localStorage.removeItem('usuario_logado');
    window.location.href = 'index.html';
}

/* ==========================================================
   4. DASHBOARD DO CLIENTE
   ========================================================== */

function carregarPerfilCliente() {
    const usuario = pegarUsuarioLogado();
    if (!usuario || usuario.tipo !== 'cliente') {
        window.location.href = 'login.html';
        return;
    }
    document.getElementById('nome-cliente').innerText = usuario.nome;
    atualizarTabelaMinhasReservas(usuario.nome);
}

function novaReserva(event) {
    event.preventDefault();
    const usuario = pegarUsuarioLogado();
    const bd = lerBD();

    const novaReserva = {
        id: Date.now(), // ID único baseado no tempo
        cliente: usuario.nome,
        data: document.getElementById('data').value,
        hora: document.getElementById('hora').value,
        pessoas: document.getElementById('pessoas').value,
        status: "Pendente"
    };

    bd.reservas.push(novaReserva);
    salvarBD(bd);
    
    alert("Reserva solicitada com sucesso!");
    document.getElementById('form-reserva').reset();
    atualizarTabelaMinhasReservas(usuario.nome);
}

function atualizarTabelaMinhasReservas(nomeCliente) {
    const bd = lerBD();
    // Filtra as reservas do cliente logado
    const minhasReservas = bd.reservas.filter(r => r.cliente === nomeCliente);
    const tbody = document.getElementById('tabela-minhas-reservas');
    
    if (tbody) {
        tbody.innerHTML = '';
        
        // Se não houver reservas, exibe uma mensagem amigável
        if (minhasReservas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhuma reserva encontrada.</td></tr>';
            return;
        }

        minhasReservas.forEach(r => {
            const statusClasse = r.status === 'Confirmado' ? 'status-confirmado' : 'status-pendente';
            
            // Adicionamos o atributo data-label para o CSS Mobile
            tbody.innerHTML += `
                <tr>
                    <td data-label="Data">${r.data}</td>
                    <td data-label="Hora">${r.hora}</td>
                    <td data-label="Pessoas">${r.pessoas}</td>
                    <td data-label="Status" class="${statusClasse}">${r.status}</td>
                </tr>
            `;
        });
    }
}
 
/* ==========================================================
   5. DASHBOARD DO ADMINISTRADOR
   ========================================================== */

function carregarPainelAdmin() {
    const usuario = pegarUsuarioLogado();
    if (!usuario || usuario.tipo !== 'admin') {
        window.location.href = 'login.html';
        return;
    }

    const bd = lerBD();
    document.getElementById('total-reservas').innerText = bd.reservas.length;
    
    const tbody = document.getElementById('tabela-todas-reservas');
    tbody.innerHTML = '';

    bd.reservas.forEach(r => {
        tbody.innerHTML += `
            <tr>
                <td class="td-normal">#${r.id}</td>
                <td class="td-normal">${r.cliente}</td>
                <td class="td-normal">${r.data}</td>
                <td class="td-normal">${r.hora}</td>
                <td class="td-normal">${r.pessoas}</td>
                <td class="td-normal">${r.status}</td>
                <td class="Confirmacao">
                <button class="btn-aceitar">Aceite</button>
                <button class="btn-rejeitar">Rejeitar</button>
                </td>
            </tr>
        `;
    });
}

function baixarRelatorio() {
    const elemento = document.getElementById('conteudo-relatorio');
    // Usa a biblioteca html2pdf que importaremos no HTML
    var opt = {
        margin:       1,
        filename:     'relatorio_luzayana.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(elemento).save();
}
