// 'use client';

// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { CheckCircle, AlertTriangle, Lightbulb, Download, Mail, Linkedin, Github, TrendingUp } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
// import { saveAs } from 'file-saver';
// import ReactDiffViewer from 'react-diff-viewer-continued';

// // --- MODIFIED SECTION START ---
// // ====================================================================
// // SECTION 1: STYLED RESUME COMPONENT (IMPROVED PROFESSIONAL FORMAT)
// // ====================================================================
// const StyledResume = ({ text }: { text: string }) => {
//   if (!text) return null;
//   const lines = text.split('\n').filter(line => line.trim() !== '');

//   return (
//     <div className="w-full max-w-4xl p-10 bg-white rounded-lg shadow-lg border font-sans text-gray-800">
//       <div className="space-y-5">
//         {lines.map((line, index) => {
//           const trimmed = line.trim();

//           // First line = Name
//           if (index === 0) {
//             return (
//               <h1 key={index} className="text-4xl font-bold text-center text-gray-900 tracking-tight pb-2">
//                 {trimmed}
//               </h1>
//             );
//           }

//           // Contact Info
//           if (trimmed.includes('@') || trimmed.toLowerCase().includes('linkedin')) {
//             const contactParts = trimmed.split('|').map(p => p.trim());
//             return (
//               <div
//                 key={index}
//                 className="flex justify-center items-center gap-x-5 gap-y-1 flex-wrap text-sm text-gray-600 font-medium pb-5 border-b border-gray-200"
//               >
//                 {contactParts.map((part, partIndex) => {
//                   let icon = null;
//                   if (part.includes('@')) icon = <Mail size={14} />;
//                   if (part.toLowerCase().includes('linkedin')) icon = <Linkedin size={14} />;
//                   if (part.toLowerCase().includes('github')) icon = <Github size={14} />;
//                   return (
//                     <a href={part.startsWith('http') || part.includes('@') ? (part.includes('@') ? `mailto:${part}` : part) : '#'} target="_blank" rel="noopener noreferrer" key={partIndex} className="flex items-center gap-1.5 hover:text-blue-600">
//                       {icon} {part}
//                     </a>
//                   );
//                 })}
//               </div>
//             );
//           }

//           // Section Headers (e.g., PROFESSIONAL EXPERIENCE)
//           if ((trimmed.startsWith('**') && trimmed.endsWith('**')) || (trimmed.match(/^[A-Z\s&]+$/) && trimmed.length > 3 && !trimmed.includes('|'))) {
//             const cleanHeader = trimmed.replace(/\*\*/g, '');
//             return (
//               <h2 key={index} className="text-sm font-bold text-blue-700 tracking-wider uppercase border-b-2 border-gray-200 pt-4 pb-1.5">
//                 {cleanHeader}
//               </h2>
//             );
//           }

//           // Job/Project Title lines with Company | Role | Date
//           if (trimmed.includes('|')) {
//             const parts = trimmed.split('|').map(p => p.trim());
//             const [title, entity, date] = parts;
//             return (
//               <div key={index} className="mt-3">
//                 <div className="flex justify-between items-baseline">
//                   <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
//                   <span className="text-sm font-medium text-gray-600">{date}</span>
//                 </div>
//                 <p className="text-md text-gray-700 italic">{entity}</p>
//               </div>
//             );
//           }

//           // Skills formatted as **Category:** Skill, Skill
//           if (trimmed.startsWith('**') && trimmed.includes(':')) {
//              const parts = trimmed.split(/:\s*/);
//              const category = parts[0].replace(/\*\*/g, '').trim();
//              const skills = parts.slice(1).join(':').trim();
//              return(
//                 <div key={index} className="flex items-start text-sm mt-1.5">
//                     <p className="w-40 font-semibold text-gray-700 shrink-0">{category}</p>
//                     <p className="flex-1 text-gray-600 leading-relaxed">{skills}</p>
//                 </div>
//              )
//           }

//           // Bullet points
//           if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
//             const bulletText = trimmed.replace(/^[-•]\s*/, '');
//             return (
//               <div key={index} className="flex items-start text-sm ml-4">
//                 <span className="mr-2.5 mt-1 text-gray-500 font-bold">•</span>
//                 <p className="flex-1 text-gray-700 leading-relaxed">
//                   {bulletText}
//                 </p>
//               </div>
//             );
//           }

//           // Default body text (like a summary)
//           return (
//             <p key={index} className="text-sm text-gray-700 leading-relaxed">
//               {trimmed}
//             </p>
//           );
//         })}
//       </div>
//     </div>
//   );
// };
// // --- MODIFIED SECTION END ---

// interface EvaluationData {
//   overall_score: number;
//   breakdown: { [key: string]: number | string };
//   missing_keywords: string[];
//   quick_wins: string[];
// }
// interface ResultsTabsProps {
//   results: {
//     cleaned: any;
//     rewritten: any;
//     final_resume: any;
//     evaluation: any;
//   };
// }

// export default function ResultsTabs({ results }: ResultsTabsProps) {
//   if (!results) return null;

//   const getRenderableString = (data: any): string => {
//     if (typeof data === 'string') return data;
//     if (typeof data === 'object' && data !== null && 'raw_output' in data)
//       return data.raw_output;
//     return '';
//   };

//   let evaluationData: EvaluationData | null = null;
//   const evaluationString = getRenderableString(results.evaluation);

//   if (evaluationString) {
//     try {
//       evaluationData = JSON.parse(evaluationString);
//     } catch {
//       try {
//         let fixed = evaluationString
//           .replace(/'/g, '"')
//           .replace(/:\s*(\d+\s*\/\s*\d+)/g, ': "$1"')
//           .replace(/,\s*([}\]])/g, '$1');
          
//         evaluationData = JSON.parse(fixed);
//       } catch (err) {
//         console.error("Failed to parse evaluation data even after fixes:", err);
//       }
//     }
//   }

//   const finalResumeText = getRenderableString(results.final_resume);
//   const cleanedText = getRenderableString(results.cleaned);
//   const rewrittenText = getRenderableString(results.rewritten);

//   const handleDownloadDocx = () => {
//     const lines = finalResumeText.split('\n');
//     const docChildren: Paragraph[] = [];
//     lines.forEach((line, index) => {
//       if (
//         line.trim().match(/^[A-Z\s&]+$/) &&
//         line.trim().length > 5 &&
//         !line.includes('|')
//       ) {
//         docChildren.push(
//           new Paragraph({
//             text: line,
//             heading: HeadingLevel.HEADING_2,
//             spacing: { before: 240, after: 120 },
//           })
//         );
//       } else if (index === 0) {
//         docChildren.push(
//           new Paragraph({ text: line, heading: HeadingLevel.HEADING_1, style: 'Title' })
//         );
//       } else if (line.trim().startsWith('-')) {
//         docChildren.push(
//           new Paragraph({ text: line.substring(1).trim(), bullet: { level: 0 } })
//         );
//       } else {
//         docChildren.push(new Paragraph(line));
//       }
//     });
//     const doc = new Document({ sections: [{ children: docChildren }] });
//     Packer.toBlob(doc).then((blob) => saveAs(blob, 'Optimized_Resume.docx'));
//   };

//   return (
//     <Tabs defaultValue="optimized" className="w-full">
//       <TabsList className="grid w-full grid-cols-4">
//         <TabsTrigger value="evaluation">ATS Evaluation</TabsTrigger>
//         <TabsTrigger value="optimized">Optimized Resume</TabsTrigger>
//         <TabsTrigger value="rewritten">Rewritten Sections</TabsTrigger>
//         <TabsTrigger value="cleaned">Cleaned Resume</TabsTrigger>
//       </TabsList>

//       {/* ==================================================================== */}
//       {/* SECTION 2: ATS Evaluation                                           */}
//       {/* ==================================================================== */}
//       <TabsContent value="evaluation">
//         <Card>
//           <CardHeader>
//             <CardTitle>📊 ATS Evaluation Report</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-10">
//             {evaluationData ? (
//               <>
//                 {/* Overall Score */}
//                 <div className="flex justify-center">
//                   <div className="flex flex-col items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-md p-8 border border-blue-200">
//                     <p className="text-sm font-semibold text-blue-700 tracking-wider uppercase">
//                       Overall ATS Score
//                     </p>
//                     <div className="relative flex items-center justify-center mt-4">
//                       <div className="w-32 h-32 rounded-full border-8 border-blue-200 flex items-center justify-center">
//                         <span className="text-5xl font-bold text-blue-900">
//                           {evaluationData.overall_score}
//                         </span>
//                       </div>
//                       <span className="absolute bottom-3 text-gray-500 text-sm">/100</span>
//                     </div>
//                     <p className="mt-4 text-sm text-gray-600">
//                       Higher scores increase chances of passing ATS filters.
//                     </p>
//                   </div>
//                 </div>

//                 {/* Score Breakdown */}
//                 {evaluationData.breakdown && (
//                   <div>
//                     <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
//                       <TrendingUp className="h-5 w-5 mr-2 text-indigo-500" /> Score Breakdown
//                     </h4>
//                     <div className="flex flex-wrap gap-3">
//                       {Object.entries(evaluationData.breakdown).map(([key, value]) => (
//                         <div
//                           key={key}
//                           className="bg-white shadow-sm border px-4 py-2 rounded-lg text-sm"
//                         >
//                           <span className="font-medium text-gray-700">
//                             {key.charAt(0).toUpperCase() + key.slice(1)}:
//                           </span>{' '}
//                           <span className="font-bold text-indigo-600">{value}</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Missing Keywords */}
//                 {evaluationData.missing_keywords && (
//                   <div>
//                     <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
//                       <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" /> Missing Keywords
//                     </h4>
//                     <div className="flex flex-wrap gap-2">
//                       {evaluationData.missing_keywords.map((keyword, index) => (
//                         <span
//                           key={index}
//                           className="bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full shadow-sm"
//                         >
//                           {keyword}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Actionable Recommendations */}
//                 {evaluationData.quick_wins && (
//                   <div>
//                     <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
//                       <Lightbulb className="h-5 w-5 mr-2 text-green-500" /> Actionable Recommendations
//                     </h4>
//                     <ul className="space-y-3 text-sm text-gray-700">
//                       {evaluationData.quick_wins.map((win, index) => (
//                         <li
//                           key={index}
//                           className="flex items-start bg-green-50 border border-green-200 p-3 rounded-lg shadow-sm"
//                         >
//                           <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
//                           <span>{win}</span>
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}
//               </>
//             ) : (
//               <div className="w-full p-4 bg-red-50 rounded-lg border border-red-200 text-sm text-red-800">
//                 <p className="font-semibold mb-2 flex items-center">
//                   <AlertTriangle className="h-5 w-5 mr-2" /> Could not parse evaluation data.
//                 </p>
//                 <pre className="w-full p-4 bg-gray-50 text-gray-700 rounded-md border text-xs whitespace-pre-wrap font-sans">
//                   {evaluationString || 'No evaluation data was received.'}
//                 </pre>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </TabsContent>

//       {/* ==================================================================== */}
//       {/* SECTION 3: Optimized Resume                                         */}
//       {/* ==================================================================== */}
//       <TabsContent value="optimized">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between">
//             <CardTitle>📄 Optimized Resume</CardTitle>
//             <Button onClick={handleDownloadDocx}>
//               <Download className="mr-2 h-4 w-4" />
//               Download as .docx
//             </Button>
//           </CardHeader>
//           <CardContent className="bg-slate-100 p-8 flex justify-center">
//             <StyledResume text={finalResumeText} />
//           </CardContent>
//         </Card>
//       </TabsContent>

//       {/* ==================================================================== */}
//       {/* SECTION 4: Rewritten Sections                                       */}
//       {/* ==================================================================== */}
//       <TabsContent value="rewritten">
//         <Card>
//           <CardHeader>
//             <CardTitle>✍️ Rewritten Sections</CardTitle>
//             <p className="text-sm text-gray-500 pt-1">
//               Comparing the original text (left) with the rewritten version (right).
//             </p>
//           </CardHeader>
//           <CardContent>
//             <div className="rounded-lg border overflow-hidden">
//               <ReactDiffViewer
//                 oldValue={cleanedText}
//                 newValue={rewrittenText}
//                 splitView={true}
//                 showDiffOnly={false}
//                 leftTitle="Original Text"
//                 rightTitle="Rewritten Version"
//               />
//             </div>
//           </CardContent>
//         </Card>
//       </TabsContent>

//       {/* ==================================================================== */}
//       {/* SECTION 5: Cleaned Resume                                           */}
//       {/* ==================================================================== */}
//       <TabsContent value="cleaned">
//         <Card>
//           <CardHeader>
//             <CardTitle>🧹 Cleaned & Parsed Resume</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <pre className="w-full p-4 bg-gray-50 rounded-lg border text-sm whitespace-pre-wrap font-sans">
//               {cleanedText}
//             </pre>
//           </CardContent>
//         </Card>
//       </TabsContent>
//     </Tabs>
//   );
// }











'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertTriangle, Lightbulb, Download, Mail, Linkedin, Github, TrendingUp, Phone, MapPin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import ReactDiffViewer from 'react-diff-viewer-continued';

// ====================================================================
// SECTION 1: STYLED RESUME COMPONENT (FOR OPTIMIZED TAB - UNCHANGED)
// ====================================================================
const StyledResume = ({ text }: { text: string }) => {
  if (!text) return null;
  const lines = text.split('\n').filter(line => line.trim() !== '');

  return (
    <div className="w-full max-w-4xl p-10 bg-white rounded-lg shadow-lg border font-sans text-gray-800">
      <div className="space-y-5">
        {lines.map((line, index) => {
          const trimmed = line.trim();

          if (index === 0) {
            return (
              <h1 key={index} className="text-4xl font-bold text-center text-gray-900 tracking-tight pb-2">
                {trimmed}
              </h1>
            );
          }

          if (trimmed.includes('@') || trimmed.toLowerCase().includes('linkedin')) {
            const contactParts = trimmed.split('|').map(p => p.trim());
            return (
              <div
                key={index}
                className="flex justify-center items-center gap-x-5 gap-y-1 flex-wrap text-sm text-gray-600 font-medium pb-5 border-b border-gray-200"
              >
                {contactParts.map((part, partIndex) => {
                  let icon = null;
                  if (part.includes('@')) icon = <Mail size={14} />;
                  if (part.toLowerCase().includes('linkedin')) icon = <Linkedin size={14} />;
                  if (part.toLowerCase().includes('github')) icon = <Github size={14} />;
                  return (
                    <a href={part.startsWith('http') || part.includes('@') ? (part.includes('@') ? `mailto:${part}` : part) : '#'} target="_blank" rel="noopener noreferrer" key={partIndex} className="flex items-center gap-1.5 hover:text-blue-600">
                      {icon} {part}
                    </a>
                  );
                })}
              </div>
            );
          }

          if ((trimmed.startsWith('**') && trimmed.endsWith('**')) || (trimmed.match(/^[A-Z\s&]+$/) && trimmed.length > 3 && !trimmed.includes('|'))) {
            const cleanHeader = trimmed.replace(/\*\*/g, '');
            return (
              <h2 key={index} className="text-sm font-bold text-blue-700 tracking-wider uppercase border-b-2 border-gray-200 pt-4 pb-1.5">
                {cleanHeader}
              </h2>
            );
          }

          if (trimmed.includes('|')) {
            const parts = trimmed.split('|').map(p => p.trim());
            const [title, entity, date] = parts;
            return (
              <div key={index} className="mt-3">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                  <span className="text-sm font-medium text-gray-600">{date}</span>
                </div>
                <p className="text-md text-gray-700 italic">{entity}</p>
              </div>
            );
          }

          if (trimmed.startsWith('**') && trimmed.includes(':')) {
             const parts = trimmed.split(/:\s*/);
             const category = parts[0].replace(/\*\*/g, '').trim();
             const skills = parts.slice(1).join(':').trim();
             return(
                <div key={index} className="flex items-start text-sm mt-1.5">
                    <p className="w-40 font-semibold text-gray-700 shrink-0">{category}</p>
                    <p className="flex-1 text-gray-600 leading-relaxed">{skills}</p>
                </div>
             )
          }

          if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
            const bulletText = trimmed.replace(/^[-•]\s*/, '');
            return (
              <div key={index} className="flex items-start text-sm ml-4">
                <span className="mr-2.5 mt-1 text-gray-500 font-bold">•</span>
                <p className="flex-1 text-gray-700 leading-relaxed">
                  {bulletText}
                </p>
              </div>
            );
          }

          return (
            <p key={index} className="text-sm text-gray-700 leading-relaxed">
              {trimmed}
            </p>
          );
        })}
      </div>
    </div>
  );
};


// --- MODIFIED SECTION START ---
// ====================================================================
// SECTION 1.5: FIXED COMPONENT FOR CLEANED RESUME TAB
// ====================================================================
const CleanedResumeView = ({ text }: { text: string }) => {
    if (!text) return null;

    const lines = text.split('\n').filter(line => line.trim() !== '');
    const sections: { [key: string]: string[] } = {};
    let currentSection = 'HEADER';
    sections[currentSection] = [];

    // Treat 'OBJECTIVE' as part of the header, not a section title to switch on
    const sectionTitles = ['EXPERIENCE', 'PROJECTS', 'EDUCATION', 'SKILLS', 'LINKS'];

    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (sectionTitles.includes(trimmedLine)) {
            currentSection = trimmedLine;
            sections[currentSection] = [];
        } else {
            sections[currentSection].push(line);
        }
    });

    const renderSection = (title: string, content: string[]) => {
        if (!content || content.length === 0) return null;
        return (
            <div key={title} className="mb-6">
                <h2 className="text-lg font-semibold text-blue-800 uppercase tracking-wider border-b-2 border-gray-200 pb-1 mb-3">{title}</h2>
                <div className="space-y-3">
                    {content.map((line, index) => {
                         if (line.trim().startsWith('-')) {
                            return (
                                <div key={index} className="flex items-start text-sm ml-2">
                                    <span className="mr-2.5 mt-1 text-gray-500 font-bold">•</span>
                                    <p className="flex-1 text-gray-700 leading-relaxed">{line.substring(1).trim()}</p>
                                </div>
                            );
                        }
                        if (line.includes('|') && line.split('|').length > 1) {
                             const parts = line.split('|').map(p => p.trim());
                             return (
                                <div key={index} className="text-sm mt-2">
                                    <p className="font-semibold text-gray-800">{parts[0]}</p>
                                    <p className="text-gray-600">{parts[1]}</p>
                                </div>
                             )
                        }
                        return <p key={index} className="text-sm text-gray-700 leading-relaxed">{line}</p>;
                    })}
                </div>
            </div>
        );
    };

    const headerLines = sections['HEADER'] || [];
    // FIX: Correctly find name, contact, and objective from the header lines
    const name = headerLines.find(line => !sectionTitles.includes(line.trim()) && !line.includes('@') && line.trim().toUpperCase() !== 'OBJECTIVE') || 'Name Not Found';
    const contact = headerLines.find(line => line.includes('@')) || '';
    const objective = headerLines.filter(line => line.trim() !== name && line.trim() !== contact && line.trim().toUpperCase() !== 'OBJECTIVE');

    const mainSections = ['EXPERIENCE', 'PROJECTS'];
    const sidebarSections = ['EDUCATION', 'SKILLS', 'LINKS'];

    return (
        <div className="bg-white p-6 md:p-10 rounded-lg shadow-lg font-sans max-w-5xl mx-auto border text-gray-800">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900">{name}</h1>
                <div className="flex justify-center gap-x-6 gap-y-1 flex-wrap text-sm text-gray-600 mt-2">
                    {contact?.split('|').map((item, i) => (
                        <span key={i} className="flex items-center gap-1.5">
                            {item.includes('@') && <Mail size={14} />}
                            {item.toLowerCase().includes('noida') && <MapPin size={14} />}
                            {item.trim()}
                        </span>
                    ))}
                </div>
            </header>

            <div className="flex flex-col md:flex-row gap-x-10">
                <main className="w-full md:w-[65%]">
                    {renderSection('OBJECTIVE', objective)}
                    {mainSections.map(title => renderSection(title, sections[title]))}
                </main>
                <aside className="w-full md:w-[35%] mt-6 md:mt-0">
                    {sidebarSections.map(title => renderSection(title, sections[title]))}
                </aside>
            </div>
        </div>
    );
};
// --- MODIFIED SECTION END ---

interface EvaluationData {
  overall_score: number;
  breakdown: { [key: string]: number | string };
  missing_keywords: string[];
  quick_wins: string[];
}
interface ResultsTabsProps {
  results: {
    cleaned: any;
    rewritten: any;
    final_resume: any;
    evaluation: any;
  };
}

export default function ResultsTabs({ results }: ResultsTabsProps) {
  if (!results) return null;

  const getRenderableString = (data: any): string => {
    if (typeof data === 'string') return data;
    if (typeof data === 'object' && data !== null && 'raw_output' in data)
      return data.raw_output;
    return '';
  };

  let evaluationData: EvaluationData | null = null;
  const evaluationString = getRenderableString(results.evaluation);

  if (evaluationString) {
    try {
      evaluationData = JSON.parse(evaluationString);
    } catch {
      try {
        let fixed = evaluationString
          .replace(/'/g, '"')
          .replace(/:\s*(\d+\s*\/\s*\d+)/g, ': "$1"')
          .replace(/,\s*([}\]])/g, '$1');
          
        evaluationData = JSON.parse(fixed);
      } catch (err) {
        console.error("Failed to parse evaluation data even after fixes:", err);
      }
    }
  }

  const finalResumeText = getRenderableString(results.final_resume);
  const cleanedText = getRenderableString(results.cleaned);
  const rewrittenText = getRenderableString(results.rewritten);

  const handleDownloadDocx = () => {
    const lines = finalResumeText.split('\n');
    const docChildren: Paragraph[] = [];
    lines.forEach((line, index) => {
      if (
        line.trim().match(/^[A-Z\s&]+$/) &&
        line.trim().length > 5 &&
        !line.includes('|')
      ) {
        docChildren.push(
          new Paragraph({
            text: line,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
          })
        );
      } else if (index === 0) {
        docChildren.push(
          new Paragraph({ text: line, heading: HeadingLevel.HEADING_1, style: 'Title' })
        );
      } else if (line.trim().startsWith('-')) {
        docChildren.push(
          new Paragraph({ text: line.substring(1).trim(), bullet: { level: 0 } })
        );
      } else {
        docChildren.push(new Paragraph(line));
      }
    });
    const doc = new Document({ sections: [{ children: docChildren }] });
    Packer.toBlob(doc).then((blob) => saveAs(blob, 'Optimized_Resume.docx'));
  };

  return (
    <Tabs defaultValue="optimized" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="evaluation">ATS Evaluation</TabsTrigger>
        <TabsTrigger value="optimized">Optimized Resume</TabsTrigger>
        <TabsTrigger value="rewritten">Rewritten Sections</TabsTrigger>
        <TabsTrigger value="cleaned">Cleaned Resume</TabsTrigger>
      </TabsList>

      <TabsContent value="evaluation">
        <Card>
          <CardHeader>
            <CardTitle>📊 ATS Evaluation Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-10">
            {evaluationData ? (
              <>
                <div className="flex justify-center">
                  <div className="flex flex-col items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-md p-8 border border-blue-200">
                    <p className="text-sm font-semibold text-blue-700 tracking-wider uppercase">
                      Overall ATS Score
                    </p>
                    <div className="relative flex items-center justify-center mt-4">
                      <div className="w-32 h-32 rounded-full border-8 border-blue-200 flex items-center justify-center">
                        <span className="text-5xl font-bold text-blue-900">
                          {evaluationData.overall_score}
                        </span>
                      </div>
                      <span className="absolute bottom-3 text-gray-500 text-sm">/100</span>
                    </div>
                    <p className="mt-4 text-sm text-gray-600">
                      Higher scores increase chances of passing ATS filters.
                    </p>
                  </div>
                </div>

                {evaluationData.breakdown && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-indigo-500" /> Score Breakdown
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(evaluationData.breakdown).map(([key, value]) => (
                        <div
                          key={key}
                          className="bg-white shadow-sm border px-4 py-2 rounded-lg text-sm"
                        >
                          <span className="font-medium text-gray-700">
                            {key.charAt(0).toUpperCase() + key.slice(1)}:
                          </span>{' '}
                          <span className="font-bold text-indigo-600">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {evaluationData.missing_keywords && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" /> Missing Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {evaluationData.missing_keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full shadow-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {evaluationData.quick_wins && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-green-500" /> Actionable Recommendations
                    </h4>
                    <ul className="space-y-3 text-sm text-gray-700">
                      {evaluationData.quick_wins.map((win, index) => (
                        <li
                          key={index}
                          className="flex items-start bg-green-50 border border-green-200 p-3 rounded-lg shadow-sm"
                        >
                          <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                          <span>{win}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full p-4 bg-red-50 rounded-lg border border-red-200 text-sm text-red-800">
                <p className="font-semibold mb-2 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" /> Could not parse evaluation data.
                </p>
                <pre className="w-full p-4 bg-gray-50 text-gray-700 rounded-md border text-xs whitespace-pre-wrap font-sans">
                  {evaluationString || 'No evaluation data was received.'}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="optimized">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>📄 Optimized Resume</CardTitle>
            <Button onClick={handleDownloadDocx}>
              <Download className="mr-2 h-4 w-4" />
              Download as .docx
            </Button>
          </CardHeader>
          <CardContent className="bg-slate-100 p-8 flex justify-center">
            <StyledResume text={finalResumeText} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="rewritten">
        <Card>
          <CardHeader>
            <CardTitle>✍️ Rewritten Sections</CardTitle>
            <p className="text-sm text-gray-500 pt-1">
              Comparing the original text (left) with the rewritten version (right).
            </p>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <ReactDiffViewer
                oldValue={cleanedText}
                newValue={rewrittenText}
                splitView={true}
                showDiffOnly={false}
                leftTitle="Original Text"
                rightTitle="Rewritten Version"
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="cleaned">
        <Card>
          <CardHeader><CardTitle>🧹 Cleaned & Parsed Resume</CardTitle></CardHeader>
          <CardContent className="bg-slate-50 p-4 md:p-8 flex justify-center">
             <CleanedResumeView text={cleanedText} />
          </CardContent>
        </Card>
      </TabsContent>

    </Tabs>
  );
}