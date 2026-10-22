import { isValidHttpUrl } from '../lib/validators';
import type { SimilarCase } from '../types';

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

interface SimilarCasesProps {
  cases: SimilarCase[];
  title: string;
}

export default function SimilarCases({ cases, title }: SimilarCasesProps) {
  const validCases = cases.filter((c) => isValidHttpUrl(c.url));
  if (validCases.length === 0) return null;

  return (
    <section aria-labelledby="similar-cases-heading">
      <h3
        id="similar-cases-heading"
        className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
      >
        {title}
      </h3>
      <ul className="space-y-2">
        {validCases.map((c, i) => {
          const domain = extractDomain(c.url);
          return (
            <li key={i}>
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:border-teal-400 dark:hover:border-teal-500 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                {domain && (
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
                    alt=""
                    width={16}
                    height={16}
                    className="mt-0.5 flex-shrink-0 opacity-70 group-hover:opacity-100"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
                    {c.title}
                  </p>
                  {domain && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{domain}</p>
                  )}
                </div>
                <svg
                  className="flex-shrink-0 w-3 h-3 text-gray-400 group-hover:text-teal-500 transition-colors mt-1 ml-auto"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
