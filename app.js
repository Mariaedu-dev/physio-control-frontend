const API_URL = 'http://localhost:2005/api/consultas';
const form = document.getElementById('form-consulta');
const listaConsultas = document.getElementById('lista-consultas');
const consultaIdInput = document.getElementById('consulta-id');

// 1. Registro do Service Worker (Mantido)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then((reg) => console.log('PWA: Service Worker ativo!', reg))
            .catch((err) => console.log('PWA: Erro no SW:', err));
    });
}

// 2. Função para Buscar e Listar Consultas (READ)
async function carregarConsultas() {
    try {
        const response = await fetch(API_URL);
        const consultas = await response.json();
        
        listaConsultas.innerHTML = ''; // Limpa a lista antes de renderizar

        if (consultas.length === 0) {
            listaConsultas.innerHTML = '<p class="loading">Nenhum registro encontrado.</p>';
            return;
        }

        consultas.forEach(consulta => {
            const dataFormatada = new Date(consulta.dataSessao).toLocaleString('pt-BR');
            const card = document.createElement('div');
            card.className = 'card-exame';
            card.innerHTML = `
                <div class="card-info">
                    <strong>${consulta.pacienteTutor}</strong>
                    <p><span>🩺</span> ${consulta.procedimento}</p>
                    <p><span>📅</span> ${dataFormatada}</p>
                    <p class="evolucao-text">${consulta.evolucaoConduta}</p>
                </div>
                <div class="card-actions">
                    <button class="btn-delete" onclick="deletarConsulta('${consulta._id}')">Excluir</button>
                </div>
            `;
            listaConsultas.appendChild(card);
        });
    } catch (error) {
        console.error('Erro ao carregar consultas:', error);
        listaConsultas.innerHTML = '<p class="loading">Erro ao conectar com o servidor.</p>';
    }
}

// 3. Função para Salvar ou Atualizar (CREATE / UPDATE)
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const dados = {
        pacienteTutor: document.getElementById('paciente').value,
        procedimento: document.getElementById('procedimento').value,
        dataSessao: document.getElementById('data').value,
        evolucaoConduta: document.getElementById('evolucao').value
    };

    const id = consultaIdInput.value;
    const metodo = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

    try {
        const response = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (response.ok) {
            form.reset();
            consultaIdInput.value = '';
            carregarConsultas();
            alert(id ? 'Registro atualizado!' : 'Registro salvo com sucesso!');
        }
    } catch (error) {
        console.error('Erro ao salvar:', error);
        alert('Falha ao comunicar com o servidor.');
    }
});

// 4. Função para Deletar (DELETE)
window.deletarConsulta = async (id) => {
    if (!confirm('Deseja excluir este registro?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (response.ok) carregarConsultas();
    } catch (error) {
        console.error('Erro ao deletar:', error);
    }
};

// Inicialização
carregarConsultas();