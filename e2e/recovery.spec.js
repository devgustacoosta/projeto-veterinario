import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("remarcação preserva seleção no conflito e atualiza sem recarregar página", async ({
  page,
}) => {
  let fail = true;
  const appointment = {
    id: 7,
    pet_nome: "Luna",
    veterinario_nome: "Vet de teste",
    veterinario_id: 1,
    data_hora: "2026-10-06 18:00:00",
    status: "confirmado",
  };
  await page.addInitScript(() => {
    localStorage.setItem("access_token", "test-only-token");
    localStorage.setItem("user_perfil", "tutor");
    sessionStorage.setItem(
      "loads",
      String(Number(sessionStorage.getItem("loads") || 0) + 1),
    );
  });
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    let body = [];
    let status = 200;
    if (path.endsWith("/tutor/agendamentos")) body = [appointment];
    if (path.endsWith("/disponibilidade")) body = ["18:30"];
    if (path.endsWith("/remarcar")) {
      expect(request.method()).toBe("PUT");
      const data = request.postDataJSON().nova_data_hora;
      expect(data).toMatch(/ 18:30:00$/);
      if (fail) {
        fail = false;
        status = 409;
        body = { erro: "Horário ocupado" };
      } else {
        appointment.data_hora = data;
        body = { id: 7 };
      }
    }
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
  await page.goto("/tutor/agendamentos");
  await page.getByRole("button", { name: "Remarcar", exact: true }).click();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const date = tomorrow.toISOString().slice(0, 10);
  await page.getByLabel("Nova data da consulta").fill(date);
  await page.getByLabel("Novo horário da consulta").selectOption("18:30");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Confirmar Remarcação" });
  await dialog.getByRole("button", { name: "Confirmar", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("Horário ocupado");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Confirmar", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Remarcar", exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem("loads"))).toBe("1");
});

test("falha financeira oferece recuperação e 401 encerra sessão", async ({
  page,
}) => {
  let fail = true;
  await page.addInitScript(() => {
    localStorage.setItem("access_token", "test-only-token");
    localStorage.setItem("user_perfil", "veterinario");
  });
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    let status = 200;
    let body = [];
    if (path.endsWith("/financeiro")) {
      status = fail ? 500 : 200;
      body = fail
        ? { erro: "Resumo indisponível" }
        : { total: "0.00", atendimentos: [], periodos: [] };
    }
    if (path.endsWith("/pacientes")) {
      status = 401;
      body = { erro: "Sessão expirada" };
    }
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
  await page.goto("/vet/financas");
  await expect(page.getByRole("alert")).toContainText("Resumo indisponível");
  fail = false;
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(
    page.getByText("Nenhum valor registrado neste período."),
  ).toBeVisible();
  await page.getByRole("link", { name: "Pacientes", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Bem-vindo ao Vet" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("access_token")),
  ).toBeNull();
});

test("configurações e pacientes têm controles acessíveis", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("access_token", "test-only-token");
    localStorage.setItem("user_perfil", "veterinario");
  });
  await page.route("**/api/**", (route) =>
    route.fulfill({ contentType: "application/json", body: "[]" }),
  );
  await page.goto("/vet/configuracoes");
  await expect(
    page.getByRole("heading", { name: "Configurações da Agenda" }),
  ).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByRole("link", { name: "Pacientes", exact: true }).click();
  await expect(
    page.getByLabel("Buscar paciente por pet ou tutor"),
  ).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});
