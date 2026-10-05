import { FormEvent, useCallback, useEffect, useState } from "react";
import { createLink, listLinks, type Link } from "./api";

export function App() {
  const [links, setLinks] = useState<Link[]>([]);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setLinks(await listLinks());
    } catch {
      setError("Could not reach the API. Is it running on port 3000?");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await createLink(url.trim());
      setUrl("");
      await refresh();
    } catch {
      setError("That does not look like a valid http(s) URL.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container">
      <header>
        <h1>LinkPulse</h1>
        <p className="subtitle">Shorten a link and watch the clicks come in.</p>
      </header>

      <form onSubmit={onSubmit} className="create">
        <input
          type="url"
          required
          placeholder="https://example.com/a/very/long/url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button type="submit" disabled={busy}>
          {busy ? "Shortening..." : "Shorten"}
        </button>
      </form>
      {error && <p className="error">{error}</p>}

      <table>
        <thead>
          <tr>
            <th>Short link</th>
            <th>Destination</th>
            <th className="num">Clicks</th>
          </tr>
        </thead>
        <tbody>
          {links.length === 0 && (
            <tr>
              <td colSpan={3} className="empty">
                No links yet.
              </td>
            </tr>
          )}
          {links.map((l) => (
            <tr key={l.id}>
              <td>
                <a href={l.shortUrl} target="_blank" rel="noreferrer">
                  {l.shortUrl}
                </a>
              </td>
              <td className="dest" title={l.originalUrl}>
                {l.originalUrl}
              </td>
              <td className="num">{l.clicks}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="ghost" onClick={() => void refresh()}>
        Refresh
      </button>
    </main>
  );
}
