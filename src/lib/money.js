export function cents(value, maximum = 999999999) {
  const text = String(value ?? "")
    .trim()
    .replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(text))
    throw new Error("Informe um valor válido com até duas casas decimais.");
  const [whole, fraction = ""] = text.split(".");
  const result = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(result) || result > maximum)
    throw new Error("O valor informado é muito alto.");
  return result;
}
export function decimal(value) {
  return (cents(value) / 100).toFixed(2);
}
export function currency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents(value, Number.MAX_SAFE_INTEGER) / 100);
}
export function validateItems(items) {
  return items.map((item) => {
    if (
      !Number.isInteger(Number(item.servico_id)) ||
      Number(item.servico_id) < 1 ||
      !Number.isInteger(Number(item.quantidade)) ||
      Number(item.quantidade) < 1 ||
      Number(item.quantidade) > 1000
    )
      throw new Error(
        "Selecione um procedimento e uma quantidade de 1 a 1000.",
      );
    return {
      servico_id: Number(item.servico_id),
      quantidade: Number(item.quantidade),
      valor_unitario: decimal(item.valor_unitario),
    };
  });
}
