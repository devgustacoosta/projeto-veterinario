import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function session(page, perfil, path) {
  await page.addInitScript((role) => {
    localStorage.setItem("access_token", "test-only-token");
    localStorage.setItem("user_perfil", role);
  }, perfil);
  await page.goto(path);
}
async function mockApi(page, handler) {
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace(/^\/api/, "");
    const response = await handler(path, request);
    await route.fulfill({
      status: response?.status ?? 200,
      contentType: "application/json",
      body: JSON.stringify(response?.body ?? []),
    });
  });
}
async function accessible(page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
}

test("login e cadastro têm nomes acessíveis", async ({ page }) => {
  await page.goto("/");
  await accessible(page);
  await page.getByRole("button", { name: "Cadastre-se" }).click();
  await expect(page.getByLabel("Nome completo*")).toBeVisible();
  await accessible(page);
});

test("pet: erro preserva formulário e diálogo contém foco", async ({
  page,
}) => {
  await mockApi(page, (path, request) =>
    path === "/tutor/pets" && request.method() === "POST"
      ? { status: 500, body: { erro: "Falha de teste" } }
      : { body: [] },
  );
  await session(page, "tutor", "/tutor/pets");
  const trigger = page.getByRole("button", { name: "Novo Pet", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Novo Pet" });
  await page.getByLabel("Nome*", { exact: true }).fill("Luna");
  await page.getByLabel("Espécie*").fill("Gato");
  await accessible(page);
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(
        () => document.activeElement.closest("dialog") !== null,
      ),
    ).toBe(true);
  }
  await dialog.getByRole("button", { name: "Cadastrar Pet" }).click();
  await expect(dialog.getByRole("alert")).toContainText("Falha de teste");
  await expect(dialog).toBeVisible();
  await expect(page.getByLabel("Nome*", { exact: true })).toHaveValue("Luna");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("catálogo salva preço decimal e resumo consulta dia, mês e ano", async ({
  page,
}) => {
  const services = [];
  const groups = [];
  await mockApi(page, (path, request) => {
    if (path === "/vet/servicos") {
      if (request.method() === "POST") {
        const body = request.postDataJSON();
        expect(body.preco_referencia).toBe("125.50");
        services.push({ ...body, id: 1 });
        return { status: 201, body: services[0] };
      }
      return { body: services };
    }
    if (path === "/vet/financeiro") {
      groups.push(new URL(request.url()).searchParams.get("agrupamento"));
      return {
        body: {
          total: "125.50",
          atendimentos: [
            {
              agendamento_id: 7,
              data_hora: "2026-10-06 19:00:00",
              pet_nome: "Luna",
              tutor_nome: "Tutor de teste",
              total: "125.50",
            },
          ],
          periodos: [{ periodo: "2026-10-06", total: "125.50" }],
        },
      };
    }
  });
  await session(page, "veterinario", "/vet/financas");
  await expect(page.getByText("Total dos serviços no período")).toBeVisible();
  await accessible(page);
  await page.getByRole("button", { name: "Novo procedimento" }).click();
  await page.getByLabel("Descrição").fill("Consulta");
  await page.getByLabel("Preço de referência (R$)").fill("125.50");
  await accessible(page);
  await page.getByRole("button", { name: "Salvar procedimento" }).click();
  await expect(
    page.getByRole("heading", { name: "Consulta", exact: true }),
  ).toBeVisible();
  for (const group of ["mes", "ano"]) {
    await page.getByLabel("Agrupar por").selectOption(group);
    await page.getByRole("button", { name: "Consultar", exact: true }).click();
    await expect.poll(() => groups.at(-1)).toBe(group);
  }
  await page.screenshot({ path: "test-results/financas.png", fullPage: true });
});

test("atendimento registra procedimentos juntos e mantém dados após conflito", async ({
  page,
}) => {
  let payload;
  let failed = false;
  await mockApi(page, (path, request) => {
    if (path === "/vet/agenda")
      return {
        body: [
          {
            id: 7,
            pet_nome: "Luna",
            tutor_nome: "Tutor de teste",
            data_hora: "2026-10-06 19:00:00",
            status: "agendado",
          },
        ],
      };
    if (path === "/vet/servicos")
      return {
        body: [
          {
            id: 1,
            descricao: "Consulta",
            preco_referencia: "125.50",
            ativo: true,
          },
        ],
      };
    if (path.endsWith("/historico")) {
      payload = request.postDataJSON();
      if (!failed) {
        failed = true;
        return { status: 409, body: { erro: "Atendimento já registrado" } };
      }
      return { status: 201, body: { id: 9 } };
    }
  });
  await session(page, "veterinario", "/vet/agenda");
  await page
    .getByRole("button", { name: "Registrar Atendimento", exact: true })
    .click();
  await page.getByLabel("Diagnóstico").fill("Avaliação clínica de teste");
  await page.getByRole("button", { name: "Adicionar procedimento" }).click();
  await page.getByLabel("Procedimento", { exact: true }).selectOption("1");
  await page.getByLabel("Quantidade").fill("2");
  await expect(page.getByText(/Total:.*251,00/)).toBeVisible();
  await accessible(page);
  await page.getByRole("button", { name: "Salvar e Concluir" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Atendimento já registrado",
  );
  await expect(page.getByLabel("Diagnóstico")).toHaveValue(
    "Avaliação clínica de teste",
  );
  expect(payload.procedimentos).toEqual([
    { servico_id: 1, quantidade: 2, valor_unitario: "125.50" },
  ]);
  await page.getByRole("button", { name: "Salvar e Concluir" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("tutor consulta valores sem controles de edição", async ({ page }) => {
  await mockApi(page, (path) => {
    if (path === "/tutor/agendamentos")
      return {
        body: [
          {
            id: 7,
            pet_nome: "Luna",
            veterinario_nome: "Veterinário de teste",
            data_hora: "2026-10-06 19:00:00",
            status: "concluido",
          },
        ],
      };
    if (path.endsWith("/financeiro"))
      return {
        body: {
          total: "251.00",
          procedimentos: [
            {
              id: 1,
              descricao: "Consulta",
              quantidade: 2,
              valor_unitario: "125.50",
              subtotal: "251.00",
            },
          ],
        },
      };
  });
  await session(page, "tutor", "/tutor/agendamentos");
  await page.getByRole("button", { name: "Ver valores" }).click();
  await expect(page.getByText(/Total:.*251,00/)).toBeVisible();
  await expect(page.getByRole("dialog").getByRole("textbox")).toHaveCount(0);
  await accessible(page);
});

test("menu móvel fecha com Escape e devolve foco", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockApi(page, () => ({ body: [] }));
  await session(page, "tutor", "/tutor/pets");
  const trigger = page.getByRole("button", { name: "Abrir menu" });
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await accessible(page);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await page.screenshot({
    path: "test-results/pets-mobile.png",
    fullPage: true,
  });
});
