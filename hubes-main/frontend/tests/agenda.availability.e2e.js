import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@secult.com';
const ADMIN_SENHA = process.env.ADMIN_SENHA || 'admin123';

async function login(page) {
  await page.goto(`${BASE_URL}/login`);
  await page.getByLabel('Email').fill(ADMIN_EMAIL);
  await page.getByLabel('Senha').fill(ADMIN_SENHA);
  await page.getByRole('button', { name: /entrar/i }).click();
  await page.waitForURL('**/dashboard');
}

async function ensureLoggedIn(page){
  const token = await page.evaluate(()=>window.localStorage.getItem('token'));
  if(!token) await login(page);
}

const base = `${BASE_URL}/agenda`;

// Helper: open new event modal and select room
async function openModalAndSelectRoom(page, room){
  await login(page);
  await page.goto(base);
  await page.waitForLoadState('networkidle');
  // botão pode estar em diferentes containers; usar role=button com texto
  await page.getByRole('button', { name: /Novo Evento/i }).click();
  await page.waitForSelector('div[role="dialog"]', { state: 'visible' });
  await page.click('div[role="combobox"]');
  await page.click(`li[role="option"]:has-text("${room}")`);
}

test.describe('Agenda disponibilidade', () => {
  test('cria reserva e impede dupla reserva no mesmo horário', async ({ page }) => {
    const room = 'Sala 1';
    const now = new Date();
    const target = new Date(now.getTime() + 24*3600*1000); // amanhã
    const day = target.getDate();

    // criar reserva inicial às 10:00
    await openModalAndSelectRoom(page, room);
    await page.fill('input[placeholder="Digite o título do evento"]', 'Teste E2E Reserva Inicial');
    await page.fill('input[placeholder="Digite o nome do contato"]', 'Playwright');
    await page.fill('input[placeholder="(00) 00000-0000"]', '(11) 91234-0000');
    await page.fill('input[placeholder="exemplo@email.com"]', 'e2e@test');
    // procurar um dia que possua horários disponíveis
    let selectedDay = null;
    // tentar clicar dias do 1 ao 31 e verificar disponibilidade — usa texto exato no diálogo
    for (let d = 1; d <= 31; d++) {
      const locator = page.locator('div[role="dialog"]').getByText(d.toString(), { exact: true });
      if ((await locator.count()) === 0) continue;
      await locator.click();
      await page.waitForTimeout(150);
      // aguardar combobox habilitado
      try {
        await page.waitForSelector('div[role="dialog"] [role="combobox"]:not([aria-disabled="true"])', { timeout: 1000 });
      } catch (e) {
        continue; // combobox ainda desabilitado para esse dia
      }
      await page.getByRole('combobox', { name: /Horário de Início/i }).click();
      const options = await page.$$eval('li[role="option"]', nodes => nodes.map(n => n.innerText));
      await page.keyboard.press('Escape');
      if (options.some(t => t.includes('Disponível'))) { selectedDay = d.toString(); break; }
    }
    if (!selectedDay) throw new Error('Nenhum dia com horários disponíveis encontrado');
    // selecionar primeiro início disponível
    await page.getByRole('combobox', { name: /Horário de Início/i }).click();
    const startOptText = await page.$$eval('li[role="option"]', nodes => nodes.map(n => n.innerText).find(t => t.includes('Disponível')));
    const startHour = startOptText.split(' - ')[0].trim();
    await page.$$eval('li[role="option"]', (nodes, text) => { const n = nodes.find(n=>n.innerText.includes(text)); if(n) n.click(); }, startHour);
    // para estabilidade, preenchemos diretamente os campos datetime-local de início/fim
    const now2 = new Date();
    const target2 = new Date(now2.getTime() + 24*3600*1000);
    const dateStr2 = target2.toISOString().slice(0,10);
    const startISO = `${dateStr2}T${startHour}`;
    // escolher um fim válido maior que o início (próxima hora)
    const endHourCandidate = (parseInt(startHour.split(':')[0],10) + 1).toString().padStart(2,'0') + ':00';
    const endISO = `${dateStr2}T${endHourCandidate}`;
    // selecionar os selects de horário em vez de preencher campos datetime (UI atual usa selects)
    await page.getByRole('combobox', { name: /Horário de Início/i }).click();
    await page.$$eval('li[role="option"]', (nodes, text) => { const n = nodes.find(n => n.innerText.includes(text)); if (n) n.click(); }, startHour);
    await page.getByRole('combobox', { name: /Horário de Fim/i }).click();
    await page.$$eval('li[role="option"]', (nodes, text) => { const n = nodes.find(n => n.innerText.includes(text)); if (n) n.click(); }, endHourCandidate);
    // submit and aguardar confirmação visível (snackbar)
    await page.click('button:has-text("Salvar")');
    await page.waitForSelector('[data-testid="app-live-region"]:has-text("Evento salvo com sucesso")', { state: 'attached', timeout: 10000 });

    // abrir modal novamente e verificar 10:00 ocupado
    await openModalAndSelectRoom(page, room);
    await page.locator('div[role="dialog"]').getByText(day.toString(), { exact: true }).click();
    await page.waitForTimeout(200);

    // verificar que o horário selecionado anteriormente agora aparece como 'Ocupado' no select
    // reabrir modal e verificar que a opção foi atualizada para 'Ocupado' (tenta por alguns ciclos)
    let seenOccupied = false;
    for (let i=0;i<8;i++){
      await openModalAndSelectRoom(page, room);
      // selecionar mesmo dia
      await page.locator('div[role="dialog"]').getByText(selectedDay.toString(), { exact: true }).click();
      await page.waitForTimeout(200);
      // aguardar combobox habilitado
      await page.waitForSelector('div[role="dialog"] [role="combobox"]:not([aria-disabled="true"])', { timeout: 5000 });
      await page.getByRole('combobox', { name: /Horário de Início/i }).click();
      const opt = await page.$$eval('li[role="option"]', (nodes, sh) => nodes.map(n=>({ text: n.innerText, disabled: n.getAttribute('aria-disabled') })).find(o=>o.text.includes(sh)), startHour);
      await page.keyboard.press('Escape');
      if (opt && opt.text.includes('Ocupado')){ seenOccupied = true; break; }
      await page.waitForTimeout(500);
    }
    expect(seenOccupied).toBe(true);

  });

  test('permite reservar outro horário disponível', async ({ page }) => {
    const room = 'Sala 1';
    const now = new Date();
    const target = new Date(now.getTime() + 24*3600*1000); // amanhã
    const day = target.getDate();

    // abrir modal e selecionar horário disponível 11:00
    await openModalAndSelectRoom(page, room);
    await page.fill('input[placeholder="Digite o título do evento"]', 'Teste E2E Reserva 11');
    await page.fill('input[placeholder="Digite o nome do contato"]', 'Playwright');
    await page.fill('input[placeholder="(00) 00000-0000"]', '(11) 91234-1111');
    await page.fill('input[placeholder="exemplo@email.com"]', 'e2e2@test');
    await page.locator('div[role="dialog"]').getByText(day.toString(), { exact: true }).click();
    await page.waitForTimeout(200);
    // selecionar dia com disponibilidade (dinâmico) e reservar primeiro horário disponível
    const dayHandles2 = await page.$$('div[role="dialog"] div');
    let selectedDay2 = null;
    for (const handle of dayHandles2) {
      const box = await handle.boundingBox();
      if (!box || box.width > 80 || box.height > 80) continue;
      const txt = await handle.innerText();
      if (!txt) continue;
      const dayNum = txt.split('\n')[0].trim();
      await handle.click({ force: true });
      await page.waitForTimeout(150);
      await page.getByRole('combobox', { name: /Horário de Início/i }).click();
      const opts = await page.$$eval('li[role="option"]', nodes => nodes.map(n => n.innerText));
      await page.keyboard.press('Escape');
      if (opts.some(t=>t.includes('Disponível'))) { selectedDay2 = dayNum; break; }
    }
    if(!selectedDay2) throw new Error('Nenhum horário disponível para reservar neste dia (teste 2)');
    await page.getByRole('combobox', { name: /Horário de Início/i }).click();
    const startText2 = await page.$$eval('li[role="option"]', nodes => nodes.map(n=>n.innerText).find(t=>t.includes('Disponível')));
    const startHourText = startText2.split(' - ')[0].trim();
    await page.$$eval('li[role="option"]', (nodes, text) => { const n = nodes.find(n=>n.innerText.includes(text)); if(n) n.click(); }, startHourText);
    // para estabilidade, preencher diretamente os campos datetime-local
    const now3 = new Date();
    const target3 = new Date(now3.getTime() + 24*3600*1000);
    const dateStr3 = target3.toISOString().slice(0,10);
    const startISO2 = `${dateStr3}T${startHourText}`;
    const endHourCandidate2 = (parseInt(startHourText.split(':')[0],10) + 1).toString().padStart(2,'0') + ':00';
    const endISO2 = `${dateStr3}T${endHourCandidate2}`;
    // selecionar os selects de horário (compatível com a implementação atual do formulário)
    await page.getByRole('combobox', { name: /Horário de Início/i }).click();
    await page.$$eval('li[role="option"]', (nodes, text) => { const n = nodes.find(n => n.innerText.includes(text)); if (n) n.click(); }, startHourText);
    await page.getByRole('combobox', { name: /Horário de Fim/i }).click();
    await page.$$eval('li[role="option"]', (nodes, text) => { const n = nodes.find(n => n.innerText.includes(text)); if (n) n.click(); }, endHourCandidate2);
    await page.click('button:has-text("Salvar")');
    await page.waitForSelector('[data-testid="app-live-region"]:has-text("Evento salvo com sucesso")', { state: 'attached', timeout: 10000 });

    // após salvar, abrir modal e verificar 11:00 agora está ocupado
    await openModalAndSelectRoom(page, room);
    await page.$$eval('div[role="dialog"] div', (nodes, day) => {
      const n = nodes.find(el => el.textContent && el.textContent.trim().startsWith(day.toString()));
      if(n) n.click();
    }, day);
    await page.waitForTimeout(200);
    // verificar que o horário escolhido agora aparece como 'Ocupado'
    // reabrir modal e verificar atualização de ocupação
    let seenOccupied2 = false;
    for (let i=0;i<8;i++){
      await openModalAndSelectRoom(page, room);
      await page.locator('div[role="dialog"]').getByText((selectedDay2 || selectedDay).toString(), { exact: true }).click();
      await page.waitForTimeout(200);
      await page.getByRole('combobox', { name: /Horário de Início/i }).click();
      const opt11 = await page.$$eval('li[role="option"]', (nodes, sh) => nodes.map(n=>({ text: n.innerText, disabled: n.getAttribute('aria-disabled') })).find(o=>o.text.includes(sh)), startHourText);
      await page.keyboard.press('Escape');
      if (opt11 && opt11.text.includes('Ocupado')){ seenOccupied2 = true; break; }
      await page.waitForTimeout(500);
    }
    expect(seenOccupied2).toBe(true);
  });
});
