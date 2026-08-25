import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronDown, ChevronRight, X } from 'lucide-react';

// Mock Data for Careers
const INITIAL_CAREER_DATA = [
  { id: 1, title: 'Agricultural Field Officer', type: 'Government', location: 'Anuradhapura, Sri Lanka', time: 'Full Time', posted: '2 days ago' },
  { id: 2, title: 'Farm Manager', type: 'Private', location: 'Nuwara Eliya, Sri Lanka', time: 'Full Time', posted: '3 days ago' },
  { id: 3, title: 'Community Outreach Coordinator', type: 'NGO', location: 'Colombo, Sri Lanka', time: 'Contract', posted: '1 week ago' },
  { id: 4, title: 'Harvesting Laborer (Tea Estate)', type: 'Daily Wage', location: 'Kandy, Sri Lanka', time: 'Daily/Casual', posted: 'Just now' },
  { id: 5, title: 'Agronomist', type: 'Private', location: 'Dambulla, Sri Lanka', time: 'Full Time', posted: '4 days ago' },
];

const JOB_TYPES = ['All', 'Government', 'Private', 'NGO', 'Daily Wage'];

export default function Careers() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const [jobsData, setJobsData] = useState(INITIAL_CAREER_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', location: '', wage: '' });
  const [expandedJob, setExpandedJob] = useState<number | null>(null);

  // Filter Logic
  const filteredJobs = jobsData.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = activeFilter === 'All' || job.type === activeFilter;
    return matchesSearch && matchesType;
  });

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title || !newJob.location) return;

    const jobEntry = {
      id: Date.now(),
      title: newJob.title,
      type: 'Daily Wage', // Automatically daily wage as requested
      location: newJob.location,
      time: 'Daily/Casual',
      posted: 'Just now',
    };

    setJobsData([jobEntry, ...jobsData]);
    setIsModalOpen(false);
    setNewJob({ title: '', location: '', wage: '' });
    // Switch filter to Daily Wage to see the new post easily
    setActiveFilter('Daily Wage');
  };

  return (
    <div className="w-full min-h-screen bg-white font-roboto">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] min-h-[400px] flex flex-col justify-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-secondary)]/90 via-black/50 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 lg:px-12 relative z-10 pt-40 md:pt-32">
          <div className="max-w-3xl">
            <h1 className="text-white text-5xl sm:text-6xl md:text-7xl font-black uppercase mb-6 drop-shadow-xl tracking-tight">
              {t('careers.title', 'CAREERS')}
            </h1>
            <p className="text-gray-100 text-lg sm:text-xl leading-relaxed max-w-2xl font-light drop-shadow-md">
              {t('careers.desc', 'Be part of the agricultural revolution. Explore opportunities across government, private sector, NGOs, and daily wage roles.')}
            </p>
          </div>
        </div>
      </section>

      {/* Filter and Search Section */}
      <section className="w-full py-16 bg-white border-b border-gray-100 shadow-sm relative z-20">
        <div className="container mx-auto px-4 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Search Bar */}
            <div className="w-full md:w-1/2 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all text-gray-700 shadow-sm"
                placeholder={t('careers.searchPlaceholder', 'Search for jobs, roles, or locations...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Filters */}
            <div className="w-full md:w-auto flex flex-wrap items-center gap-2">
              {JOB_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveFilter(type)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-sm ${activeFilter === type
                    ? 'bg-[var(--color-primary)] text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {t(`careers.types.${type.toLowerCase().replace(' ', '')}`, type)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Jobs List Section (Redesigned matching mockup) */}
      <section className="w-full py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">

            {/* Left Sidebar */}
            <div className="w-full lg:w-1/3 flex flex-col items-start lg:sticky lg:top-32 h-fit">
              <h2 className="text-[3.5rem] lg:text-[4rem] font-bold text-[#143d4d] leading-[1.1] mb-12 tracking-tight">
                Our Open<br />Roles
              </h2>
              <div className="flex flex-col items-start border-t-2 border-[var(--color-primary)] pt-6 w-full max-w-[200px]">
                <p className="text-xs font-bold text-[#143d4d] tracking-widest uppercase mb-2">Or contact us with</p>
                <a href="mailto:hello@aswanna.com" className="text-[#e87f3b] text-lg font-medium underline underline-offset-4 decoration-[#e87f3b]/30 hover:decoration-[#e87f3b] transition-colors">
                  hello@aswanna.com
                </a>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-8 px-8 py-4 bg-[var(--color-primary)]/80 hover:bg-[var(--color-primary)] border border-[var(--color-primary)]/50 backdrop-blur-md flex items-center justify-center text-white font-bold rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 uppercase tracking-wider w-full sm:w-auto"
              >
                Post a Job (Daily Wage)
              </button>
            </div>

            {/* Right Job List */}
            <div className="w-full lg:w-2/3 flex flex-col">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <div key={job.id} className="border-b border-gray-200 flex flex-col">
                    <div
                      className="py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group cursor-pointer"
                      onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                    >
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-[var(--color-primary)] uppercase tracking-[0.2em] mb-3">
                          OPEN ROLES • {t(`careers.types.${job.type.toLowerCase().replace(' ', '')}`, job.type)}
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-bold text-[#143d4d] mb-3 tracking-tight group-hover:text-[var(--color-primary)] transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium tracking-wide">
                          {job.time} <span className="mx-2 text-gray-300">•</span>
                          Negotiable <span className="mx-2 text-gray-300">•</span>
                          {job.location}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 mt-4 sm:mt-0">
                        <button
                          className={`w-12 h-12 rounded-full border border-[var(--color-primary)]/30 flex items-center justify-center transition-all duration-300 hidden sm:flex shrink-0 ${expandedJob === job.id ? 'bg-[var(--color-primary)] text-white rotate-180' : 'hover:bg-[var(--color-primary)]/10 text-[var(--color-primary)]'}`}
                          onClick={(e) => { e.stopPropagation(); setExpandedJob(expandedJob === job.id ? null : job.id); }}
                        >
                          <ChevronDown className="w-5 h-5" />
                        </button>
                        <button
                          className="px-8 py-4 bg-[var(--color-primary)]/80 hover:bg-[var(--color-primary)] border border-[var(--color-primary)]/50 backdrop-blur-md flex items-center justify-center text-white font-bold rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 uppercase tracking-wider shrink-0 w-full sm:w-auto"
                          onClick={(e) => { e.stopPropagation(); /* apply logic */ }}
                        >
                          Submit Application <ChevronRight className="w-4 h-4 ml-2" />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Description */}
                    <div
                      className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedJob === job.id ? 'max-h-[500px] opacity-100 mb-8' : 'max-h-0 opacity-0 mb-0'}`}
                    >
                      <div className="pl-6 border-l-4 border-[var(--color-primary)]/50 pt-2 pb-4">
                        <h4 className="text-lg font-bold text-[#143d4d] mb-2">Job Description</h4>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          We are looking for dedicated individuals to join our agriculture team. Experience in the field is highly valued. The role involves daily field operations, ensuring high-quality agricultural output, and collaborating with our extensive network of farming professionals to drive sustainable practices.
                        </p>

                        <h4 className="text-md font-bold text-[#143d4d] mb-3 uppercase tracking-wider text-sm">Requirements</h4>
                        <ul className="list-disc list-inside text-gray-600 space-y-2">
                          <li>Relevant experience in the agriculture or farming sector.</li>
                          <li>Ability to work well in a team environment and handle physical tasks.</li>
                          <li>Strong commitment to sustainable and ethical farming practices.</li>
                          <li>Excellent communication and problem-solving skills.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full py-20 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center mt-4">
                  <Search className="w-12 h-12 text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-[#143d4d] mb-2">{t('careers.noResults', 'No jobs found')}</h3>
                  <p className="text-gray-500 max-w-sm">{t('careers.noResultsDesc', 'We couldn\'t find any open positions matching your search. Try adjusting your filters.')}</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Post a Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-3xl w-full max-w-lg relative z-10 p-8 shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <h3 className="text-3xl font-black text-[#143d4d] mb-2">Post a Job</h3>
            <p className="text-gray-500 mb-8 font-medium">Create a new daily wage / casual labor posting.</p>

            <form onSubmit={handlePostJob} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Job Title</label>
                <input
                  type="text"
                  required
                  value={newJob.title}
                  onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[var(--color-primary)] outline-none"
                  placeholder="e.g. Tea Plucker, Tractor Driver"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Location</label>
                <input
                  type="text"
                  required
                  value={newJob.location}
                  onChange={e => setNewJob({ ...newJob, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[var(--color-primary)] outline-none"
                  placeholder="e.g. Kandy, Sri Lanka"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Daily Wage (Optional)</label>
                <input
                  type="text"
                  value={newJob.wage}
                  onChange={e => setNewJob({ ...newJob, wage: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[var(--color-primary)] outline-none"
                  placeholder="e.g. Rs. 2000/day"
                />
              </div>

              <button
                type="submit"
                className="mt-4 w-full py-4 bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all uppercase tracking-wider"
              >
                Publish Job
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
