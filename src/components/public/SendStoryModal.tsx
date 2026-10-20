import React, { useState } from 'react';
import { X, Send, CheckCircle2, MessageCircle, MapPin, Calendar, User, FileText, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SendStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SendStoryModal({ isOpen, onClose }: SendStoryModalProps) {
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';

  const [authorName, setAuthorName] = useState('');
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState('');
  const [storyDate, setStoryDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [headline, setHeadline] = useState('');
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleSendWhatsApp = () => {
    const text = `*New Village Story Submission - Aswanna News*\n\n` +
      `*Name:* ${authorName || 'Not provided'}\n` +
      `*Contact:* ${contact || 'Not provided'}\n` +
      `*Location/Village:* ${location || 'Not provided'}\n` +
      `*Date:* ${storyDate}\n` +
      `*Headline:* ${headline}\n\n` +
      `*Story:* ${content}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const resetAndClose = () => {
    setSubmitted(false);
    setAuthorName('');
    setContact('');
    setLocation('');
    setHeadline('');
    setContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Green Accent */}
        <div className="bg-gradient-to-r from-emerald-800 to-green-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">
                {isSinhala ? 'ඔබේ ගමේ පුවතක් එවන්න' : 'Have a story from your village?'}
              </h3>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                {isSinhala ? 'දිනය, ස්ථානය සහ විස්තර අප වෙත එවන්න.' : 'Send it to us with the date, the place and photos.'}
              </p>
            </div>
          </div>
          <button 
            onClick={resetAndClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">
                  {isSinhala ? 'ස්තූතියි! ඔබගේ පුවත ලැබිණි.' : 'Thank you! Your story was received.'}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-sm mx-auto leading-relaxed">
                  {isSinhala
                    ? 'අපගේ සංස්කාරක මණ්ඩලය පුවත පරීක්ෂා කර අස්වැන්න පුවත් අංශයේ පළ කරනු ඇත.'
                    : 'Our editorial team will review your submission and publish it in our village news feed shortly.'}
                </p>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  {isSinhala ? 'WhatsApp මඟින්ද එවන්න' : 'Also send via WhatsApp'}
                </button>
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs sm:text-sm rounded-lg transition-colors cursor-pointer"
                >
                  {isSinhala ? 'වසන්න' : 'Close'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    {isSinhala ? 'ඔබගේ නම' : 'Your Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder={isSinhala ? 'නම ඇතුළත් කරන්න' : 'e.g. Sunil Perera'}
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-gray-400" />
                    {isSinhala ? 'දුරකථන / WhatsApp අංකය' : 'Phone / WhatsApp'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="07X XXX XXXX"
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {isSinhala ? 'ස්ථානය / ගම / දිස්ත්‍රික්කය' : 'Place / Village / District'}
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={isSinhala ? 'උදා: අනුරාධපුරය, තලාව' : 'e.g. Anuradhapura, Thalawa'}
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {isSinhala ? 'සිදුවූ දිනය' : 'Date of Event'}
                  </label>
                  <input
                    type="date"
                    required
                    value={storyDate}
                    onChange={(e) => setStoryDate(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  {isSinhala ? 'පුවතේ මාතෘකාව' : 'Story Headline / Title'}
                </label>
                <input
                  type="text"
                  required
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder={isSinhala ? 'පුවත පිළිබඳ කෙටි සිරස්තලය' : 'Headline of the story'}
                  className="w-full text-xs sm:text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isSinhala ? 'පුවතේ විස්තරය' : 'Story Details & Photos Description'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={isSinhala ? 'සිදුවීම, ගොවීන්ගේ ගැටලු, සාර්ථක අස්වනු හෝ වාරිමාර්ග විස්තර මෙහි සඳහන් කරන්න...' : 'Describe what happened, village farmer updates, irrigation news or harvest highlights...'}
                  className="w-full text-xs sm:text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  {isSinhala ? 'අවලංගු කරන්න' : 'Cancel'}
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg transition-colors cursor-pointer border border-emerald-200"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#135a38] hover:bg-[#0e432a] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSinhala ? 'පුවත එවන්න' : 'Submit Story'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
