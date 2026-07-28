import { test, expect } from '@playwright/test';

const ROLES = [
  { email: 'admin@demo.com', slug: 'admin', heading: 'Administrador' },
  { email: 'supervisor@demo.com', slug: 'supervisor-activos', heading: 'Supervisor de Activos' },
  { email: 'operaciones@demo.com', slug: 'supervisor-operaciones', heading: 'Supervisor de Operaciones' },
  { email: 'tecnico@demo.com', slug: 'tecnico', heading: 'Técnico' },
  { email: 'almacen@demo.com', slug: 'almacenista', heading: 'Almacenista' },
  { email: 'consulta@demo.com', slug: 'consultor', heading: 'Consultor' },
];

async function loginAndSetup(page: { request: { post: (url: string, data: unknown) => Promise<{ ok: () => boolean; json: () => Promise<{ data: { attributes: { access_token: string } } }> }> } }, email: string) {
  const res = await page.request.post('/v1/auth/ingresar', {
    data: {
      data: {
        type: 'auth',
        attributes: { email, password: 'Password123!' },
      },
    },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  const token = body.data.attributes.access_token;

  const yoRes = await page.request.get('/v1/auth/yo', {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(yoRes.ok()).toBeTruthy();
  const yoBody = await yoRes.json();

  let empresaId = '';
  if (typeof yoBody.empresa_id === 'string') empresaId = yoBody.empresa_id;
  else if (yoBody.data?.attributes?.empresa_id) empresaId = yoBody.data.attributes.empresa_id;
  else if (yoBody.usuario?.empresa_id) empresaId = yoBody.usuario.empresa_id;

  return { token, empresaId };
}

test.describe('Dashboard por rol', () => {
  for (const role of ROLES) {
    test(`muestra dashboard correcto para ${role.slug}`, async ({ page }) => {
      const { token, empresaId } = await loginAndSetup(page, role.email);
      await page.goto('/dashboard');
      await page.evaluate(({ t, eid }) => {
        localStorage.setItem('token', t);
        localStorage.setItem('empresaId', eid);
      }, { t: token, eid: empresaId });
      await page.goto('/dashboard');
      await expect(page.getByText(role.heading)).toBeVisible({ timeout: 10000 });
    });
  }
});
