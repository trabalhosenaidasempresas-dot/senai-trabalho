import { chromium } from 'playwright';

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api';
const FRONTEND_BASE = process.env.FRONTEND_BASE || 'http://localhost:3001';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ baseURL: FRONTEND_BASE });
  const page = await context.newPage();
  // log auth responses for debugging
  page.on('response', async (resp) => {
    try {
      if (resp.url().includes('/api')) {
        let b = null;
        try { b = await resp.json(); } catch (e) { b = await resp.text(); }
        console.log('API RESPONSE', resp.status(), resp.url(), JSON.stringify(b).slice(0,1000));
      }
    } catch (e) {
      // ignore
    }
  });
  page.on('request', (req) => {
    try {
      if (req.url().includes('/api')) console.log('API REQUEST', req.method(), req.url());
    } catch (e) {}
  });
  page.on('console', (msg) => {
    try { console.log('PAGE CONSOLE:', msg.text()); } catch (e) {}
  });
  page.on('pageerror', (err) => {
    try { console.error('PAGE ERROR:', err.message); } catch (e) {}
  });

  // Login via UI
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.getByLabel('Email').fill(process.env.ADMIN_EMAIL || 'admin@secult.com');
  await page.getByLabel('Senha').fill(process.env.ADMIN_SENHA || 'admin123');
  await page.getByRole('button', { name: /entrar/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 15000 });

  // dump anchors for diagnosis
  const anchors = await page.evaluate(() => Array.from(document.querySelectorAll('a')).map(a => ({ href: a.getAttribute('href'), text: a.innerText.trim().slice(0,60) })));
  console.log('ANCHORS ON PAGE:', JSON.stringify(anchors.slice(0,50), null, 2));

  // Open Serviços via sidebar link to ensure client-side routing loads the component
  try {
    // try sidebar link first
    try {
      await page.click('a[href="/servicos"]', { timeout: 5000 });
    } catch (e) {
      // fallback to client-side role link
      try {
        const servicosLink = page.getByRole('link', { name: /serviços/i });
        const linkCount = await servicosLink.count();
        if (linkCount > 0) await servicosLink.first().click();
      } catch (er) {
        // fallback to direct navigation
        await page.goto('/servicos', { waitUntil: 'domcontentloaded', timeout: 60000 });
      }
    }

    // wait for expected header or the Novo Serviço button
    await Promise.race([
      page.waitForSelector('h4', { timeout: 30000 }),
      page.waitForSelector('button:has-text("Novo Serviço")', { timeout: 30000 }),
    ]).catch(() => {});
  } catch (navErr) {
    console.error('Navigation to /servicos failed, dumping partial HTML:');
    const partial = await page.content();
    console.error(partial.slice(0, 3000));
  }

  // Open form
  // ensure button exists
  const novoBtnCount = await page.getByRole('button', { name: /novo serviço/i }).count();
  if (novoBtnCount === 0) {
    const html = await page.content();
    console.error('Novo Serviço button not found; dumping page HTML (first 2000 chars):');
    console.error(html.slice(0, 2000));
    await page.screenshot({ path: 'servicos_page.png', fullPage: true }).catch(() => {});
    throw new Error('Novo Serviço button not found on /servicos');
  }
  await page.getByRole('button', { name: /novo serviço/i }).click();
  await page.waitForSelector('form');

  const nome = `Teste UI Serviço ${Date.now()}`;
  await page.locator('input[name="nome"]').fill(nome);
  await page.locator('input[name="fornecedor"]').fill('Fornecedor E2E');
  // categoria has default; periodicidade default; dates default

  // dump form outerHTML for diagnosis
  const formsHtml = await page.evaluate(() => Array.from(document.querySelectorAll('form')).map(f => f.outerHTML.slice(0, 2000)));
  console.log('FORMS HTML (first forms):', JSON.stringify(formsHtml, null, 2));

  const salvarBtn = page.getByRole('button', { name: /salvar/i });
  const isDisabled = await salvarBtn.isDisabled().catch(() => false);
  console.log('Salvar button disabled:', isDisabled);
  const validationCount = await page.locator('text=obrigat').count().catch(() => 0);
  console.log('Número de mensagens de validação ("obrigat"): ', validationCount);

  // log salvar button outerHTML and nearest form container for diagnosis
  try {
    const salvarOuter = await salvarBtn.first().evaluate((n) => n.outerHTML);
    console.log('Salvar button outerHTML:', salvarOuter.slice(0, 1000));
    const parentOuter = await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button')).find(x => /salvar/i.test(x.innerText));
      if (!b) return null;
      return b.closest('form') ? b.closest('form').outerHTML.slice(0,2000) : b.closest('div')?.outerHTML.slice(0,2000);
    });
    console.log('Salvar button nearest container (form/div):', parentOuter ? parentOuter.slice(0,2000) : null);
  } catch (err) { console.error('Erro ao ler salvar button outerHTML:', err.message || err); }

  console.log('Submitting form, waiting for POST /api/servicos...');
  await page.screenshot({ path: 'servico_form.png', fullPage: true }).catch(() => {});
  let response;
  try {
    // instrument page: capture fetch and XHR calls in window.__capturedRequests
    await page.evaluate(() => {
      window.__capturedRequests = [];
      const origFetch = window.fetch;
      window.fetch = async function (input, init) {
        try {
          window.__capturedRequests.push({ type: 'fetch', url: input, init });
        } catch (e) {}
        return origFetch.apply(this, arguments);
      };
      const origX = window.XMLHttpRequest && window.XMLHttpRequest.prototype && window.XMLHttpRequest.prototype.send;
      if (origX) {
        const origOpen = window.XMLHttpRequest.prototype.open;
        window.XMLHttpRequest.prototype.open = function (method, url) {
          this._reqMethod = method;
          this._reqUrl = url;
          return origOpen.apply(this, arguments);
        };
        window.XMLHttpRequest.prototype.send = function (body) {
          try {
            window.__capturedRequests.push({ type: 'xhr', method: this._reqMethod, url: this._reqUrl, body });
          } catch (e) {}
          return origX.apply(this, arguments);
        };
      }
    });
    // try native form submit
    await page.evaluate(() => { const f = document.querySelector('form'); if (f && typeof f.requestSubmit === 'function') f.requestSubmit(); });
    await page.waitForTimeout(1200);
    // read captured requests immediately
    const immediateCaptured = await page.evaluate(() => window.__capturedRequests || []);
    console.log('Immediate captured after requestSubmit:', JSON.stringify(immediateCaptured, null, 2).slice(0,4000));
    response = await page.waitForResponse((resp) => resp.url().includes('/api/servicos') && resp.request().method() === 'POST', { timeout: 10000 });
  } catch (e) {
    // fallback to clicking the button
    await salvarBtn.click();
    await page.waitForTimeout(1200);
    const immediateCaptured2 = await page.evaluate(() => window.__capturedRequests || []);
    console.log('Immediate captured after salvarBtn.click():', JSON.stringify(immediateCaptured2, null, 2).slice(0,4000));
    response = await page.waitForResponse((resp) => resp.url().includes('/api/servicos') && resp.request().method() === 'POST', { timeout: 10000 });
  }

  // dump captured requests from page context for diagnosis
  try {
    const captured = await page.evaluate(() => window.__capturedRequests || []);
    console.log('Captured requests in page context:', JSON.stringify(captured, null, 2).slice(0, 4000));
  } catch (err) {
    console.error('Error reading captured requests:', err.message || err);
  }

  console.log('Response status:', response.status());
  let body = null;
  try { body = await response.json(); } catch (e) { body = await response.text(); }
  console.log('Response body:', JSON.stringify(body));

  // Verify via API search
  console.log('Verifying persistence via API search...');
  let searchJson = null;
  try {
    const searchRes = await fetch(`${API_BASE}/servicos?search=${encodeURIComponent(nome)}&limite=5`);
    searchJson = await searchRes.json();
    console.log('Search API result:', JSON.stringify(searchJson, null, 2));
  } catch (err) {
    console.error('Error querying API search:', err.message || err);
  }

  // Reload UI and check table for the created entry
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const found = await page.locator('tbody tr').locator('td', { hasText: nome }).count();
  console.log('Found rows in table with nome:', found);

  await browser.close();

  if ((searchJson && (searchJson.success || searchJson.servicos) && ((searchJson.servicos && searchJson.servicos.length) || (searchJson.data && searchJson.data.length))) || found > 0) {
    console.log('E2E create succeeded');
    process.exit(0);
  }
  console.error('E2E create failed');
  process.exit(2);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
