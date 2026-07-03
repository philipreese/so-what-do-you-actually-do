import { useEffect, useState } from 'react';
import './ChapterTracks.css';

type SecondaryView = 'wife' | 'kids' | 'hidden';

interface ChapterTracksProps {
  engineerHtml: string;
  wifeHtml: string;
  kidsHtml: string;
}

const STORAGE_KEY = 'secondaryView';
const VALID_VIEWS: SecondaryView[] = ['wife', 'kids', 'hidden'];

function readInitialView(): SecondaryView {
  if (typeof window === 'undefined') return 'wife';

  const fromUrl = new URLSearchParams(window.location.search).get('view');
  if (fromUrl && VALID_VIEWS.includes(fromUrl as SecondaryView)) {
    return fromUrl as SecondaryView;
  }

  const fromStorage = window.localStorage.getItem(STORAGE_KEY);
  if (fromStorage && VALID_VIEWS.includes(fromStorage as SecondaryView)) {
    return fromStorage as SecondaryView;
  }

  return 'wife';
}

export default function ChapterTracks({ engineerHtml, wifeHtml, kidsHtml }: ChapterTracksProps) {
  // Lazy initializer so this only runs once, on mount, reading URL + localStorage.
  const [secondaryView, setSecondaryView] = useState<SecondaryView>(readInitialView);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, secondaryView);

    const url = new URL(window.location.href);
    if (secondaryView === 'wife') {
      // "wife" is the default — keep shareable URLs clean unless the reader deliberately left it.
      url.searchParams.delete('view');
    } else {
      url.searchParams.set('view', secondaryView);
    }
    window.history.replaceState({}, '', url);
  }, [secondaryView]);

  const secondaryHtml = secondaryView === 'kids' ? kidsHtml : wifeHtml;
  const secondaryLabel = secondaryView === 'kids' ? 'For My Kids' : 'For My Wife';

  return (
    <div className="chapter-tracks">
      <div className="track-toggle" role="group" aria-label="Choose a second reading track">
        <button
          type="button"
          aria-pressed={secondaryView === 'wife'}
          className={secondaryView === 'wife' ? 'active' : ''}
          onClick={() => setSecondaryView('wife')}
        >
          For My Wife
        </button>
        <button
          type="button"
          aria-pressed={secondaryView === 'kids'}
          className={secondaryView === 'kids' ? 'active' : ''}
          onClick={() => setSecondaryView('kids')}
        >
          For My Kids
        </button>
        <button
          type="button"
          aria-pressed={secondaryView === 'hidden'}
          className={secondaryView === 'hidden' ? 'active' : ''}
          onClick={() => setSecondaryView('hidden')}
        >
          Engineer Only
        </button>
      </div>

      <div className={`track-panes ${secondaryView === 'hidden' ? 'single' : 'split'}`}>
        <div className="pane pane-engineer">
          <h2 className="pane-label">For Engineers</h2>
          <div dangerouslySetInnerHTML={{ __html: engineerHtml }} />
        </div>

        {secondaryView !== 'hidden' && (
          <div className={`pane pane-secondary pane-secondary--${secondaryView}`} key={secondaryView}>
            <h2 className="pane-label">{secondaryLabel}</h2>
            <div dangerouslySetInnerHTML={{ __html: secondaryHtml }} />
          </div>
        )}
      </div>
    </div>
  );
}
