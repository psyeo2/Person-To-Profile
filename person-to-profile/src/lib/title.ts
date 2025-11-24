export function setPageTitle(title?: string) {
  const base = 'Ad Research Lab'
  document.title = title && title.length > 0 ? `${title} · ${base}` : base
}
