import React, { useState, useRef } from 'react';
import { ProjectFeature } from '../types';
import { FileText, Printer, Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';

type LetterType = 'future-dev' | 'project-plan' | 'engineering-plan' | 'uu-plans';

interface LetterConfig {
  id: LetterType;
  title: string;
  shortTitle: string;
  description: string;
  subject: (featureNo: string, agreement: string) => string;
  body: (params: LetterParams) => string;
}

interface LetterParams {
  features: ProjectFeature[];
  agreement: string;
  refNo: string;
  date: string;
  recipientName: string;
  recipientTitle: string;
  recipientDept: string;
  senderName: string;
  senderTitle: string;
  remarks: string;
}

const LETTER_CONFIGS: LetterConfig[] = [
  {
    id: 'future-dev',
    title: 'Checking of Future Land Sale / Development Programmes',
    shortTitle: 'Future Development',
    description: 'Request to check future land sale and development programmes near slope features',
    subject: (featureNo, agreement) =>
      `${agreement} - LPMit Programme\nChecking of Future Land Sale / Development Programmes\nFeature No. ${featureNo}`,
    body: (p) => {
      const featureList = p.features.map(f => `${f.featureNo} (${f.location})`).join('\n');
      return `Dear ${p.recipientName},

${p.agreement} - Landslip Prevention and Mitigation Programme
Checking of Future Land Sale / Development Programmes

I am writing on behalf of the Consultant to the above Agreement to check whether there are any future land sale or development programmes planned in the vicinity of the following slope feature(s):

${featureList}

In connection with the captioned LPMit Programme, we are required to check with your Department whether there are any future land sale or development programmes, land grants, or modification of conditions of land sale/grants that may affect the above slope feature(s) or be affected by the proposed slope upgrading works.

We should be grateful if you could advise us of any such programmes at your earliest convenience. A plan showing the location(s) of the feature(s) is attached for your reference.

${p.remarks ? `Remarks: ${p.remarks}\n\n` : ''}Should you require any further information, please do not hesitate to contact the undersigned.

Yours faithfully,


${p.senderName}
${p.senderTitle}
for Consultant to ${p.agreement}`;
    },
  },
  {
    id: 'project-plan',
    title: 'Circulation of Project Plan for Comment',
    shortTitle: 'Project Plan',
    description: 'Circulate project plan to relevant departments for comment',
    subject: (featureNo, agreement) =>
      `${agreement} - LPMit Programme\nCirculation of Project Plan for Comment\nFeature No. ${featureNo}`,
    body: (p) => {
      const featureList = p.features.map(f => `${f.featureNo} (${f.location})`).join('\n');
      return `Dear ${p.recipientName},

${p.agreement} - Landslip Prevention and Mitigation Programme
Circulation of Project Plan for Comment
Feature No. ${p.features.map(f => f.featureNo).join(', ')}

I am writing on behalf of the Consultant to the above Agreement to circulate the Project Plan for the following slope feature(s) for your comment:

${featureList}

In accordance with the established procedures for the LPMit Programme, we are circulating the Project Plan to your Department for comment. The Project Plan outlines the proposed scope of works, programme, and other relevant details for the slope upgrading works.

Please find enclosed the following documents for your review and comment:
(a) Project Plan
(b) Location Plan
(c) Preliminary Design Layout

We should be grateful if you could provide your comments within 4 weeks from the date of this letter. Should no reply be received by the specified date, it will be assumed that your Department has no comment on the Project Plan.

${p.remarks ? `Remarks: ${p.remarks}\n\n` : ''}Should you require any further information, please do not hesitate to contact the undersigned.

Yours faithfully,


${p.senderName}
${p.senderTitle}
for Consultant to ${p.agreement}`;
    },
  },
  {
    id: 'engineering-plan',
    title: 'Circulation of Engineering Plan for Comment',
    shortTitle: 'Engineering Plan',
    description: 'Circulate engineering plan to relevant departments for comment',
    subject: (featureNo, agreement) =>
      `${agreement} - LPMit Programme\nCirculation of Engineering Plan for Comment\nFeature No. ${featureNo}`,
    body: (p) => {
      const featureList = p.features.map(f => `${f.featureNo} (${f.location})`).join('\n');
      return `Dear ${p.recipientName},

${p.agreement} - Landslip Prevention and Mitigation Programme
Circulation of Engineering Plan for Comment
Feature No. ${p.features.map(f => f.featureNo).join(', ')}

I am writing on behalf of the Consultant to the above Agreement to circulate the Engineering Plan for the following slope feature(s) for your comment:

${featureList}

In accordance with the established procedures for the LPMit Programme, we are circulating the Engineering Plan to your Department for comment. The Engineering Plan contains the detailed design, specifications, and construction methodology for the proposed slope upgrading works.

Please find enclosed the following documents for your review and comment:
(a) Engineering Plan (including detailed design drawings)
(b) Specifications
(c) Construction Methodology
(d) Geotechnical Assessment Report
(e) Environmental Review

We should be grateful if you could provide your comments within 4 weeks from the date of this letter. Should no reply be received by the specified date, it will be assumed that your Department has no comment on the Engineering Plan.

${p.remarks ? `Remarks: ${p.remarks}\n\n` : ''}Should you require any further information, please do not hesitate to contact the undersigned.

Yours faithfully,


${p.senderName}
${p.senderTitle}
for Consultant to ${p.agreement}`;
    },
  },
  {
    id: 'uu-plans',
    title: 'Checking of Underground Utility Plans',
    shortTitle: 'UU Plans',
    description: 'Request underground utility plans from utility undertakers',
    subject: (featureNo, agreement) =>
      `${agreement} - LPMit Programme\nRequest for Underground Utility Plans\nFeature No. ${featureNo}`,
    body: (p) => {
      const featureList = p.features.map(f => `${f.featureNo} (${f.location})`).join('\n');
      return `Dear ${p.recipientName},

${p.agreement} - Landslip Prevention and Mitigation Programme
Request for Underground Utility Plans
Feature No. ${p.features.map(f => f.featureNo).join(', ')}

I am writing on behalf of the Consultant to the above Agreement to request for the underground utility plans in the vicinity of the following slope feature(s):

${featureList}

In connection with the captioned LPMit Programme, we are carrying out investigation and design works for the proposed slope upgrading works at the above location(s). We should be grateful if you could provide us with the as-built plans showing the locations and details of any underground utilities owned and/or maintained by your organisation within the study area as indicated on the attached plan(s).

Please also advise us of any planned utility works or diversion programmes in the vicinity of the above feature(s).

A location plan showing the extent of the area of interest is enclosed for your reference. The information provided will be used for planning and design purposes only.

${p.remarks ? `Remarks: ${p.remarks}\n\n` : ''}We should be most grateful for your early reply. Should you require any further information, please do not hesitate to contact the undersigned.

Yours faithfully,


${p.senderName}
${p.senderTitle}
for Consultant to ${p.agreement}`;
    },
  },
];

interface CoverLetterGeneratorProps {
  data: ProjectFeature[];
  agreementName: string;
}

const CoverLetterGenerator: React.FC<CoverLetterGeneratorProps> = ({ data, agreementName }) => {
  const [selectedType, setSelectedType] = useState<LetterType>('future-dev');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [refNo, setRefNo] = useState('');
  const [recipientName, setRecipientName] = useState('Sir/Madam');
  const [recipientTitle, setRecipientTitle] = useState('');
  const [recipientDept, setRecipientDept] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderTitle, setSenderTitle] = useState('Project Manager');
  const [remarks, setRemarks] = useState('');
  const [copied, setCopied] = useState(false);
  const [showFeatureSelector, setShowFeatureSelector] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const config = LETTER_CONFIGS.find(c => c.id === selectedType)!;
  const selectedFeatureObjects = data.filter(f => selectedFeatures.includes(f.id));

  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const featureNos = selectedFeatureObjects.map(f => f.featureNo).join(', ') || '[Select features]';

  const toggleFeature = (id: string) => {
    setSelectedFeatures(prev =>
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedFeatures(data.map(f => f.id));
  };

  const clearAll = () => {
    setSelectedFeatures([]);
  };

  const generatedLetter = selectedFeatureObjects.length > 0
    ? config.body({
        features: selectedFeatureObjects,
        agreement: agreementName,
        refNo,
        date: today,
        recipientName,
        recipientTitle,
        recipientDept,
        senderName,
        senderTitle,
        remarks,
      })
    : '';

  const generatedSubject = selectedFeatureObjects.length > 0
    ? config.subject(featureNos, agreementName)
    : '';

  const handleCopy = () => {
    const fullText = `Our Ref: ${refNo}\nDate: ${today}\n\n${recipientDept ? `${recipientDept}\n` : ''}${recipientTitle ? `${recipientTitle}\n` : ''}\n\nSubject: ${generatedSubject}\n\n${generatedLetter}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Cover Letter - ${config.shortTitle}</title>
          <style>
            body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; margin: 2cm 2.5cm; color: #000; }
            .header { margin-bottom: 20px; }
            .ref { font-size: 11pt; }
            .subject { font-weight: bold; text-decoration: underline; margin: 20px 0; white-space: pre-line; }
            .body { white-space: pre-line; }
            @media print { body { margin: 2cm 2.5cm; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="ref">Our Ref: ${refNo || '_______________'}</div>
            <div class="ref">Date: ${today}</div>
          </div>
          ${recipientDept ? `<div>${recipientDept}</div>` : ''}
          ${recipientTitle ? `<div>${recipientTitle}</div>` : ''}
          <div class="subject">${generatedSubject}</div>
          <div class="body">${generatedLetter}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Cover Letter Generator</h2>
          <p className="text-sm text-gray-500 mt-0.5">{agreementName} - Generate standard cover letters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="space-y-4">
          {/* Letter Type Selection */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Letter Type</label>
            <div className="grid grid-cols-2 gap-2">
              {LETTER_CONFIGS.map(cfg => (
                <button
                  key={cfg.id}
                  onClick={() => setSelectedType(cfg.id)}
                  className={`text-left p-3 rounded-lg border-2 transition-all ${
                    selectedType === cfg.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`text-sm font-semibold ${selectedType === cfg.id ? 'text-indigo-700' : 'text-gray-800'}`}>
                    {cfg.shortTitle}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{cfg.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Feature Selection */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Select Features ({selectedFeatures.length}/{data.length})
              </label>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-[10px] text-indigo-600 hover:text-indigo-700 font-medium">Select All</button>
                <button onClick={clearAll} className="text-[10px] text-gray-500 hover:text-gray-600 font-medium">Clear</button>
              </div>
            </div>
            <button
              onClick={() => setShowFeatureSelector(!showFeatureSelector)}
              className="w-full flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-sm text-left"
            >
              <span className={selectedFeatures.length > 0 ? 'text-gray-800' : 'text-gray-400'}>
                {selectedFeatures.length > 0 ? `${selectedFeatures.length} feature(s) selected` : 'Click to select features...'}
              </span>
              {showFeatureSelector ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
            </button>
            {showFeatureSelector && (
              <div className="mt-2 max-h-[200px] overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                {data.map(feature => (
                  <label
                    key={feature.id}
                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(feature.id)}
                      onChange={() => toggleFeature(feature.id)}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-gray-800">{feature.featureNo}</span>
                      <span className="text-[10px] text-gray-500 ml-2">{feature.location}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Letter Details */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Letter Details</label>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Our Reference No.</label>
              <input
                type="text"
                value={refNo}
                onChange={e => setRefNo(e.target.value)}
                placeholder="e.g. GEO/P/1/47/C(1)"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Recipient Name</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  placeholder="Sir/Madam"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Recipient Title</label>
                <input
                  type="text"
                  value={recipientTitle}
                  onChange={e => setRecipientTitle(e.target.value)}
                  placeholder="e.g. District Lands Officer"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Recipient Department</label>
              <input
                type="text"
                value={recipientDept}
                onChange={e => setRecipientDept(e.target.value)}
                placeholder="e.g. Lands Department, North District Lands Office"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Sender Name</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={e => setSenderName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Sender Title</label>
                <input
                  type="text"
                  value={senderTitle}
                  onChange={e => setSenderTitle(e.target.value)}
                  placeholder="Project Manager"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Additional Remarks (optional)</label>
              <textarea
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="Any additional notes or special instructions..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold text-gray-800">Letter Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  disabled={selectedFeatures.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handlePrint}
                  disabled={selectedFeatures.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>
              </div>
            </div>

            <div ref={previewRef} className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
              {selectedFeatures.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Select features and fill in details to preview the letter</p>
                </div>
              ) : (
                <div className="font-serif text-sm leading-relaxed text-gray-800 space-y-4">
                  {/* Header */}
                  <div className="text-xs text-gray-600 space-y-0.5">
                    <div>Our Ref: {refNo || '_______________'}</div>
                    <div>Date: {today}</div>
                  </div>

                  {/* Recipient */}
                  {(recipientDept || recipientTitle) && (
                    <div className="text-xs text-gray-600">
                      {recipientDept && <div>{recipientDept}</div>}
                      {recipientTitle && <div>{recipientTitle}</div>}
                    </div>
                  )}

                  {/* Subject */}
                  <div className="font-bold underline whitespace-pre-line text-sm">
                    {generatedSubject}
                  </div>

                  {/* Body */}
                  <div className="whitespace-pre-line text-sm">
                    {generatedLetter}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick reference: selected features */}
          {selectedFeatures.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Selected Features ({selectedFeatures.length})
              </label>
              <div className="space-y-1 max-h-[120px] overflow-y-auto">
                {selectedFeatureObjects.map(f => (
                  <div key={f.id} className="flex items-center justify-between text-xs px-2 py-1 bg-gray-50 rounded">
                    <span className="font-semibold text-gray-800">{f.featureNo}</span>
                    <span className="text-gray-500 truncate ml-2">{f.location}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoverLetterGenerator;
