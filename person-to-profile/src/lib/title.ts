export function setPageTitle(title?: string) {
  const base = 'Aoife Research Lab'
  document.title = title && title.length > 0 ? `${title} · ${base}` : base
}
