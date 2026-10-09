import { useParams } from 'react-router-dom';
import Careers from './Careers';
import JobDetail from './JobDetail';

// Category slugs or keywords that indicate a career category view rather than a job detail view
const CATEGORY_SLUGS = new Set([
  'government-jobs',
  'private-jobs',
  'foreign-jobs',
  'daily-wage-jobs',
  'daily-wage',
  'daily-workers',
  'categories'
]);

export default function CareerDispatcher() {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const identifier = (slug || id || '').toLowerCase().trim();

  // If the identifier matches a known category or category pattern, route to Careers inside that category
  const isCategory =
    CATEGORY_SLUGS.has(identifier) ||
    identifier.includes('government') ||
    identifier.includes('private-job') ||
    identifier.includes('foreign-job') ||
    identifier.includes('daily-wage');

  if (isCategory) {
    return <Careers />;
  }

  // Otherwise, it is an individual job posting detail page
  return <JobDetail />;
}
