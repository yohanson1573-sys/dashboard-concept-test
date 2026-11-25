/* Прототип итерации 30. Один файл состояния, полная перерисовка на каждое изменение.
   Данные придуманы (как и в макете), источник состояний — кадры 1–11 итерации 28. */

const NB = ' ';
const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, NB) + NB + '₽';
const fmtRub = n => {
  const [i, f] = n.toFixed(2).split('.');
  return i.replace(/\B(?=(\d{3})+(?!\d))/g, NB) + ',' + f + NB + 'RUB';
};
const plural = (n, a, b, c) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? b : c; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const I = name => `img/${name}.png`;

/* ---------- значки ---------- */
const chev = (dir = 'r', size = 16) => {
  const d = { r: 'M6 3.5l4.5 4.5L6 12.5', l: 'M10 3.5L5.5 8l4.5 4.5', d: 'M3.5 6L8 10.5 12.5 6' }[dir];
  return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" class="st__chev"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
};
const swArrow = dir => `<svg width="10" height="14" viewBox="0 0 10 14"><path d="${dir === 'l' ? 'M7.5 1.5L2 7l5.5 5.5' : 'M2.5 1.5L8 7l-5.5 5.5'}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const xIcon = (s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;
const clockIcon = `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="currentColor"/><path d="M8 4.5V8l2.2 1.6" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>`;
const eyeIcon = `<svg width="20" height="20" viewBox="0 0 20 20"><path d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="10" cy="10" r="2.2" fill="currentColor"/></svg>`;
const eyeOffIcon = `<svg width="20" height="20" viewBox="0 0 20 20"><path d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3.5 3.5l13 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;
const gearIcon = `<svg width="20" height="20" viewBox="0 0 20 20"><path d="M10 6.8a3.2 3.2 0 100 6.4 3.2 3.2 0 000-6.4z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8.6 2.5h2.8l.5 2.1 1.6.9 2-.7 1.4 2.4-1.6 1.5v1.8l1.6 1.5-1.4 2.4-2-.7-1.6.9-.5 2.1H8.6l-.5-2.1-1.6-.9-2 .7-1.4-2.4 1.6-1.5V9.1L3.1 7.6l1.4-2.4 2 .7 1.6-.9z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
const checkIcon = `<svg width="28" height="28" viewBox="0 0 28 28"><path d="M7 14.5l4.5 4.5L21 9.5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const cbIcon = `<svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 6.2l2.3 2.3 4.7-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ptsHtml = n => `<span class="pts"><span class="ico-a">A</span><span class="amt">${n}${NB}баллов</span></span>`;

/* ---------- справочники ---------- */
const STATUS = {
  pay:   { n: 'Оплатить', s: 'счета и платежи к оплате', ic: 'st_pay', act: 'Оплатить' },
  sign:  { n: 'Подписать', s: 'готовы, нужна ваша подпись', ic: 'st_sign', act: 'Подписать и отправить' },
  send:  { n: 'Отправить', s: 'подписаны, ещё не ушли в банк', ic: 'st_send', act: 'Отправить в банк' },
  fix:   { n: 'Доработать', s: 'банк вернул с замечанием', ic: 'st_fix', act: 'Исправить' },
  rej:   { n: 'Отклонённые', s: 'банк не принял, нужно исправить', ic: 'st_rej', act: 'Исправить' },
  draft: { n: 'Черновики', s: 'не дописаны, лежат только у вас', ic: 'st_draft', act: 'Дописать' },
  bank:  { n: 'В работе у банка', s: 'банк проверяет и проводит', ic: 'st_bank', act: null },
};
const ORDER = ['pay', 'sign', 'send', 'fix', 'rej', 'draft', 'bank'];
const ORDER_NEW = ['pay', 'sign', 'send', 'fix', 'rej', 'draft'];

const STEPS = {
  open:     { t: 'Счёт открыт', pic: 'done0', donePic: 'done0', noPts: true },
  topup:    { t: 'Пополнить счёт', q: 'Пополните счёт', tile: 'step_topup', pic: 'now_topup', donePic: 'done1', btn: 'Пополнить', nowS: 'Поступлений ещё не было, начните с пополнения', next: 'Когда счёт откроется' },
  firstPay: { t: 'Первый платёж контрагенту', q: 'Отправьте первый платёж контрагенту', tile: 'next0', pic: 'next0', donePic: 'done2', btn: 'Подписать', nowS: 'Платёж ИП Соколову уже готов, осталось подписать', next: 'Когда придёт счёт к оплате' },
  self:     { t: 'Перевести себе в Альфа-Банк', q: 'Переведите себе', tile: 'step_self', pic: 'next1', donePic: 'done3', btn: 'Перевести', nowS: 'Перевод себе без комиссии', next: 'Когда на счёте появятся деньги' },
  shield:   { t: 'Защита от блокировок', q: 'Включите защиту от блокировок', tile: 'next2', pic: 'next2', donePic: 'done4', btn: 'Включить', nowS: 'Проверит контрагента до платежа', next: 'После первых платежей контрагентам' },
  tax:      { t: 'Налоговая копилка', q: 'Подключите налоговую копилку', tile: 'step_tax', pic: 'now_tax', donePic: 'now_tax', btn: 'Подключить', nowS: 'Перед налогом копилка отложит деньги сама', next: 'Перед первым налогом' },
  sub:      { t: 'Подписка на переводы', q: 'Подключите подписку на переводы', tile: 'step_sub', pic: 'now_sub', donePic: 'now_sub', btn: 'Подключить', nowS: 'Два платежа на «Отправить» ушли бы без комиссии', next: 'Когда пойдут переводы контрагентам' },
};

const LONG_NAME = 'ООО «Торговый дом Северная звезда»';

/* ---------- сценарии ---------- */
const SCENARIOS = [
  { id: 'new', label: 'Новый клиент: пустой счёт' },
  { id: 'young', label: 'Знакомство идёт' },
  { id: 'working', label: 'Работающая компания' },
  { id: 'acc', label: 'Бухгалтер без права подписи' },
];
const SITUATIONS = [
  { id: 'normal', label: 'Обычный день' },
  { id: 'soon', label: 'Срочного нет' },
  { id: 'many', label: 'Много дел' },
  { id: 'alldone', label: 'Всё сделано' },
  { id: 'onbdone', label: 'Знакомство пройдено' },
];

const TODAY_ITEMS = {
  p124:  { id: 'p124', kind: 'Платёж', sum: 124500, who: 'ООО «Моулин Роз»', pic: 'hero_red', dl: 'до 16:00', left: 'ещё 2 ч 40 мин', bar: .62, why: 'Позже платёж уйдёт только завтра', btn: 'Подписать', status: 'sign' },
  inv18: { id: 'inv18', kind: 'Счёт', sum: 18400, who: 'ООО «Вектор»', pic: 'hero_invoice', dl: 'до 23:59', left: 'сегодня', bar: .45, why: 'Последний день оплаты по счёту', btn: 'Оплатить', status: 'pay' },
  p30:   { id: 'p30', kind: 'Платёж', sum: 30000, who: 'ИП Соколов А. В.', pic: 'hero_red', dl: 'до 16:00', left: 'ещё 2 ч 40 мин', bar: .62, why: 'Позже платёж уйдёт только завтра', btn: 'Подписать', status: 'sign', step: 'firstPay' },
  rent:  { id: 'rent', kind: 'Платёж', sum: 86000, who: 'ООО «Арендатор»', title: 'Аренда за декабрь', pic: 'hero_red', dl: 'до 16:00', left: 'ещё 2 ч 40 мин', bar: .62, why: 'Позже платёж уйдёт только завтра', btn: 'Подписать', status: 'sign' },
  sal:   { id: 'sal', kind: 'Платёж', sum: 412000, who: 'Сотрудники, 14 человек', title: 'Зарплата за ноябрь', pic: 'hero_red', dl: 'до 16:00', left: 'ещё 2 ч 40 мин', bar: .62, why: 'Позже зарплата уйдёт только завтра', btn: 'Подписать', status: 'sign' },
  /* итерация 30: четыре оплаты на сегодня в «Много дел» — вместе с inv18 это «Оплатить 4 на 96 800 ₽» */
  inv32: { id: 'inv32', kind: 'Счёт', sum: 32000, who: 'ООО «Техснаб»', pic: 'hero_invoice', dl: 'до 23:59', left: 'сегодня', bar: .45, why: 'Последний день оплаты по счёту', btn: 'Оплатить', status: 'pay' },
  inv24: { id: 'inv24', kind: 'Счёт', sum: 24400, who: 'ИП Морозова Е. С.', pic: 'hero_invoice', dl: 'до 23:59', left: 'сегодня', bar: .45, why: 'Последний день оплаты по счёту', btn: 'Оплатить', status: 'pay' },
  inv22: { id: 'inv22', kind: 'Счёт', sum: 22000, who: 'ООО «Клининг Про»', pic: 'hero_invoice', dl: 'до 23:59', left: 'сегодня', bar: .45, why: 'Последний день оплаты по счёту', btn: 'Оплатить', status: 'pay' },
};
const SOON_ITEMS = [
  { kind: 'ЕНП за ноябрь', sum: 112300, who: 'ФНС', pic: 'hero_cal', dl: '28 ноября', left: 'через 4 дня', why: 'Позже начнутся пени', btn: 'Подготовить платёж' },
  { kind: 'Аренда за декабрь', sum: 86000, who: 'ООО «Арендатор»', pic: 'hero_cal', dl: '1 декабря', left: 'через 7 дней', why: 'Срок по договору аренды', btn: 'Подготовить платёж' },
  { kind: 'Зарплата за ноябрь', sum: 412000, who: 'Сотрудники, 14 человек', pic: 'hero_cal', dl: '5 декабря', left: 'через 11 дней', why: 'Срок выплаты по трудовому договору', btn: 'Подготовить платёж' },
];

function preset(scn, sit) {
  const base = {
    scn, role: scn === 'acc' ? 'acc' : 'dir',
    balance: 12570880.95, accounts: '3 счёта в рублях', cards: '2 карты',
    statuses: { pay: [1, 18400], sign: [5, 845000], send: [2, 420900], fix: [1, 64900], rej: [2, 37500], draft: [1, 0], bank: [0, 0] },
    today: { mode: 'today', items: ['p124', 'inv18'] },
    onb: {
      done: [['open', 'Засчитан при открытии, без баллов'], ['topup', '3 сентября'], ['firstPay', '4 сентября'], ['self', '12 сентября'], ['shield', '2 октября']],
      now: [{ id: 'tax', attach: null, qs: 'шаг знакомства: налог через 4 дня, отложит деньги сама' }, { id: 'sub', attach: 'send', qs: 'шаг знакомства: 2 платежа выше ушли бы без комиссии' }],
      next: [], hidden: false,
    },
    lastClosed: null,
  };
  if (scn === 'working' || scn === 'acc') {
    if (sit === 'soon') base.today = { mode: 'soon' };
    if (sit === 'many') {
      base.statuses = { pay: [4, 96800], sign: [31, 4210000], send: [40, 7600500], fix: [7, 573000], rej: [3, 96200], draft: [1, 0], bank: [14, 0] };
      base.today = { mode: 'today', items: ['p124', 'rent', 'sal', 'inv18', 'inv32', 'inv24', 'inv22'] };
      base.onb.now[1].qs = 'шаг знакомства: 40 переводов выше ушли бы без комиссии';
    }
    if (sit === 'alldone') {
      for (const k in base.statuses) base.statuses[k] = [0, 0];
      base.today = { mode: 'soon' };
      base.onb.done.push(['sub', '18 ноября'], ['tax', '20 ноября']); base.onb.now = []; base.onb.hidden = true;
      base.lastClosed = 'сегодня в 11:20';
    }
    if (sit === 'onbdone') {
      base.today = { mode: 'soon' };
      base.onb.done.push(['sub', '18 ноября'], ['tax', 'сегодня']); base.onb.now = [];
    }
  }
  if (scn === 'new') {
    Object.assign(base, { balance: 0, accounts: '1 счёт в рублях', cards: 'Нет карт' });
    for (const k in base.statuses) base.statuses[k] = [0, 0];
    base.today = { mode: 'account' };
    base.onb = { done: [['open', 'Засчитан при открытии, без баллов']], now: [{ id: 'topup', attach: 'top', qs: 'шаг знакомства: поступлений ещё не было, реквизиты в колонке «Ваш счёт»' }], next: ['firstPay', 'self', 'shield', 'tax', 'sub'], hidden: false };
  }
  if (scn === 'young') {
    Object.assign(base, { balance: 289700, accounts: '1 счёт в рублях', cards: 'Нет карт' });
    base.statuses = { pay: [1, 18400], sign: [1, 30000], send: [0, 0], fix: [0, 0], rej: [0, 0], draft: [0, 0], bank: [0, 0] };
    base.today = { mode: 'today', items: ['p30', 'inv18'] };
    base.onb = { done: [['open', 'Засчитан при открытии, без баллов'], ['topup', '20 ноября']], now: [{ id: 'firstPay', attach: 'sign', qs: 'шаг знакомства: подпишите платёж выше, это первый платёж контрагенту', act: 'p30' }], next: ['self', 'shield', 'tax', 'sub'], hidden: false };
  }
  return base;
}

/* ---------- состояние ---------- */
const S = {
  scn: 'working', sit: 'normal', long: false,
  loading: false, page: 'dash', listStatus: 'sign', panel: false, todayIdx: 0, promo: true,
  sel: new Set(), modal: null, reminded: false, D: null,
};

function readHash() {
  const p = new URLSearchParams(location.hash.slice(1));
  if (p.get('s') && SCENARIOS.some(x => x.id === p.get('s'))) S.scn = p.get('s');
  if (p.get('d') && SITUATIONS.some(x => x.id === p.get('d'))) S.sit = p.get('d');
  S.long = p.get('long') === '1';
  if (p.get('bare') === '1') document.body.classList.add('bare');
  if (p.get('panel') === '1') S.openPanelOnLoad = true;
  if (p.get('after') === '1') S.afterOnLoad = true;
}
function writeHash() {
  const p = new URLSearchParams({ s: S.scn });
  if (S.scn === 'working' || S.scn === 'acc') p.set('d', S.sit);
  if (S.long) p.set('long', '1');
  if (document.body.classList.contains('bare')) p.set('bare', '1');
  history.replaceState(null, '', '#' + p.toString());
}

function reset(withLoading = true) {
  S.D = preset(S.scn, (S.scn === 'working' || S.scn === 'acc') ? S.sit : 'normal');
  Object.assign(S, { page: 'dash', panel: false, todayIdx: 0, promo: true, sel: new Set(), modal: null, reminded: false });
  document.getElementById('toasts')?.replaceChildren();
  writeHash();
  if (withLoading) { S.loading = true; render(); setTimeout(() => { S.loading = false; if (S.openPanelOnLoad) { S.panel = true; S.openPanelOnLoad = false; } render(); if (S.afterOnLoad) { S.afterOnLoad = false; const id = todayIds()[0]; if (id) doToday(id); } }, 650); }
  else render();
}

/* ---------- вычисления ---------- */
const isDir = () => S.D.role === 'dir';
const waitingKeys = () => isDir() ? ['pay', 'sign', 'send', 'fix', 'rej'] : ['pay', 'send', 'fix', 'rej'];
function totals() {
  const st = S.D.statuses;
  let total = 0, wn = 0, ws = 0;
  for (const k of ORDER) total += st[k][0];
  for (const k of waitingKeys()) { wn += st[k][0]; ws += st[k][1]; }
  return { total, wn, ws };
}
function points() {
  const done = S.D.onb.done.filter(([id]) => !STEPS[id].noPts).length;
  return done * 500 + (S.D.onb.done.length >= 7 ? 1000 : 0);
}
const doneCount = () => S.D.onb.done.length;
const companyName = () => S.long ? LONG_NAME : 'ООО «Город Нагатино»';
function todayItem(id) {
  const it = { ...TODAY_ITEMS[id] };
  if (S.long && id === S.D.today.items?.[0]) it.who = LONG_NAME;
  return it;
}

/* ---------- отрисовка ---------- */
const $app = () => document.getElementById('app');

function render() {
  const D = S.D;
  renderDemo();
  document.body.classList.toggle('hide-amt', !!S.hideAmt && S.page === 'dash');
  const html = `
    <aside class="side">${sideHtml()}</aside>
    <div class="body">
      <header class="hdr">${hdrHtml()}</header>
      <div class="scroll" id="scroll"><div class="content">
        ${S.page === 'dash' ? dashHtml() : listHtml()}
      </div></div>
    </div>
    ${S.panel ? `<div class="scrim" data-a="closePanel"></div><aside class="panel">${panelHtml()}</aside>` : ''}
    ${S.modal ? `<div class="mscrim" data-a="closeModal"><div class="modal" data-stop>${S.modal()}</div></div>` : ''}
    <div class="toasts" id="toasts"></div>`;
  const app = $app();
  const keepScroll = document.getElementById('scroll')?.scrollTop || 0;
  const toasts = document.getElementById('toasts');
  app.innerHTML = html;
  if (toasts) document.getElementById('toasts').replaceWith(toasts);
  document.getElementById('scroll').scrollTop = keepScroll;
  fit();
}

function renderDemo() {
  const workingLike = S.scn === 'working' || S.scn === 'acc';
  const opt = (list, cur) => list.map(x => `<option value="${x.id}" ${cur === x.id ? 'selected' : ''}>${x.label}</option>`).join('');
  document.getElementById('demo').innerHTML = `
    <span class="demo__note">Прототип, данные условные</span>
    <label class="demo__sel"><span>Компания</span><select data-ch="scn">${opt(SCENARIOS, S.scn)}</select></label>
    ${workingLike ? `<label class="demo__sel"><span>Ситуация</span><select data-ch="sit">${opt(SITUATIONS, S.sit)}</select></label>` : ''}
    <div class="demo__spacer"></div>
    <button class="chip ${S.long ? 'is-on' : ''}" data-a="long" title="Длинное название компании и контрагента">Длинное название</button>
    <button class="chip ${S.loading ? 'is-on' : ''}" data-a="loading">Загрузка</button>
    <button class="chip" data-a="reset">Сбросить</button>`;
}

function sideHtml() {
  const items = [
    ['menu_newpay', 'Новый платёж'], ['menu_feed', 'Лента операций'], ['menu_inwork', 'Платежи в работе', 'openList'],
    ['menu_import', 'Импорт реестров'], ['menu_statement', 'Выписка'], ['menu_accounts', 'Счета'],
    ['menu_contractors', 'Контрагенты'], ['menu_cards', 'Карты'],
  ];
  return `
    <button class="side__logo" data-a="home" title="На главную"><img src="${I('logo_alfa')}" alt="">Альфа-Бизнес</button>
    <button class="side__item" data-a="stub" data-v="Все сервисы"><img src="${I('menu_all')}" alt="">Все сервисы</button>
    <div class="side__div"></div>
    ${items.map(([ic, t, a]) => `<button class="side__item ${a && S.page === 'list' ? 'is-on' : ''} ${!a && S.page === 'dash' && false ? 'is-on' : ''}" data-a="${a || 'stub'}" data-v="${t}" ><img src="${I(ic)}" alt="">${t}</button>`).join('')}
    <div class="side__div"></div>
    <button class="side__item" data-a="stub" data-v="Госзакупки"><span class="side__gov"><img class="ring" src="${I('menu_gov_ring')}" alt=""><img class="ic" src="${I('menu_gov')}" alt=""></span>Госзакупки</button>
    <button class="side__item side__foot" data-a="stub" data-v="Настройка меню"><img src="${I('menu_settings')}" alt="">Настроить меню</button>`;
}

function hdrHtml() {
  const user = isDir() ? 'Набоков И.Д.' : 'Смирнова А. В., бухгалтер';
  return `
    <button class="hdr__btn" data-a="stub" data-v="Письма" aria-label="Письма"><img src="${I('hdr_mail')}" alt=""></button>
    <button class="hdr__btn" data-a="stub" data-v="Уведомления" aria-label="Уведомления"><img src="${I('hdr_bell')}" alt=""></button>
    <div class="hdr__div"></div>
    <button class="org" data-a="stub" data-v="Смена организации" title="${esc(companyName())}"><img src="${I('company_logo')}" alt=""><div><div class="org__name">${esc(companyName())}</div><div class="org__user">${user}</div></div></button>
    <div class="hdr__div"></div>
    <button class="hdr__btn" data-a="stub" data-v="Свернуть меню" aria-label="Свернуть меню"><img src="${I('hdr_panel')}" alt=""></button>`;
}

function dashHtml() {
  const qa = [['qa_statement', 'Скачать выписку'], ['qa_letter', 'Письмо в банк'], ['qa_import', 'Импорт платежей'], ['qa_create', 'Создать платёж'], ['qa_self', 'Себе в Альфа-Банк']];
  return `
    <div class="qa">
      ${qa.map(([ic, t]) => `<button class="qa__btn" data-a="stub" data-v="${t}"><img src="${I(ic)}" alt="">${t}</button>`).join('')}
      <button class="qa__btn qa__btn--more" data-a="stub" data-v="Ещё">Ещё</button>
    </div>
    <div class="line1">
      ${balHtml()}
      <section class="today">${S.loading ? todaySkel() : todayHtml()}</section>
      <div class="banners"><img src="${I('banners')}" alt="Накопительный счёт, кредитная карта, гарантии"></div>
    </div>
    <div class="tabs">
      <div class="tabs__names">
        <button class="tab is-on">Дела</button>
        <button class="tab" data-a="stub" data-v="Сводка">Сводка</button>
        <button class="tab" data-a="stub" data-v="Мультибанк">Мультибанк</button>
      </div>
      <div class="seg" role="group" aria-label="Суммы на главной">
        <button class="${S.hideAmt ? '' : 'is-on'}" data-a="amt" data-v="show" aria-label="Показать суммы" aria-pressed="${!S.hideAmt}">${eyeIcon}</button>
        <button class="${S.hideAmt ? 'is-on' : ''}" data-a="amt" data-v="hide" aria-label="Скрыть суммы" aria-pressed="${!!S.hideAmt}">${eyeOffIcon}</button>
      </div>
      <button class="gear" data-a="stub" data-v="Настройка дашборда" aria-label="Настройка дашборда">${gearIcon}</button>
    </div>
    <section class="deals">${S.loading ? dealsSkel() : dealsHtml()}</section>`;
}

function balHtml() {
  const D = S.D;
  return `
    <section class="bal">
      <div class="bal__top">
        <div class="bal__sum amt">${fmtRub(D.balance)}</div>
        ${S.promo ? `<div class="bal__promo">
          <img src="${I('bal_plus')}" alt="">
          <div><div class="bal__promo-amt"><span class="amt">5${NB}000${NB}000${NB}RUB</span><span class="badge">Доступно к подключению</span></div>
          <div class="bal__promo-sub">Переводите себе бесплатно</div></div>
          <span class="bal__x" aria-hidden="true">${xIcon(12)}</span>
        </div>` : ''}
        <div class="bal__prods" style="${S.promo ? '' : 'top:120px'}">
          <button class="prod" data-a="stub" data-v="Счета"><img src="${I('bal_accounts')}" alt=""><div><div class="prod__n">Счета</div><div class="prod__v">${D.accounts}</div></div></button>
          <button class="prod" data-a="stub" data-v="Бизнес-карты"><img src="${I('bal_cards')}" alt=""><div><div class="prod__n">Бизнес-карты</div><div class="prod__v">${D.cards}</div></div></button>
          <button class="prod" data-a="spend"><img src="${I('bal_points')}" alt=""><div><div class="prod__n">Баллы</div><div class="prod__v amt">${points().toLocaleString('ru-RU').replace(/\s/g, NB)}${NB}${plural(points(), 'балл', 'балла', 'баллов')}</div></div></button>
        </div>
      </div>
      <div class="bal__foot"><button data-a="reqs">Реквизиты</button><button data-a="stub" data-v="Тарифы и подписки">Тарифы и подписки</button></div>
    </section>`;
}

/* --- колонка «Сегодня» --- */
function todayHtml() {
  const T = S.D.today;
  if (T.mode === 'account') return accountHtml();
  if (T.mode === 'soon' || !T.items || !T.items.length) return soonHtml();
  if (T.mode === 'list') return todayListHtml();
  const items = T.items;
  const idx = Math.min(S.todayIdx, items.length - 1);
  const it = todayItem(items[idx]);
  const acc = !isDir() && it.status === 'sign';
  const why = acc ? `Подписывает Набоков И.${NB}Д.<br>${it.why}` : it.why;
  const btn = todayBtn(it);
  return `
    <div class="today__top">
      <div class="today__head">
        <div class="ttl">Сегодня <span class="cnt cnt--red">${items.length}</span></div>
        ${items.length > 1 ? `<div class="sw">
          <button aria-label="Предыдущее" data-a="tIdx" data-v="-1" ${idx === 0 ? 'disabled' : ''}>${swArrow('l')}</button>
          <span>${idx + 1} из ${items.length}</span>
          <button aria-label="Следующее" data-a="tIdx" data-v="1" ${idx === items.length - 1 ? 'disabled' : ''}>${swArrow('r')}</button>
        </div>` : ''}
      </div>
      <div>
        <div class="hero__head"><img src="${I(it.pic)}" alt=""><div>
          <div class="hero__kind">${it.title || it.kind}</div>
          <div class="hero__sum amt">${fmt(it.sum)}</div>
          <div class="hero__meta">${esc(it.who)}</div>
        </div></div>
        <div class="dl">
          <div class="dl__big"><span class="dl__val">${it.dl}</span><span class="dl__left">${it.left}</span></div>
          <div class="bar"><i style="width:${it.bar * 100}%"></i></div>
          <div class="dl__why">${why}</div>
        </div>
        ${items.length > 1 ? `<button class="link" style="margin-top:16px" data-a="openList" data-v="today">Все ${items.length} на${NB}сегодня · ${fmt(items.reduce((a, id) => a + todayItem(id).sum, 0))} ${chev('r')}</button>` : ''}
      </div>
    </div>
    <div class="today__bottom">${btn}</div>`;
}

/* Бухгалтер без права подписи: платеж на подпись — только напомнить, счет — подготовить платеж на подпись руководителю */
function todayBtn(it) {
  if (!isDir() && it.status === 'sign') return S.reminded
    ? `<button class="btn btn--gray btn--wide" disabled>Напомнили руководителю в 13:20</button>`
    : `<button class="btn btn--dark btn--wide" data-a="remind">Напомнить руководителю</button>`;
  const label = !isDir() && it.status === 'pay' ? 'Подготовить платёж' : it.btn;
  return `<button class="btn btn--dark btn--wide" data-a="doToday" data-v="${it.id}">${label}</button>`;
}

function todayListHtml() {
  const T = S.D.today;
  const [first, ...rest] = T.items;
  const it = todayItem(first);
  return `
    <div class="today__top" style="gap:20px">
      <div class="today__head"><div class="ttl">Сегодня <span class="cnt cnt--red">${T.total}</span></div></div>
      <div>
        <div class="hero__head"><img src="${I(it.pic)}" alt=""><div>
          <div class="hero__kind">${it.kind}</div>
          <div class="hero__sum amt">${fmt(it.sum)}</div>
          <div class="hero__meta">${esc(it.who)}</div>
        </div></div>
        <div class="dl" style="margin-top:20px">
          <div class="dl__big"><span class="dl__val">${it.dl}</span><span class="dl__left">${it.left}</span></div>
          <div class="bar"><i style="width:${it.bar * 100}%"></i></div>
        </div>
        <div style="margin-top:16px">${todayBtn(it)}</div>
        <div style="margin-top:12px">
          ${rest.slice(0, 2).map(id => { const r = TODAY_ITEMS[id]; return `<button class="urow" data-a="openList" data-v="sign">${clockIcon}<b>${r.title}</b><span class="amt">${fmt(r.sum)}</span></button>`; }).join('')}
        </div>
        <button class="link" style="margin-top:8px" data-a="openList" data-v="sign">Все ${T.total} на сегодня ${chev('r')}</button>
      </div>
    </div>`;
}

function soonHtml() {
  const idx = Math.min(S.todayIdx, SOON_ITEMS.length - 1);
  const it = SOON_ITEMS[idx];
  return `
    <div class="today__top">
      <div class="today__head">
        <div class="ttl">Скоро <span class="cnt cnt--gray">${SOON_ITEMS.length}</span></div>
        <div class="sw">
          <button aria-label="Предыдущее" data-a="tIdx" data-v="-1" ${idx === 0 ? 'disabled' : ''}>${swArrow('l')}</button>
          <span>${idx + 1} из ${SOON_ITEMS.length}</span>
          <button aria-label="Следующее" data-a="tIdx" data-v="1" ${idx === SOON_ITEMS.length - 1 ? 'disabled' : ''}>${swArrow('r')}</button>
        </div>
      </div>
      <div>
        <div class="hero__head"><img src="${I(it.pic)}" alt=""><div>
          <div class="hero__kind">${it.kind}</div>
          <div class="hero__sum amt">${fmt(it.sum)}</div>
          <div class="hero__meta">${esc(it.who)}</div>
        </div></div>
        <div class="dl">
          <div class="dl__big"><span class="dl__val">${it.dl}</span><span class="dl__left">${it.left}</span></div>
          <div class="dl__why" style="margin-top:16px">${it.why}</div>
        </div>
      </div>
    </div>
    <div class="today__bottom"><button class="btn btn--dark btn--wide" data-a="prepare" data-v="${idx}">${it.btn}</button></div>`;
}

function accountHtml() {
  return `
    <div class="today__top">
      <div class="today__head"><div class="ttl">Ваш счёт</div></div>
      <div>
        <div class="hero__head" style="align-items:center"><img src="${I('hero_blue')}" alt=""><div style="font-size:14px;line-height:20px">Счёт открыт и готов принимать деньги</div></div>
        <div class="req" style="margin-top:16px">
          <div><small>Получатель</small>${esc(companyName())}</div>
          <div><small>Счёт</small>40702${NB}810${NB}2${NB}0430${NB}0012345</div>
          <div><small>БИК</small>044525593</div>
        </div>
      </div>
    </div>
    <div class="today__bottom"><button class="btn btn--dark btn--wide" data-a="copyReq">Скопировать реквизиты</button></div>`;
}

function todaySkel() {
  return `<div class="today__top">
    <div class="sk" style="width:90px;height:20px"></div>
    <div style="display:flex;gap:12px"><div class="sk" style="width:48px;height:48px;border-radius:12px"></div><div style="flex:1;display:grid;gap:8px"><div class="sk" style="width:140px;height:12px"></div><div class="sk" style="width:100px;height:20px"></div></div></div>
    <div class="sk" style="width:170px;height:32px"></div><div class="sk" style="height:4px"></div><div class="sk" style="width:200px;height:12px"></div>
  </div><div class="sk" style="height:32px;margin:0 0"></div>`;
}

/* --- блок дел --- */
function dealsHtml() {
  const D = S.D;
  const { total, wn, ws } = totals();
  const st = S.D.statuses;
  /* сколько из суммы «ждут вас» приходится на сегодня: у бухгалтера платежи на подпись не его */
  const tSum = todayIds().map(id => TODAY_ITEMS[id]).filter(it => isDir() || it.status !== 'sign').reduce((x, it) => x + it.sum, 0);
  const allDone = S.scn !== 'new' && wn === 0 && st.draft[0] === 0 && (isDir() || st.sign[0] === 0);
  let sum;
  if (S.scn === 'new') {
    sum = `<div class="sum__ttl">Что ждёт вас</div><div><div class="sum__lbl">Дел пока нет</div><div class="sum__lbl sum__hint">Здесь появится сумма счетов и${NB}платежей, которые ждут вас</div></div><div class="sum__space"></div>${onbCardHtml()}`;
  } else if (allDone) {
    sum = `<div class="sum__ttl">Что ждёт вас</div>
      <div><div class="sum__lbl">Последнее закрыто ${D.lastClosed || 'только что'}</div><div class="sum__total">Всё сделано</div></div>
      ${D.onb.hidden ? `<img src="${I('book180')}" alt="" style="width:180px;height:180px;margin-top:8px"><div class="sum__space"></div><div class="sum__lbl">Новые дела появятся здесь</div>` : `<div class="sum__space"></div>${onbCardHtml()}`}`;
  } else {
    sum = `<div class="sum__ttl">Что ждёт вас</div>
      <div class="sumcard"><div class="sum__lbl">Ждут вас ${wn} из${NB}${total}${NB}${total % 10 === 1 && total % 100 !== 11 ? 'дела' : 'дел'}</div><div class="sum__total amt">${fmt(ws)}</div>
        ${sharesHtml(ws)}
        ${tSum ? `<div class="sum__lbl">Из них на${NB}сегодня <span class="amt">${fmt(tSum)}</span></div>` : ''}</div>
      ${D.onb.hidden ? '' : onbCardHtml()}`;
  }
  return `<div class="sum">${sum}</div><div class="vdiv"></div><div class="queue">${queueHtml()}</div>`;
}

/* доли суммы «ждут вас» по типам документов: цвета те же, что у значков статусов */
const SHARE_COL = { pay: '#897EFF', sign: '#3193FC', send: '#0CC44D', fix: '#EA8313', rej: '#EC2D20' };
function sharesHtml(ws) {
  if (!ws) return '';
  const parts = waitingKeys().map(k => [k, S.D.statuses[k][1]]).filter(([, v]) => v > 0);
  return `<div class="shares" aria-hidden="true">${parts.map(([k, v]) => `<i style="flex:${v} 1 0;background:${SHARE_COL[k]}"></i>`).join('')}</div>`;
}

function onbCardHtml() {
  const D = S.D, dc = doneCount(), pts = points();
  const bars = Array.from({ length: 7 }, (_, i) => `<i class="${i < dc ? 'on' : ''}"></i>`).join('');
  if (dc >= 7) {
    return `<div class="onb onb--done">
      <div class="onb__head">Знакомство с банком</div>
      <div class="prog"><div class="prog__steps">${bars}</div><span class="prog__cnt">7 из 7</span></div>
      <div class="onb__earned" style="margin-top:24px">+1${NB}000 баллов</div>
      <div class="onb__goal" style="max-width:none">всего за знакомство 4${NB}000</div>
      <div class="onb__actions">
        <button class="btn btn--white" data-a="spend">На что потратить</button>
        <button class="link" data-a="hideOnb">Скрыть</button>
      </div>
      <img class="onb__pic onb__pic--done" src="${I('gift130')}" alt="">
    </div>`;
  }
  let cap, big, goal;
  if (!isDir()) { cap = 'Получено компанией'; big = `${pts.toLocaleString('ru-RU').replace(/\s/g, NB)} баллов`; goal = 'Шаги подключает руководитель'; }
  else if (pts === 0) { cap = 'Получено'; big = '0 баллов'; goal = `из 3${NB}000 за шаги<br>и бонус 1${NB}000`; }
  else { cap = 'Получено'; big = `${pts.toLocaleString('ru-RU').replace(/\s/g, NB)} баллов`; goal = `из 3${NB}000 за шаги<br>и бонус 1${NB}000`; }
  return `<div class="onb" role="button" tabindex="0" data-a="openPanel">
    <div class="onb__head">Знакомство с банком ${chev('r')}</div>
    <div class="prog"><div class="prog__steps">${bars}</div><span class="prog__cnt">${dc} из 7</span></div>
    <div class="onb__cap">${cap}</div>
    <div class="onb__earned">${big}</div>
    <div class="onb__goal">${goal}</div>
    <img class="onb__pic" src="${I('gift130')}" alt="">
  </div>`;
}

function stepRowHtml(n, indent) {
  const st = STEPS[n.id];
  const btn = isDir() ? `<button class="btn btn--white" data-a="stepGo" data-v="${n.id}">${n.btn || st.btn}</button>` : '';
  return `<div class="st step ${indent ? 'step--in' : ''} ${n.fresh ? 'is-new' : ''}" data-a="openPanel">
    <div class="step__img"><img src="${I(st.tile)}" alt=""></div>
    <div class="st__txt"><div class="st__n">${st.q}</div><div class="st__s">${esc(n.qs)}</div></div>
    ${ptsHtml(500)}${btn}
  </div>`;
}

function statusRowHtml(k) {
  const [c, s] = S.D.statuses[k];
  let { n, s: sub, ic } = STATUS[k];
  if (k === 'sign' && !isDir()) { n = 'Ждут подписи руководителя'; sub = `подписывает Набоков И.${NB}Д.`; ic = 'st_sign_wait'; }
  if (c === 0) return `<div class="st st--zero"><img src="${I(ic)}" alt=""><div class="st__txt"><div class="st__n">${n}</div><div class="st__s">${sub}</div></div><span class="st__zero">0</span></div>`;
  return `<button class="st st--link" data-a="openList" data-v="${k}">
    <img src="${I(ic)}" alt="">
    <div class="st__txt"><div class="st__n">${n}</div><div class="st__s">${sub}</div></div>
    ${s ? `<span class="st__sum amt">${fmt(s)}</span>` : ''}
    <span class="cnt cnt--gray">${c}</span>${chev('r')}
  </button>`;
}

function queueHtml() {
  const D = S.D;
  const showSteps = isDir() && !D.onb.hidden;
  const now = showSteps ? D.onb.now : [];
  const keys = (D.statuses.bank[0] > 0 ? ORDER : ORDER_NEW);
  let out = '';
  now.filter(n => n.attach === 'top').forEach(n => out += stepRowHtml(n, false));
  for (const k of keys) {
    out += statusRowHtml(k);
    now.filter(n => n.attach === k && D.statuses[k][0] > 0).forEach(n => out += stepRowHtml(n, true));
  }
  now.filter(n => !n.attach || (n.attach !== 'top' && D.statuses[n.attach][0] === 0)).forEach(n => out += stepRowHtml(n, false));
  return out;
}

function dealsSkel() {
  const row = `<div style="display:flex;gap:12px;align-items:center;height:52px;padding:6px 8px"><div class="sk" style="width:40px;height:40px;border-radius:12px"></div><div style="flex:1;display:grid;gap:8px"><div class="sk" style="width:160px;height:12px"></div><div class="sk" style="width:220px;height:8px"></div></div><div class="sk" style="width:90px;height:12px"></div></div>`;
  return `<div class="sum"><div class="sk" style="width:110px;height:16px"></div><div class="sk" style="width:150px;height:10px"></div><div class="sk" style="width:200px;height:30px"></div><div class="sum__space"></div><div class="sk" style="height:210px;border-radius:16px"></div></div>
    <div class="vdiv"></div><div class="queue">${row.repeat(8)}</div>`;
}

/* --- раздел «Платежи в работе» (дорисовано: в кадрах только подпись «куда ведёт строка») --- */
const NAMES = ['ООО «Моулин Роз»', 'ООО «СтройМаркет»', 'АО «Энергосбыт»', 'ООО «Логистик Про»', 'ИП Кузнецова Е. М.', 'ООО «Офис Плюс»', 'ООО «Вектор»', 'ООО «Арендатор»', 'ООО «Медиагрупп»', 'ИП Соколов А. В.'];
const PURPOSE = ['Оплата по счёту', 'Поставка материалов', 'Электроэнергия за ноябрь', 'Доставка грузов', 'Услуги по договору', 'Канцтовары', 'Аренда офиса', 'Реклама за ноябрь'];
function rowsFor(k) {
  const [c, s] = S.D.statuses[k];
  if (!c) return [];
  const n = Math.min(c, 8);
  const rows = [];
  if (k === 'sign' && S.D.today.items?.includes('p124')) rows.push({ who: S.long ? LONG_NAME : 'ООО «Моулин Роз»', what: 'Оплата по договору 14/11', date: 'сегодня до 16:00', sum: 124500 });
  if (k === 'sign' && S.scn === 'young') rows.push({ who: 'ИП Соколов А. В.', what: 'Оплата по счёту 112', date: 'сегодня до 16:00', sum: 30000 });
  if (k === 'pay' && S.D.today.items?.includes('inv18')) rows.push({ who: 'ООО «Вектор»', what: 'Счёт 2041 от 18.11', date: 'сегодня до 23:59', sum: 18400 });
  let left = s - rows.reduce((a, r) => a + r.sum, 0);
  const need = n - rows.length;
  for (let i = 0; i < need; i++) {
    const part = i === need - 1 ? left : Math.round(left / (need - i) * (0.6 + ((i * 37) % 9) / 10) / 100) * 100;
    left -= part;
    rows.push({ who: NAMES[(i + k.length * 3) % NAMES.length], what: PURPOSE[(i + k.length) % PURPOSE.length], date: ['25 ноября', '26 ноября', '27 ноября', '28 ноября', '2 декабря'][i % 5], sum: s ? part : 0 });
  }
  return rows;
}

/* Дела на сегодня: то же, что листает колонка «Сегодня», одним списком */
function todayIds() {
  const T = S.D.today;
  return T.mode === 'today' && T.items ? T.items : [];
}
function todayTabHtml(ids) {
  if (!ids.length) return `<div class="tbl"><div class="empty"><b>На сегодня всё сделано</b>Срочных дел не осталось</div></div>`;
  const sum = ids.reduce((a, id) => a + TODAY_ITEMS[id].sum, 0);
  return `
    <div class="lsum">${ids.length} ${plural(ids.length, 'дело', 'дела', 'дел')} на сегодня · <span class="amt">${fmt(sum)}</span></div>
    <div class="tbl">
      <div class="tr tr--h"><span></span><span>Контрагент</span><span>Назначение</span><span>Срок</span><span class="r">Сумма</span><span></span></div>
      ${ids.map(id => { const it = todayItem(id);
        const btn = !isDir() && it.status === 'sign'
          ? (S.reminded ? `<button class="btn btn--gray" disabled>Напомнили в 13:20</button>` : `<button class="btn btn--gray" data-a="remind">Напомнить</button>`)
          : `<button class="btn btn--gray" data-a="todayRow" data-v="${id}">${!isDir() && it.status === 'pay' ? 'Подготовить платёж' : it.btn}</button>`;
        return `<div class="tr"><span></span>
          <span>${esc(it.who)}</span><span>${it.title || it.kind}</span><span>сегодня ${it.dl}</span>
          <span class="r amt">${fmt(it.sum)}</span><span class="r">${btn}</span></div>`; }).join('')}
    </div>`;
}

function listHtml() {
  const tIds = todayIds();
  const k = S.listStatus;
  const st = S.D.statuses;
  const todayTab = tIds.length || k === 'today' ? `<button class="ltab ${k === 'today' ? 'is-on' : ''}" data-a="lTab" data-v="today">На сегодня <span class="cnt cnt--red">${tIds.length}</span></button>` : '';
  if (k === 'today') {
    const t = (st.bank[0] ? ORDER : ORDER_NEW).map(key => {
      let n = STATUS[key].n; if (key === 'sign' && !isDir()) n = 'Ждут подписи руководителя';
      return `<button class="ltab" data-a="lTab" data-v="${key}" ${st[key][0] ? '' : 'disabled'}>${n} <span class="cnt cnt--gray">${st[key][0]}</span></button>`;
    }).join('');
    return `<div>
    <button class="crumb" data-a="home">${chev('l')} Главная</button>
    <div class="h1">Платежи в работе</div>
    <div class="ltabs">${todayTab}${t}</div>
    ${todayTabHtml(tIds)}
  </div>`;
  }
  const tabs = todayTab + (st.bank[0] ? ORDER : ORDER_NEW).map(key => {
    let n = STATUS[key].n; if (key === 'sign' && !isDir()) n = 'Ждут подписи руководителя';
    return `<button class="ltab ${key === k ? 'is-on' : ''}" data-a="lTab" data-v="${key}" ${st[key][0] ? '' : 'disabled'}>${n} <span class="cnt cnt--gray">${st[key][0]}</span></button>`;
  }).join('');
  const rows = rowsFor(k);
  const canAct = STATUS[k].act && !(k === 'sign' && !isDir());
  const actLabel = k === 'sign' ? 'Подписать' : (k === 'pay' && !isDir()) ? 'Подготовить платёж' : STATUS[k].act;
  const bulkLabel = k === 'sign' ? 'Подписать и отправить' : actLabel;
  const sel = S.sel;
  const selSum = [...sel].reduce((a, i) => a + (rows[i]?.sum || 0), 0);
  const all = rows.length && sel.size === rows.length;
  const table = rows.length ? `
    <div class="tbl">
      <div class="tr tr--h">
        ${canAct ? `<button class="cb ${all ? 'is-on' : ''}" data-a="selAll" aria-label="Выбрать все" aria-pressed="${all}">${all ? cbIcon : ''}</button>` : '<span></span>'}
        <span>Контрагент</span><span>Назначение</span><span>Срок</span><span class="r">Сумма</span><span></span>
      </div>
      ${rows.map((r, i) => `<div class="tr">
        ${canAct ? `<button class="cb ${sel.has(i) ? 'is-on' : ''}" data-a="sel" data-v="${i}" aria-label="Выбрать платёж" aria-pressed="${sel.has(i)}">${sel.has(i) ? cbIcon : ''}</button>` : '<span></span>'}
        <span>${esc(r.who)}</span><span>${r.what}</span><span>${r.date}</span>
        <span class="r amt">${r.sum ? fmt(r.sum) : '—'}</span>
        <span class="r">${canAct ? `<button class="btn btn--gray" data-a="rowAct" data-v="${i}">${actLabel}</button>` : ''}</span>
      </div>`).join('')}
      ${st[k][0] > rows.length ? `<button class="tbl__more" data-a="stub" data-v="Показать ещё">Показать ещё ${st[k][0] - rows.length}</button>` : ''}
    </div>` : (ORDER.some(key => st[key][0])
      ? `<div class="tbl"><div class="empty"><b>Здесь пусто</b>В статусе «${STATUS[k].n}» сейчас ничего нет</div></div>`
      : `<div class="tbl"><div class="empty"><b>Платежей в работе пока нет</b>Сюда попадут платежи, которые ждут подписи, отправки или правки</div></div>`);
  const accNote = k === 'sign' && !isDir() && rows.length ? `<div class="note">Эти платежи подписывает Набоков И.${NB}Д. У вас нет права подписи.
      ${S.reminded ? `<button class="btn btn--gray" disabled>Напомнили в 13:20</button>` : `<button class="btn btn--dark" data-a="remind">Напомнить руководителю</button>`}</div>` : '';
  const bulk = canAct && sel.size ? `<div class="bulk"><span>Выбрано ${sel.size} на <span class="amt">${fmt(selSum)}</span></span>
      <button class="btn" data-a="bulk">${bulkLabel}</button></div>` : '';
  return `<div>
    <button class="crumb" data-a="home">${chev('l')} Главная</button>
    <div class="h1">Платежи в работе</div>
    <div class="ltabs">${tabs}</div>
    ${accNote}${table}${bulk}
  </div>`;
}

/* --- панель «Знакомство с банком» --- */
function panelHtml() {
  const D = S.D, dc = doneCount(), pts = points();
  const bars = Array.from({ length: 7 }, (_, i) => `<i class="${i < dc ? 'on' : ''}"></i>`).join('');
  const left = 7 - dc;
  const goal = dc >= 7 ? `Все шаги пройдены, бонус 1${NB}000 начислен`
    : pts === 0 ? `Баллы начнутся со второго шага. За${NB}все семь бонус 1${NB}000`
    : `Баллов начислено за шаги. Ещё ${left} ${plural(left, 'шаг', 'шага', 'шагов')} до${NB}бонуса 1${NB}000`;
  const stepPts = D.onb.done.filter(([id]) => !STEPS[id].noPts).length * 500;
  const now = D.onb.now.map(n => {
    const st = STEPS[n.id];
    return `<div class="pnow ${n.fresh ? 'is-new' : ''}">
      <div class="pnow__top"><img src="${I(st.pic)}" alt=""><div><div class="pnow__n">${st.t}</div><div class="pnow__s">${st.nowS}</div></div></div>
      <div class="pnow__bottom">${ptsHtml(500)}${isDir() ? `<button class="btn btn--dark" data-a="stepGo" data-v="${n.id}">${n.btn || st.btn}</button>` : `<span class="pts" style="color:var(--text-2);font-weight:400">Подключает руководитель</span>`}</div>
    </div>`;
  }).join('');
  const next = D.onb.next.map(id => {
    const st = STEPS[id];
    return `<div class="prow prow--next"><div class="prow__pic"><img src="${I(st.pic)}" alt=""></div><div class="prow__t"><div class="prow__n">${st.t}<br>${st.next}</div></div>${ptsHtml(500)}</div>`;
  }).join('');
  const done = D.onb.done.map(([id, date]) => {
    const st = STEPS[id];
    const usesBadge = st.donePic === st.pic && id !== 'open';
    return `<div class="prow"><div class="prow__pic ${usesBadge ? 'chk' : ''}"><img src="${I(st.donePic)}" alt=""></div><div class="prow__t"><div class="prow__n">${st.t}</div><div class="prow__s">${date}</div></div>${st.noPts ? '' : `<span class="pts"><span class="ico-a">A</span>+500</span>`}</div>`;
  }).join('');
  return `
    <div class="panel__head"><h2>Знакомство с банком</h2><button class="x" aria-label="Закрыть" data-a="closePanel">${xIcon(16)}</button></div>
    <div class="phero">
      <img src="${I('panel_gift')}" alt="">
      <div class="phero__big">${(dc >= 7 ? pts : stepPts).toLocaleString('ru-RU').replace(/\s/g, NB)} из ${dc >= 7 ? `4${NB}000` : `3${NB}000`}</div>
      <div class="prog"><div class="prog__steps">${bars}</div><span class="prog__cnt">${dc} из 7</span></div>
      <div class="phero__goal">${goal}</div>
      <button class="link" data-a="spend">На что потратить баллы ${chev('r')}</button>
    </div>
    ${now ? `<div class="pgroup"><div class="pgroup__t">Сейчас</div>${now}</div>` : ''}
    ${next ? `<div class="pgroup"><div class="pgroup__t">Дальше по вашим делам</div>${next}</div>` : ''}
    <div class="pgroup"><div class="pgroup__t">Сделано · ${dc}</div>${done}</div>
    ${!isDir() ? `<div class="pro-note">Шаги подключает тот, у кого есть право подписи. Баллы копятся на всю компанию.</div>` : ''}`;
}

/* ---------- уведомления и окна ---------- */
function toast(opts) {
  const box = document.getElementById('toasts');
  const el = document.createElement('div');
  if (typeof opts === 'string') { el.className = 'toast toast--plain'; el.textContent = opts; }
  else {
    el.className = 'toast';
    const bars = opts.progress != null ? `<div class="prog__steps">${Array.from({ length: 7 }, (_, i) => `<i class="${i < opts.progress ? 'on' : ''}"></i>`).join('')}</div>` : '';
    el.innerHTML = `${opts.pic ? `<img src="${I(opts.pic)}" alt="">` : ''}<div style="flex:1"><div class="toast__head"><div class="toast__t">${opts.t}</div>${opts.pts ? `<span class="pts"><span class="ico-a">A</span>${opts.pts}</span>` : ''}</div>${opts.s ? `<div class="toast__s">${opts.s}</div>` : ''}${bars}</div>`;
  }
  box.prepend(el);
  setTimeout(() => { el.classList.add('is-out'); setTimeout(() => el.remove(), 260); }, opts.ms || 4200);
}
function openModal(fn) { S.modal = fn; render(); }
function closeModal() { S.modal = null; render(); }

/* ---------- действия ---------- */
function busy(btn, ms, fn) {
  if (!btn) return fn();
  btn.classList.add('is-busy'); btn.innerHTML = `<span class="spin"></span>`;
  setTimeout(fn, ms);
}

function moveTo(from, to, n, sum) {
  const st = S.D.statuses;
  st[from][0] = Math.max(0, st[from][0] - n);
  st[from][1] = Math.max(0, st[from][1] - sum);
  st[to][0] += n; st[to][1] += sum;
}

function moveToBank(status, n, sum) {
  const st = S.D.statuses;
  st[status][0] = Math.max(0, st[status][0] - n);
  st[status][1] = Math.max(0, st[status][1] - sum);
  st.bank[0] += n;
  S.D.lastClosed = 'только что';
}

function completeStep(id, silent) {
  const D = S.D;
  const i = D.onb.now.findIndex(n => n.id === id);
  if (i === -1) return;
  D.onb.now.splice(i, 1);
  D.onb.done.push([id, 'сегодня']);
  if (!D.onb.now.length && D.onb.next.length) {
    const nid = D.onb.next.shift();
    const qs = { firstPay: 'шаг знакомства: отправьте платёж любому контрагенту', self: `шаг знакомства: на счёте ${fmt(D.balance).replace(NB + '₽', '')}${NB}₽, перевод себе без комиссии`, shield: 'шаг знакомства: проверит контрагента до платежа', tax: 'шаг знакомства: копилка отложит деньги на налог сама', sub: 'шаг знакомства: переводы контрагентам без комиссии' }[nid];
    D.onb.now.push({ id: nid, attach: null, qs, fresh: true, btn: nid === 'firstPay' ? 'Создать платёж' : null });
  }
  const dc = doneCount();
  if (!silent) {
    if (dc >= 7) toast({ pic: 'gift130', t: 'Знакомство пройдено', pts: `+1${NB}000`, s: `За все семь шагов начислен бонус. Всего за знакомство 4${NB}000 баллов.`, progress: 7, ms: 5200 });
    else toast({ pic: STEPS[id].pic, t: `${STEPS[id].t}: готово`, pts: '+500', s: 'Шаг знакомства закрыт', progress: dc });
  }
}

function doToday(id, btn) {
  const it = TODAY_ITEMS[id];
  busy(btn, 750, () => {
    const D = S.D;
    if (D.today.mode === 'list') { D.today.items = D.today.items.filter(x => x !== id); D.today.total -= 1; }
    else D.today.items = D.today.items.filter(x => x !== id);
    S.todayIdx = 0;
    if (!isDir() && it.status === 'pay') {
      moveTo('pay', 'sign', 1, it.sum);
      toast({ pic: 'hero_invoice', t: 'Платёж подготовлен', s: `${esc(it.who)}, ${fmt(it.sum)}. Ждёт подписи Набокова И.${NB}Д.` });
      return render();
    }
    moveToBank(it.status, 1, it.sum);
    D.balance -= it.sum; /* подписанный и оплаченный одинаково уходят со счёта */
    if (it.step && D.onb.now.some(n => n.id === it.step)) {
      completeStep(it.step, true);
      toast({ pic: 'toast_pic', t: 'Платёж подписан и отправлен', pts: '+500', s: 'Первый платёж контрагенту:<br>шаг знакомства закрыт', progress: doneCount(), ms: 5200 });
    } else {
      toast({ pic: it.status === 'pay' ? 'hero_invoice' : 'hero_red', t: it.status === 'pay' ? 'Счёт оплачен' : 'Платёж подписан и отправлен', s: `${esc(S.long && id === 'p124' ? LONG_NAME : it.who)}, ${fmt(it.sum)}. Банк проведёт его сегодня.` });
    }
    render();
  });
}

const MODALS = {
  sub: () => `<button class="x" aria-label="Закрыть" data-a="closeModal">${xIcon()}</button>
    <img class="modal__pic" src="${I('now_sub')}" alt="">
    <h3>Подписка на переводы</h3>
    <p>Переводы контрагентам без комиссии в пределах лимита. По вашим делам: 2 платежа на «Отправить» ушли бы без комиссии.</p>
    <div class="kv"><span>Стоимость</span><span>1${NB}490${NB}₽ в месяц</span><span>Первый месяц</span><span>бесплатно</span><span>Списание</span><span>со счёта …2345</span><span>За шаг знакомства</span><span>+500 баллов</span></div>
    <p>Отключить можно в «Тарифы и подписки» в любой момент.</p>
    <div class="modal__actions"><button class="btn btn--dark" data-a="confirmStep" data-v="sub">Подключить</button><button class="btn btn--gray" data-a="closeModal">Не сейчас</button></div>`,
  tax: () => `<button class="x" aria-label="Закрыть" data-a="closeModal">${xIcon()}</button>
    <img class="modal__pic" src="${I('now_tax')}" alt="">
    <h3>Налоговая копилка</h3>
    <p>Копилка будет откладывать часть каждого поступления, чтобы к сроку налога деньги уже лежали отдельно.</p>
    <div class="kv"><span>Откладывать</span><span>6% от поступлений</span><span>Ближайший налог</span><span>28 ноября</span><span>Стоимость</span><span>бесплатно</span><span>За шаг знакомства</span><span>+500 баллов</span></div>
    <div class="modal__actions"><button class="btn btn--dark" data-a="confirmStep" data-v="tax">Подключить</button><button class="btn btn--gray" data-a="closeModal">Не сейчас</button></div>`,
  shield: () => `<button class="x" aria-label="Закрыть" data-a="closeModal">${xIcon()}</button>
    <img class="modal__pic" src="${I('next2')}" alt="">
    <h3>Защита от блокировок</h3>
    <p>Перед каждым платежом банк проверит контрагента и подскажет, если платёж может привести к блокировке счёта.</p>
    <div class="kv"><span>Стоимость</span><span>бесплатно</span><span>За шаг знакомства</span><span>+500 баллов</span></div>
    <div class="modal__actions"><button class="btn btn--dark" data-a="confirmStep" data-v="shield">Включить</button><button class="btn btn--gray" data-a="closeModal">Не сейчас</button></div>`,
  self: () => `<button class="x" aria-label="Закрыть" data-a="closeModal">${xIcon()}</button>
    <img class="modal__pic" src="${I('next1')}" alt="">
    <h3>Перевод себе в Альфа-Банк</h3>
    <p>На личный счёт или карту Альфа-Банка без комиссии.</p>
    <label class="field">Сумма<input id="selfSum" value="50${NB}000" inputmode="numeric"></label>
    <div class="kv"><span>Со счёта</span><span>…2345, <span class="amt">${fmt(S.D.balance)}</span></span><span>Куда</span><span>карта Альфа-Банка …8841</span><span>Комиссия</span><span>0${NB}₽</span></div>
    <div class="modal__actions"><button class="btn btn--dark" data-a="confirmStep" data-v="self">Перевести</button><button class="btn btn--gray" data-a="closeModal">Отмена</button></div>`,
  topup: () => `<button class="x" aria-label="Закрыть" data-a="closeModal">${xIcon()}</button>
    <img class="modal__pic" src="${I('now_topup')}" alt="">
    <h3>Пополнить счёт</h3>
    <p>Переведите деньги с другого счёта по этим реквизитам. Шаг засчитается, когда придёт первое поступление.</p>
    <div class="kv"><span>Получатель</span><span>${esc(companyName())}</span><span>Счёт</span><span>40702${NB}810${NB}2${NB}0430${NB}0012345</span><span>БИК</span><span>044525593</span><span>Банк</span><span>АО «Альфа-Банк»</span></div>
    <div class="modal__actions"><button class="btn btn--dark" data-a="copyReq" data-v="modal">Скопировать реквизиты</button><button class="btn btn--gray" data-a="demoTopup">Показать, как придут деньги</button></div>`,
  done: (title, text, pic) => `<button class="x" aria-label="Закрыть" data-a="closeModal">${xIcon()}</button>
    <div class="check">${checkIcon}</div>
    <h3>${title}</h3><p>${text}</p>
    <div class="modal__actions"><button class="btn btn--dark" data-a="closeModal">Готово</button></div>`,
  spend: () => `<button class="x" aria-label="Закрыть" data-a="closeModal">${xIcon()}</button>
    <h3>На что потратить баллы</h3>
    <p>На счёте <span class="amt">${points().toLocaleString('ru-RU').replace(/\s/g, NB)}</span> баллов. Курс и предложения придуманы для прототипа.</p>
    ${[['Месяц обслуживания счёта', 'вместо оплаты тарифа', 1500], ['10 переводов без комиссии', 'контрагентам, в течение месяца', 1000], ['Скидка 50% на выписку для госзакупок', 'одна выписка', 500]].map(([t, s, c]) =>
      `<div class="offer"><div>${t}<small>${s}</small></div><button class="btn btn--gray" data-a="redeem" data-v="${c}" ${points() < c ? 'disabled' : ''}>${c.toLocaleString('ru-RU').replace(/\s/g, NB)} баллов</button></div>`).join('')}`,
};

const ACTIONS = {
  scn: v => { S.scn = v; if (v === 'working' && !SITUATIONS.some(x => x.id === S.sit)) S.sit = 'normal'; reset(); },
  sit: v => { S.sit = v; reset(); },
  long: () => { S.long = !S.long; writeHash(); render(); },
  loading: () => { S.loading = !S.loading; render(); },
  reset: () => reset(),
  amt: v => { S.hideAmt = v === 'hide'; render(); },
  stub: v => toast(`«${v}» — вне задания, в прототипе не нарисовано`),
  tIdx: v => { S.todayIdx += Number(v); render(); },
  doToday: (v, el) => doToday(v, el),
  remind: () => { S.reminded = true; render(); toast({ pic: 'hero_red', t: 'Напоминание отправлено', s: `Набоков И.${NB}Д. получит пуш и письмо: ${S.D.statuses.sign[0]} ${plural(S.D.statuses.sign[0], 'платёж ждёт', 'платежа ждут', 'платежей ждут')} подписи${S.D.today.items?.includes('p124') ? ', один нужно подписать до 16:00' : ''}.` }); },
  prepare: v => toast(`Откроется платёж «${SOON_ITEMS[v].kind}» с заполненными реквизитами`),
  copyReq: v => { navigator.clipboard?.writeText(`${companyName()}, счёт 40702810204300012345, БИК 044525593`).catch(() => {}); toast('Реквизиты скопированы'); },
  reqs: () => openModal(MODALS.topup),
  openPanel: () => { S.panel = true; render(); },
  closePanel: () => { S.panel = false; render(); },
  closeModal: () => closeModal(),
  hideOnb: () => { S.D.onb.hidden = true; render(); toast('Блок скрыт. Баллы остаются в карточке счёта'); },
  spend: () => openModal(MODALS.spend),
  redeem: v => { closeModal(); toast(`Обмен на ${v} баллов: в прототипе не списываем`); },
  stepGo: (v, el) => {
    const now = S.D.onb.now.find(n => n.id === v);
    if (v === 'firstPay' && !now?.act) return toast('Откроется новый платёж: в прототипе не нарисовано');
    if (v === 'firstPay') { S.panel = false; const tb = document.querySelector(`[data-a="doToday"][data-v="${now?.act}"]`); return doToday(now?.act || 'p30', tb); }
    openModal(MODALS[v]);
  },
  confirmStep: (v, el) => {
    if (v === 'self') {
      const raw = (document.getElementById('selfSum')?.value || '').replace(/\D/g, '');
      const sum = Number(raw) || 0;
      if (!sum || sum > S.D.balance) { toast('Проверьте сумму: она больше остатка или пустая'); return; }
      S.D.balance -= sum;
    }
    busy(el, 700, () => {
      const st = STEPS[v];
      completeStep(v, true);
      const dc = doneCount();
      S.modal = () => MODALS.done(
        v === 'self' ? 'Деньги отправлены' : `${st.t}: подключено`,
        dc >= 7 ? `Это был последний шаг. Начислено 500 баллов за шаг и 1${NB}000 бонусом за всё знакомство.` : `Шаг знакомства закрыт, +500 баллов. Пройдено ${dc} из 7.`);
      render();
    });
  },
  demoTopup: () => {
    const D = S.D;
    D.balance = 300000; closeModal();
    completeStep('topup', true);
    D.today = { mode: 'soon' };
    toast({ pic: 'hero_blue', t: `Поступление 300${NB}000${NB}₽`, pts: '+500', s: 'Пополнение счёта: шаг знакомства закрыт', progress: doneCount() });
    render();
  },
  openList: v => { S.page = 'list'; S.panel = false; const st = S.D.statuses; S.listStatus = v === 'today' && todayIds().length ? 'today' : v && STATUS[v] && st[v][0] ? v : (ORDER.find(k => st[k][0] && !(k === 'sign' && !isDir())) || ORDER.find(k => st[k][0]) || 'pay'); S.sel = new Set(); render(); document.getElementById('scroll').scrollTop = 0; },
  home: () => { S.page = 'dash'; S.panel = false; S.sel = new Set(); render(); document.getElementById('scroll').scrollTop = 0; },
  lTab: v => { S.listStatus = v; S.sel = new Set(); render(); },
  sel: v => { const i = Number(v); S.sel.has(i) ? S.sel.delete(i) : S.sel.add(i); render(); },
  selAll: () => { const rows = rowsFor(S.listStatus); S.sel = S.sel.size === rows.length ? new Set() : new Set(rows.map((_, i) => i)); render(); },
  rowAct: (v, el) => listAct([Number(v)], el),
  todayRow: (v, el) => doToday(v, el),
  bulk: (v, el) => listAct([...S.sel], el),
};

function listAct(idxs, el) {
  const k = S.listStatus;
  if (k === 'fix' || k === 'rej' || k === 'draft') { toast('Откроется платёж для правки: в прототипе не нарисовано'); return; }
  const rows = rowsFor(k);
  const take = idxs.map(i => rows[i]).filter(Boolean);
  const sum = take.reduce((a, r) => a + r.sum, 0);
  if (k === 'pay' && !isDir()) {
    return busy(el, 700, () => {
      const n = take.length === rows.length ? S.D.statuses.pay[0] : take.length;
      const s = take.length === rows.length ? S.D.statuses.pay[1] : sum;
      moveTo('pay', 'sign', n, s);
      const T = S.D.today;
      if (T.items) take.forEach(r => { if (r.who === 'ООО «Вектор»' && r.sum === 18400) T.items = T.items.filter(x => x !== 'inv18'); });
      S.sel = new Set();
      toast({ pic: 'hero_invoice', t: `${n} ${plural(n, 'платёж подготовлен', 'платежа подготовлены', 'платежей подготовлены')}`, s: `На <span class="amt">${fmt(s)}</span>. Ждут подписи Набокова И.${NB}Д.` });
      render();
    });
  }
  busy(el, 700, () => {
    const all = S.D.statuses[k][0];
    const n = take.length === rows.length ? all : take.length;
    const s = take.length === rows.length ? S.D.statuses[k][1] : sum;
    moveToBank(k, n, s);
    S.D.balance -= s;
    const T = S.D.today;
    if (T.items) take.forEach(r => { const hit = Object.values(TODAY_ITEMS).find(t => (t.who === r.who || (r.who === LONG_NAME && t.id === 'p124')) && t.sum === r.sum); if (hit) T.items = T.items.filter(x => x !== hit.id); });
    if (T.mode === 'list') T.total = Math.max(0, T.total - n);
    S.sel = new Set();
    const youngStep = S.scn === 'young' && k === 'sign' && S.D.onb.now.some(x => x.id === 'firstPay');
    if (youngStep) completeStep('firstPay', true);
    toast({ pic: k === 'pay' ? 'hero_invoice' : 'hero_red', t: `${n} ${plural(n, 'платёж', 'платежа', 'платежей')} ушли в банк`, pts: youngStep ? '+500' : undefined, s: youngStep ? 'Первый платёж контрагенту:<br>шаг знакомства закрыт' : `На <span class="amt">${fmt(s)}</span>. Статус можно смотреть в «В работе у банка».`, progress: youngStep ? doneCount() : undefined });
    render();
  });
}

/* ---------- события ---------- */
document.addEventListener('click', e => {
  if (e.target.closest('[data-stop]') && !e.target.closest('[data-a]')) return;
  const el = e.target.closest('[data-a]');
  if (!el || el.disabled) return;
  if (el.classList.contains('mscrim') && e.target !== el) return;
  const fn = ACTIONS[el.dataset.a];
  if (fn) { e.stopPropagation(); fn(el.dataset.v, el); }
});
document.addEventListener('change', e => {
  const el = e.target.closest('[data-ch]');
  if (el) ACTIONS[el.dataset.ch](el.value);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (S.modal) closeModal(); else if (S.panel) ACTIONS.closePanel(); }
});

/* ---------- масштаб окна под экран ---------- */
function fit() {
  const win = document.getElementById('app');
  const bare = document.body.classList.contains('bare');
  const top = bare ? 0 : document.getElementById('demo').offsetHeight;
  const gap = bare ? 0 : 24;
  document.querySelector('.stage').style.top = top + 'px';
  const z = Math.min(1, (innerWidth - gap) / 1600);
  win.style.zoom = z;
  win.style.height = ((innerHeight - top - gap) / z) + 'px';
}
addEventListener('resize', fit);

readHash();
reset(true);
