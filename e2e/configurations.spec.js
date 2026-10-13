import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.use({ timezoneId: "America/Sao_Paulo" });

test("horários e bloqueios preenchidos têm nomes acessíveis e remoção por teclado", async ({ page }) => {
  let horarios = [{ id: 11, dia_semana: 1, hora_inicio: "8:00:00", hora_fim: "12:00:00", duracao_consulta_min: 30 }];
  let bloqueios = [{ id: 22, motivo: "Reunião", data_inicio: "Tue, 13 Oct 2026 08:30:00 GMT", data_fim: "Tue, 13 Oct 2026 10:00:00 GMT" }];
  const deleted = [];
  await page.addInitScript(() => {
    localStorage.setItem("access_token", "test-only-token");
    localStorage.setItem("user_perfil", "veterinario");
  });
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (request.method() === "DELETE") {
      deleted.push(path);
      if (path.endsWith("/horarios/11")) horarios = [];
      if (path.endsWith("/bloqueios/22")) bloqueios = [];
      await route.fulfill({ status: 204 });
      return;
    }
    await route.fulfill({ contentType: "application/json", body: JSON.stringify(path.endsWith("/horarios") ? horarios : bloqueios) });
  });
  await page.goto("/vet/configuracoes");
  const horario = page.getByRole("button", { name: "Remover horário de Segunda-feira, das 08:00 às 12:00", exact: true });
  const bloqueio = page.getByRole("button", { name: "Remover bloqueio Reunião, de 13/10/2026 às 08:30 até 13/10/2026 às 10:00", exact: true });
  await expect(horario).toBeVisible();
  await expect(bloqueio).toBeVisible();
  await expect(page.getByText("08:00 - 12:00", { exact: true })).toBeVisible();
  await expect(page.getByText("De: 13/10/2026 - 08:30", { exact: true })).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  await horario.focus();
  await expect(horario).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(horario).toHaveCount(0);
  await bloqueio.focus();
  await page.keyboard.press("Enter");
  await expect(bloqueio).toHaveCount(0);
  expect(deleted).toEqual(["/api/vet/horarios/11", "/api/vet/bloqueios/22"]);
});

test("datas HTTP na agenda do veterinário exibem dia e horário completos", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("access_token", "test-only-token");
    localStorage.setItem("user_perfil", "veterinario");
  });
  await page.route("**/api/**", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify(new URL(route.request().url()).pathname.endsWith("/agenda") ? [{ id: 7, pet_nome: "Nina", tutor_nome: "Mariana", data_hora: "Tue, 13 Oct 2026 08:30:00 GMT", status: "confirmado" }] : []) }));
  await page.goto("/vet/agenda");
  await expect(page.getByText("13/10/2026 - 08:30", { exact: true })).toBeVisible();
});
