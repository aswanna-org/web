import React from 'react';
import { X, Briefcase, Calendar, CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { UserJobItem } from './UserJobModal';

interface UserJobViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: UserJobItem | null;
}

export const UserJobViewModal: React.FC<UserJobViewModalProps> = ({ isOpen, onClose, job }) => {
  if (!isOpen || !job) return null;

  const app = job.applicationInfo;
  const elig = job.eligibility;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Briefcase size={16} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                {job.designation}
              </h3>
              <p className="text-[11px] text-gray-500">
                {job.designationSi || job.companyName || 'Job Post Details'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-lg transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Status Badges */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200/70">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-gray-500">Status:</span>
              {job.approvalStatus === 'APPROVED' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 size={11} />
                  <span>Approved</span>
                </span>
              ) : job.approvalStatus === 'REJECTED' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">
                  <XCircle size={11} />
                  <span>Rejected</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                  <Clock size={11} />
                  <span>Pending Approval</span>
                </span>
              )}
            </div>

            <span className="text-[11px] text-gray-500">
              Listed on: {new Date(job.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Core Info */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-2xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Category</span>
              <span className="font-semibold text-gray-800">{job.jobCategory?.name || '—'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Nature</span>
              <span className="font-semibold text-gray-800">{job.jobNature || 'Full-Time'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Employer / Company</span>
              <span className="font-semibold text-gray-800">{job.companyName || job.institution?.name || 'Private'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Service Sector</span>
              <span className="font-semibold text-gray-800">{job.serviceCategory || '—'}</span>
            </div>
          </div>

          {/* Qualifications */}
          {elig && (
            <div className="space-y-2 p-3.5 bg-gray-50/70 rounded-xl border border-gray-200/60">
              <h4 className="font-bold text-gray-800 flex items-center gap-1.5">
                <span>Qualifications & Requirements</span>
              </h4>
              {elig.educationalQualifications && (
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Education:</span>
                  <p className="text-gray-700 mt-0.5">{elig.educationalQualifications}</p>
                </div>
              )}
              {elig.experience && (
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Experience:</span>
                  <p className="text-gray-700 mt-0.5">{elig.experience}</p>
                </div>
              )}
              {elig.ageLimit && (
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Age Limit:</span>
                  <p className="text-gray-700 mt-0.5">{elig.ageLimit}</p>
                </div>
              )}
            </div>
          )}

          {/* Application Details */}
          {app && (
            <div className="space-y-2 p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                <Calendar size={13} className="text-emerald-700" />
                <span>Application & Contact Info</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                {app.applicationDeadline && (
                  <div>
                    <span className="text-gray-500 font-medium">Deadline:</span>{' '}
                    <span className="font-bold text-emerald-800">
                      {new Date(app.applicationDeadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {app.contactPhone && (
                  <div>
                    <span className="text-gray-500 font-medium">Phone / WhatsApp:</span>{' '}
                    <span className="font-semibold text-gray-800">{app.contactPhone}</span>
                  </div>
                )}
                {app.applicationEmail && (
                  <div>
                    <span className="text-gray-500 font-medium">Email:</span>{' '}
                    <span className="font-semibold text-gray-800">{app.applicationEmail}</span>
                  </div>
                )}
                {app.applicationUrl && (
                  <div>
                    <span className="text-gray-500 font-medium">Website / Form:</span>{' '}
                    <a
                      href={app.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline font-semibold"
                    >
                      Apply Online
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserJobViewModal;

