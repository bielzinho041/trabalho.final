/* =============================================================================
   PORTFÓLIO DE REDAÇÕES — GABRIEL TEIXEIRA DA SILVA
   Estrutura: barra lateral + índice/leitor.

   00. Configuração e utilitários
   01. Barra lateral (menu e seção atual)
   02. Trajetória: revelação ao rolar
   03. Redações: busca, filtro e leitor
   ============================================================================= */

'use strict';

/* =============================================================================
   00. CONFIGURAÇÃO E UTILITÁRIOS
   ============================================================================= */
const CONFIG = {
  nome: 'Gabriel Teixeira da Silva',
  iniciais: 'GT',
  anoConclusao: '2026',
};

const $ = (seletor, onde = document) => onde.querySelector(seletor);
const $$ = (seletor, onde = document) => Array.from(onde.querySelectorAll(seletor));

const semAcento = (texto) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

function aplicarConfig() {
  $$('[data-config]').forEach((el) => {
    const valor = CONFIG[el.dataset.config];
    if (valor) el.textContent = valor;
  });

  document.title = `${CONFIG.nome} — Portfólio de Redações | Ensino Médio`;
}

/* =============================================================================
   01. BARRA LATERAL
   ============================================================================= */
function iniciarLateral() {
  const lateral = $('.lateral');
  const botao = $('#lateral-menu');
  const nav = $('#nav-lateral');
  if (!lateral || !botao || !nav) return;

  const fechar = () => {
    nav.classList.remove('is-aberto');
    botao.setAttribute('aria-expanded', 'false');
  };

  botao.addEventListener('click', () => {
    const aberto = nav.classList.toggle('is-aberto');
    botao.setAttribute('aria-expanded', String(aberto));
  });

  $$('a', nav).forEach((link) => link.addEventListener('click', fechar));

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && nav.classList.contains('is-aberto')) {
      fechar();
      botao.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) fechar();
  });

  /* seção atual */
  const links = $$('a[href^="#"]', nav);
  const alvos = links
    .map((link) => ({ link, secao: document.getElementById(link.getAttribute('href').slice(1)) }))
    .filter((item) => item.secao);

  if (!alvos.length || !('IntersectionObserver' in window)) return;

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        alvos.forEach(({ link }) => link.removeAttribute('aria-current'));
        const atual = alvos.find((item) => item.secao === entrada.target);
        if (atual) atual.link.setAttribute('aria-current', 'true');
      });
    },
    { rootMargin: '-40% 0px -50% 0px', threshold: 0 },
  );

  alvos.forEach(({ secao }) => observador.observe(secao));
}

/* =============================================================================
   02. REVELAÇÃO AO ROLAR
   ============================================================================= */
function iniciarRevelacoes() {
  const elementos = $$('[data-revelar]');
  if (!elementos.length) return;

  if (!('IntersectionObserver' in window)) {
    elementos.forEach((el) => el.classList.add('is-visivel'));
    return;
  }

  const observador = new IntersectionObserver(
    (entradas, obs) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add('is-visivel');
        obs.unobserve(entrada.target);
      });
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.06 },
  );

  elementos.forEach((el) => observador.observe(el));
}

/* =============================================================================
   03. REDAÇÕES: BUSCA, FILTRO E LEITOR
   ============================================================================= */
function iniciarRedacoes() {
  const leitura = $('#leitura');
  const indice = $('#indice');
  const leitor = $('#leitor');
  const vazioLeitor = $('#leitor-vazio');
  const nav = $('#leitor-nav');
  const contadorLeitor = $('#ler-contador');
  const contador = $('#contador');
  const vazio = $('#vazio');
  const campo = $('#busca');
  const limpar = $('#limpar-busca');
  const limparTudo = $('#limpar-tudo');
  const temas = $$('.tema');
  if (!leitura || !indice || !leitor) return;

  const botoes = $$('.indice-botao', indice);
  const redacoes = $$('.redacao', leitor);
  const total = botoes.length;
  const estado = { termo: '', tema: 'todas', atual: null };

  /* texto de busca por redação (título + tema + texto) */
  botoes.forEach((botao) => {
    const item = botao.closest('.indice-item');
    const texto = $(`#r-${botao.dataset.num} .redacao-texto`);
    item.dataset.busca = semAcento(
      [botao.textContent, texto ? texto.textContent : ''].join(' '),
    );
  });

  /* --- mostrar uma redação no painel --- */
  const visiveis = () =>
    botoes.filter((b) => !b.closest('.indice-item').hidden).map((b) => b.dataset.num);

  const mostrar = (num, focar = true) => {
    estado.atual = num;

    redacoes.forEach((artigo) => {
      artigo.hidden = artigo.dataset.num !== num;
    });

    botoes.forEach((botao) => {
      const ativo = botao.dataset.num === num;
      botao.classList.toggle('is-ativo', ativo);
      if (ativo) botao.setAttribute('aria-current', 'true');
      else botao.removeAttribute('aria-current');
    });

    leitura.classList.add('tem-selecao');
    if (vazioLeitor) vazioLeitor.hidden = true;
    if (nav) nav.hidden = false;

    const lista = visiveis();
    const posicao = lista.indexOf(num);
    if (contadorLeitor) contadorLeitor.textContent = `${posicao + 1} / ${lista.length}`;

    const anterior = $('[data-passo="-1"]', nav);
    const proximo = $('[data-passo="1"]', nav);
    if (anterior) anterior.disabled = posicao <= 0;
    if (proximo) proximo.disabled = posicao === -1 || posicao >= lista.length - 1;

    if (focar) {
      const titulo = $(`#r-${num} .redacao-titulo`);
      const alvo = leitura.classList.contains('tem-selecao') && window.innerWidth <= 860;
      if (alvo) {
        leitura.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (titulo) window.setTimeout(() => titulo.setAttribute('tabindex', '-1'), 300);
      }
    }
  };

  const fecharLeitura = () => {
    leitura.classList.remove('tem-selecao');
    redacoes.forEach((artigo) => (artigo.hidden = true));
    botoes.forEach((botao) => botao.classList.remove('is-ativo'));
    if (nav) nav.hidden = true;
    if (vazioLeitor) vazioLeitor.hidden = false;
    estado.atual = null;
  };

  botoes.forEach((botao) => {
    botao.addEventListener('click', () => mostrar(botao.dataset.num));
  });

  $$('.redacao-voltar', leitor).forEach((botao) => {
    botao.addEventListener('click', () => {
      const num = estado.atual;
      fecharLeitura();
      const alvo = botoes.find((b) => b.dataset.num === num);
      if (alvo) alvo.focus({ preventScroll: true });
      const lado = $('.indice-lado');
      if (lado) lado.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* --- anterior / próxima --- */
  $$('.ler-nav', nav).forEach((botao) => {
    botao.addEventListener('click', () => {
      const lista = visiveis();
      const posicao = lista.indexOf(estado.atual);
      const proximo = lista[posicao + Number(botao.dataset.passo)];
      if (proximo) mostrar(proximo, false);
    });
  });

  /* --- busca e filtro --- */
  const aplicar = () => {
    const termo = semAcento(estado.termo);
    let achou = 0;

    botoes.forEach((botao) => {
      const item = botao.closest('.indice-item');
      const combinaTema = estado.tema === 'todas' || item.dataset.cat === estado.tema;
      const combinaTermo = !termo || item.dataset.busca.includes(termo);
      const mostrarEste = combinaTema && combinaTermo;
      item.hidden = !mostrarEste;
      if (mostrarEste) achou += 1;
    });

    if (contador) {
      contador.textContent = achou === total ? `${total} redações` : `${achou} de ${total} redações`;
    }
    if (vazio) vazio.hidden = achou !== 0;
    if (limpar) limpar.hidden = !estado.termo;

    temas.forEach((botao) => {
      botao.setAttribute('aria-pressed', String(botao.dataset.tema === estado.tema));
    });

    if (achou === 0) fecharLeitura();
  };

  if (campo) {
    campo.addEventListener('input', () => {
      estado.termo = campo.value;
      aplicar();
    });
  }

  if (limpar) {
    limpar.addEventListener('click', () => {
      campo.value = '';
      estado.termo = '';
      aplicar();
      campo.focus();
    });
  }

  temas.forEach((botao) => {
    botao.addEventListener('click', () => {
      estado.tema = botao.dataset.tema;
      aplicar();
    });
  });

  if (limparTudo) {
    limparTudo.addEventListener('click', () => {
      estado.termo = '';
      estado.tema = 'todas';
      if (campo) campo.value = '';
      aplicar();
      if (campo) campo.focus();
    });
  }

  /* atalho "/" foca a busca */
  document.addEventListener('keydown', (evento) => {
    if (evento.key !== '/' || !campo) return;
    const digitando = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if (digitando) return;
    evento.preventDefault();
    campo.focus();
  });

  aplicar();
  fecharLeitura();
}

/* =============================================================================
   INICIALIZAÇÃO
   ============================================================================= */
document.addEventListener('DOMContentLoaded', () => {
  aplicarConfig();
  iniciarLateral();
  iniciarRevelacoes();
  iniciarRedacoes();
});