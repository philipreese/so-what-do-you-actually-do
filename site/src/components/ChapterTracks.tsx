import { useEffect, useState } from 'react';
import './ChapterTracks.css';

interface ViewState {
  wife: boolean;
  kids: boolean;
}

interface ChapterTracksProps {
  engineerHtml: string;
  wifeHtml: string;
  kidsHtml: string;
  /** Placeholder for the chapter's mascot illustration until real art is generated. */
  mascotEmoji?: string;
  mascotSrc?: string;
}

const STORAGE_KEY = 'secondaryView';
const DEFAULT_VIEW: ViewState = { wife: true, kids: false };

function parseViewParam(value: string | null): ViewState | null {
  if (value === null) return null;
  if (value === 'hidden') return { wife: false, kids: false };
  const tokens = value.split(',');
  const view = { wife: tokens.includes('wife'), kids: tokens.includes('kids') };
  return view.wife || view.kids ? view : null;
}

function serializeView(view: ViewState): string {
  if (!view.wife && !view.kids) return 'hidden';
  return [view.wife && 'wife', view.kids && 'kids'].filter(Boolean).join(',');
}

function readInitialView(): ViewState {
  if (typeof window === 'undefined') return DEFAULT_VIEW;

  const fromUrl = parseViewParam(new URLSearchParams(window.location.search).get('view'));
  if (fromUrl) return fromUrl;

  const fromStorage = parseViewParam(window.localStorage.getItem(STORAGE_KEY));
  if (fromStorage) return fromStorage;

  return DEFAULT_VIEW;
}

export default function ChapterTracks({
  engineerHtml,
  wifeHtml,
  kidsHtml,
  mascotEmoji = '🦫',
  mascotSrc,
}: ChapterTracksProps) {
  // Lazy initializer so this only runs once, on mount, reading URL + localStorage.
  const [view, setView] = useState<ViewState>(readInitialView);

  useEffect(() => {
    const serialized = serializeView(view);
    window.localStorage.setItem(STORAGE_KEY, serialized);

    const url = new URL(window.location.href);
    if (serialized === serializeView(DEFAULT_VIEW)) {
      // Default state — keep shareable URLs clean unless the reader deliberately changed it.
      url.searchParams.delete('view');
    } else {
      url.searchParams.set('view', serialized);
    }
    window.history.replaceState({}, '', url);
  }, [view]);

  const paneCount = 1 + (view.wife ? 1 : 0) + (view.kids ? 1 : 0);
  const isEngineerOnly = paneCount === 1;

  return (
    <div className="chapter-tracks">
      <div className="track-toggle" role="group" aria-label="Choose which reading tracks to show">
        <button
          type="button"
          aria-pressed={view.wife}
          className={view.wife ? 'active' : ''}
          onClick={() => setView((v) => ({ ...v, wife: !v.wife }))}
        >
          For My Wife
        </button>
        <button
          type="button"
          aria-pressed={view.kids}
          className={view.kids ? 'active' : ''}
          onClick={() => setView((v) => ({ ...v, kids: !v.kids }))}
        >
          For My Kids
        </button>
        <button
          type="button"
          aria-pressed={isEngineerOnly}
          className={isEngineerOnly ? 'active' : ''}
          onClick={() => setView({ wife: false, kids: false })}
        >
          Engineer Only
        </button>
      </div>

      <div className={`track-panes panes-${paneCount} ${isEngineerOnly ? 'single' : 'split'}`}>
        <div className="pane pane-engineer">
          <h2 className="pane-label">For Engineers</h2>
          <div dangerouslySetInnerHTML={{ __html: engineerHtml }} />
        </div>

        {view.wife && (
          <div className="pane pane-secondary pane-secondary--wife">
            <h2 className="pane-label">For My Wife</h2>
            <div dangerouslySetInnerHTML={{ __html: wifeHtml }} />
          </div>
        )}

        {view.kids && (
          <div className="pane pane-secondary pane-secondary--kids">
            <h2 className="pane-label">For My Kids</h2>
            <div className="mascot-slot" aria-hidden={mascotSrc ? undefined : 'true'}>
              {mascotSrc ? (
                <img className="mascot-image" src={mascotSrc} alt="Chapter mascot" />
              ) : (
                <span className="mascot-placeholder" title="Mascot illustration placeholder">
                  {mascotEmoji}
                </span>
              )}
            </div>
            <div dangerouslySetInnerHTML={{ __html: kidsHtml }} />
          </div>
        )}
      </div>
    </div>
  );
}
