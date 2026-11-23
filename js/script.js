/* =============================================================================
   PORTFÓLIO DE REDAÇÕES — GABRIEL TEIXEIRA DA SILVA
   JavaScript puro, organizado por módulos:

   00. Configuração e utilitários
   01. Cabeçalho (menu responsivo + seção atual)
   02. Revelação ao rolar
   03. Redações: busca, filtro por tema e leitor sanfonado
   04. Voltar ao topo
   ============================================================================= */

'use strict';

/* =============================================================================
   00. CONFIGURAÇÃO E UTILITÁRIOS
   -----------------------------------------------------------------------------
   Edite apenas este objeto para atualizar os dados do site inteiro.
   ============================================================================= */
const CONFIG = {
  nome: 'Gabriel Teixeira da Silva',
  iniciais: 'GT',
  anoConclusao: '2026',
  email: 'seu.email@exemplo.com',
  github: 'https://github.com/seu-usuario',
};

const $ = (seletor, onde = document) => onde.querySelector(seletor);
const $$ = (seletor, onde = document) => Array.from(onde.querySelectorAll(seletor));

/** Minúsculas e sem acentos — usado na busca. */
const normalizar = (texto) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

function debounce(fn, espera = 140) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), espera);
  };
}

function aplicarConfig() {
  $$('[data-config]').forEach((el) => {
    const valor = CONFIG[el.dataset.config];
    if (valor) el.textContent = valor;
  });

  if (CONFIG.nome) {
    document.title = `${CONFIG.nome} — Portfólio de Redações | Ensino Médio`;
  }

  const email = $('a[href^="mailto:"]');
  if (email) email.href = `mailto:${CONFIG.email}`;

  const github = $('a[href*="github.com"]');
  if (github) github.href = CONFIG.github;
}

/* =============================================================================
   01. CABEÇALHO
   ============================================================================= */
function iniciarCabecalho() {
  const botao = $('#menu-botao');
  const menu = $('#menu');
  if (!botao || !menu) return;

  const fechar = () => {
    menu.classList.remove('is-aberto');
    botao.setAttribute('aria-expanded', 'false');
  };

  botao.addEventListener('click', () => {
    const aberto = menu.classList.toggle('is-aberto');
    botao.setAttribute('aria-expanded', String(aberto));
  });

  $$('a', menu).forEach((link) => link.addEventListener('click', fechar));

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && menu.classList.contains('is-aberto')) {
      fechar();
      botao.focus();
    }
  });

  document.addEventListener('click', (evento) => {
    if (!menu.classList.contains('is-aberto')) return;
    if (menu.contains(evento.target) || botao.contains(evento.target)) return;
    fechar();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) fechar();
  });

  /* marcar no menu a seção visível */
  const links = $$('.menu-lista a[href^="#"]');
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
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
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
   03. REDAÇÕES: BUSCA, FILTRO E SANFONA
   ============================================================================= */
function iniciarRedacoes() {
  const lista = $('#lista');
  if (!lista) return;

  const itens = $$('.indice-item', lista);
  const campo = $('#busca');
  const limpar = $('#limpar-busca');
  const contador = $('#contador');
  const vazio = $('#vazio');
  const temas = $$('.tema');
  const total = itens.length;
  const estado = { termo: '', tema: 'todas' };

  /* texto de busca: título + tema + metadados + texto completo */
  itens.forEach((item) => {
    const texto = $('.texto-redacao', item);
    item.dataset.busca = normalizar(
      [
        $('.indice-titulo', item)?.textContent ?? '',
        $('.indice-meta', item)?.textContent ?? '',
        texto ? texto.textContent : '',
      ].join(' '),
    );
  });

  /* --- sanfona: um item aberto por vez --- */
  const abrir = (item) => {
    itens.forEach((outro) => {
      if (outro === item) return;
      outro.classList.remove('is-aberto');
      $('.indice-cabeca', outro)?.setAttribute('aria-expanded', 'false');
      const corpo = $('.indice-corpo', outro);
      if (corpo) corpo.setAttribute('aria-hidden', 'true');
    });

    item.classList.add('is-aberto');
    $('.indice-cabeca', item)?.setAttribute('aria-expanded', 'true');
    $('.indice-corpo', item)?.setAttribute('aria-hidden', 'false');
  };

  const fechar = (item) => {
    item.classList.remove('is-aberto');
    $('.indice-cabeca', item)?.setAttribute('aria-expanded', 'false');
    $('.indice-corpo', item)?.setAttribute('aria-hidden', 'true');
  };

  itens.forEach((item) => {
    const cabeca = $('.indice-cabeca', item);
    if (!cabeca) return;

    cabeca.addEventListener('click', () => {
      if (item.classList.contains('is-aberto')) {
        fechar(item);
      } else {
        abrir(item);
      }
    });

    const botaoFechar = $('.indice-fechar', item);
    if (botaoFechar) {
      botaoFechar.addEventListener('click', () => {
        fechar(item);
        cabeca.focus({ preventScroll: true });
      });
    }
  });

  /* --- busca + filtro --- */
  const aplicar = () => {
    const termo = normalizar(estado.termo);
    let visiveis = 0;

    itens.forEach((item) => {
      const combinaTema = estado.tema === 'todas' || item.dataset.cat === estado.tema;
      const combinaTermo = !termo || item.dataset.busca.includes(termo);
      const mostrar = combinaTema && combinaTermo;
      item.hidden = !mostrar;
      if (mostrar) visiveis += 1;
      if (!mostrar) fechar(item);
    });

    if (contador) {
      contador.textContent =
        visiveis === total ? `${total} redações` : `${visiveis} de ${total} redações`;
    }
    if (vazio) vazio.hidden = visiveis !== 0;
    if (limpar) limpar.hidden = !estado.termo;

    temas.forEach((botao) => {
      botao.setAttribute('aria-pressed', String(botao.dataset.tema === estado.tema));
    });
  };

  if (campo) {
    campo.addEventListener(
      'input',
      debounce(() => {
        estado.termo = campo.value;
        aplicar();
      }),
    );
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

  /* botão "limpar busca e filtros" do estado vazio */
  const limparTudo = $('#limpar-tudo');
  if (limparTudo) {
    limparTudo.addEventListener('click', () => {
      estado.termo = '';
      estado.tema = 'todas';
      if (campo) campo.value = '';
      aplicar();
      if (campo) campo.focus();
    });
  }

  /* atalho: tecla "/" foca a busca */
  document.addEventListener('keydown', (evento) => {
    if (evento.key !== '/' || !campo) return;
    const digitando = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if (digitando) return;
    evento.preventDefault();
    campo.focus();
  });

  aplicar();
}

/* =============================================================================
   04. VOLTAR AO TOPO
   ============================================================================= */
function iniciarBotaoTopo() {
  const botao = $('.topo');
  if (!botao) return;

  const atualizar = () => {
    const visivel = window.scrollY > 600;
    if (visivel && botao.hidden) botao.hidden = false;
    botao.classList.toggle('is-visivel', visivel);
    if (!visivel) {
      setTimeout(() => {
        if (window.scrollY <= 600) botao.hidden = true;
      }, 320);
    }
  };

  atualizar();
  window.addEventListener('scroll', atualizar, { passive: true });

  botao.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* =============================================================================
   INICIALIZAÇÃO
   ============================================================================= */
document.addEventListener('DOMContentLoaded', () => {
  aplicarConfig();
  iniciarCabecalho();
  iniciarRevelacoes();
  iniciarRedacoes();
  iniciarBotaoTopo();
});