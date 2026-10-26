type Result = { url: string; title: string; summary: string; tree: string; tags: string };
const bundles = new Map<string, Promise<any>>();
function pagefind(url: string) {
  if (!bundles.has(url)) bundles.set(url, import(/* @vite-ignore */ url).catch((error) => { bundles.delete(url); throw error; }));
  return bundles.get(url)!;
}

for (const box of document.querySelectorAll<HTMLElement>('[data-search-box]')) {
  const input = box.querySelector<HTMLInputElement>('input')!;
  const list = box.querySelector<HTMLOListElement>('ol')!;
  const status = box.querySelector<HTMLElement>('[data-search-status]')!;
  const more = box.querySelector<HTMLButtonElement>('[data-search-more]')!;
  const fullPage = box.dataset.searchPage === 'true';
  let request = 0, timer: ReturnType<typeof setTimeout>, matches: any[] = [], rendered = 0;
  const makeResult = (result: Result) => {
    const li = document.createElement('li');
    const a = document.createElement('a'); a.href = result.url; a.textContent = result.title;
    const h = document.createElement('h2'); h.append(a);
    const p = document.createElement('p'); p.textContent = result.summary;
    const meta = document.createElement('small'); meta.textContent = [result.tree, result.tags].filter(Boolean).join(' · ');
    li.append(h, p, meta); return li;
  };
  const append = async (version: number) => {
    const next = matches.slice(rendered, rendered + 10);
    const data: Result[] = await Promise.all(next.map(async (r) => {
      if (!r.data) return r;
      const d = await r.data();
      return { url: d.url, title: d.meta.title, summary: d.meta.summary || '', tree: d.meta.tree || '', tags: d.meta.tags || '' };
    }));
    if (version !== request) return;
    data.forEach((r) => list.append(makeResult(r)));
    rendered += data.length; more.hidden = rendered >= matches.length;
  };
  const search = async () => {
    const version = ++request, query = input.value.trim();
    list.replaceChildren(); more.hidden = true; matches = []; rendered = 0;
    if (fullPage) {
      const url = new URL(location.href);
      query ? url.searchParams.set('q', query) : url.searchParams.delete('q');
      history.replaceState(null, '', url);
    }
    if (!query) { status.textContent = '输入标题、题号或关键词。'; box.removeAttribute('aria-busy'); return; }
    status.textContent = '正在查找…'; box.setAttribute('aria-busy', 'true');
    try {
      if (box.dataset.dev === 'true') {
        const response = await fetch(box.dataset.fallback!);
        if (!response.ok) throw new Error('index unavailable');
        const records = await response.json();
        if (version !== request) return;
        matches = records.filter((a: any) => [a.title, a.summary, a.searchText ?? '', ...a.tree, ...a.tags].join(' ').toLowerCase().includes(query.toLowerCase()))
          .map((a: any) => ({ url: a.url, title: a.title, summary: a.summary, tree: a.tree.join(' / '), tags: a.tags.join(' · ') }));
      } else {
        const pf = await pagefind(box.dataset.bundle!);
        const response = await pf.search(query);
        if (version !== request) return;
        matches = response.results;
      }
      if (version !== request) return;
      status.textContent = matches.length ? `找到 ${matches.length} 篇文章` : '没有找到相关文章，试试更短的关键词。';
      await append(version);
    } catch {
      if (version === request) status.textContent = '搜索暂时不可用，请稍后重试，或从目录浏览文章。';
    } finally { if (version === request) box.removeAttribute('aria-busy'); }
  };
  input.addEventListener('input', () => { clearTimeout(timer); ++request; timer = setTimeout(search, 180); });
  box.querySelector('form')!.addEventListener('submit', (event) => { event.preventDefault(); clearTimeout(timer); void search(); });
  more.addEventListener('click', () => { more.disabled = true; void append(request).catch(() => { status.textContent = '加载失败，请重试。'; }).finally(() => { more.disabled = false; }); });
  box.addEventListener('keydown', (event) => {
    const links = [...list.querySelectorAll<HTMLAnchorElement>('a')];
    if (event.key === 'ArrowDown') {
      event.preventDefault(); links[Math.min(links.indexOf(document.activeElement as HTMLAnchorElement) + 1, links.length - 1)]?.focus();
    } else if (event.key === 'ArrowUp' && document.activeElement !== input) {
      event.preventDefault(); const index = links.indexOf(document.activeElement as HTMLAnchorElement); index > 0 ? links[index - 1].focus() : input.focus();
    }
  });
  if (fullPage) {
    input.value = new URL(location.href).searchParams.get('q') || '';
    if (input.value) void search();
    window.addEventListener('popstate', () => { input.value = new URL(location.href).searchParams.get('q') || ''; void search(); });
  }
}
