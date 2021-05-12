import axios from 'axios';
import { load, root } from 'cheerio';
import Turndown from 'turndown';

interface BaseInfoResponse {
  description: string;
  name: string;
  parameters: string;
  syntax: string;
  url: string;
}

interface ExtendedInfoResponse extends BaseInfoResponse {
  returns: string;
}

interface Search {
  title: string;
  url: string;
}

type Cheerio = ReturnType<typeof root>;

const baseURL = 'https://developer.mozilla.org';

export async function searchDocs(query: string): Promise<Search[] | null> {
  const { data, status } = await axios.get<string>('/en-US/search', { baseURL, params: { q: query } });
  if (status !== 200) return null;

  const $ = load(data);

  return $('div.result > div > a.result-title')
    .map((_, e) => ({ name: $(e).text(), url: $(e).attr('href') }))
    .get()
    .filter(({ name, url }) => url.includes('Web/JavaScript/Reference') && !name.startsWith('Warning: '));
}

export async function resolveInfo(link: string): Promise<BaseInfoResponse | ExtendedInfoResponse | null> {
  let url = link;
  try {
    new URL(link);
  } catch {
    url = `${baseURL}${link}`;
  }

  const { data, status } = await axios.get<string>(url);
  if (status !== 200) return null;

  const $ = load(data);
  const tn = new Turndown();

  const name = $('#react-container > main > header > div.titlebar-container > div > h1').text();

  if (!/global_objects\/[\w\d-_]+(?:\/)?$/i.test(url)) {
    const description = convertHtmlToMarkdown($('#wikiArticle > p:nth-child(12)'), tn);
    const parameters = convertHtmlToMarkdown($('#wikiArticle > dl'), tn);
    const returns = convertHtmlToMarkdown($('#wikiArticle > p:nth-child(10)'), tn);
    const syntax = convertHtmlToMarkdown($('#wikiArticle > pre.syntaxbox.notranslate'), tn);

    return { description, name, parameters, returns, syntax, url };
  }

  const description = convertHtmlToMarkdown($('#wikiArticle > p:nth-child(4)'), tn);
  const parameters = convertHtmlToMarkdown($('#wikiArticle > dl'), tn);
  const syntax = convertHtmlToMarkdown($('#wikiArticle > pre.syntaxbox.notranslate'), tn);

  return { description, name, parameters, syntax, url };
}

function convertHtmlToMarkdown(sel: Cheerio, tn: Turndown): string {
  const html = sel.html();
  if (html) return tn.turndown(html);

  return sel.text();
}
