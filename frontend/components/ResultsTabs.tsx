// 'use client';

// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// // --- CHANGE START: Added new icons for the enhanced resume view ---
// import { CheckCircle, AlertTriangle, Lightbulb, Download, Mail, Linkedin, Github } from 'lucide-react';
// // --- CHANGE END ---
// import { Button } from '@/components/ui/button';
// import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
// import { saveAs } from 'file-saver';
// import ReactDiffViewer from 'react-diff-viewer-continued';

// // ====================================================================
// // SECTION 1: STYLED RESUME COMPONENT (UPGRADED VISUALS)
// // ====================================================================
// const StyledResume = ({ text }: { text: string }) => {
//   if (!text) return null;
//   const lines = text.split('\n').filter(line => line.trim() !== '');

//   return (
//     <div className="w-full max-w-4xl p-8 md:p-12 bg-white rounded-lg font-serif text-slate-800 shadow-lg border">
//       <div className="space-y-6">
//         {lines.map((line, index) => {
//           // Name Header
//           if (index === 0) {
//             return <h1 key={index} className="text-5xl font-bold text-center text-slate-800 tracking-tight">{line}</h1>;
//           }
//           // Contact Info
//           if (line.includes('@') && line.includes('linkedin')) {
//             const contactParts = line.split('|').map(p => p.trim());
//             return (
//               <div key={index} className="flex justify-center items-center gap-x-4 gap-y-1 flex-wrap text-sm text-slate-500 font-sans pb-6 border-b border-slate-200">
//                 {contactParts.map((part, partIndex) => {
//                   let icon = null;
//                   if (part.includes('@')) icon = <Mail size={14} />;
//                   if (part.toLowerCase().includes('linkedin')) icon = <Linkedin size={14} />;
//                   if (part.toLowerCase().includes('github')) icon = <Github size={14} />;
//                   return <a href={part.startsWith('http') || part.includes('@') ? (part.includes('@') ? `mailto:${part}`: part) : '#'} target="_blank" rel="noopener noreferrer" key={partIndex} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">{icon}{part}</a>;
//                 })}
//               </div>
//             );
//           }
//           // Section Headers
//           if (line.trim().match(/^[A-Z\s&]+$/) && line.trim().length > 5 && !line.includes('|')) {
//             return <h2 key={index} className="text-lg font-bold text-blue-700 tracking-wide uppercase border-b-2 border-slate-200 pb-2 mt-4 font-sans">{line}</h2>;
//           }
//           // Job/Project Titles
//           if (line.includes('|')) {
//             const parts = line.split('|').map(p => p.trim());
//             return (
//               <div key={index} className="mt-3">
//                 <p className="text-xl font-semibold text-slate-900">{parts[0]}</p>
//                 <div className="flex justify-between text-md text-slate-600 font-medium font-sans">
//                   <span>{parts[1]}</span>
//                   <span className="font-semibold text-slate-700">{parts[2]}</span>
//                 </div>
//               </div>
//             );
//           }
//           // Bullet Points
//           if (line.trim().startsWith('-')) {
//             return (
//               <div key={index} className="flex items-start text-base ml-4">
//                 <span className="mr-3 mt-1 text-blue-600 font-bold">•</span>
//                 <p className="flex-1 font-sans text-slate-700">{line.substring(1).trim()}</p>
//               </div>
//             );
//           }
//           // Default text (like summary)
//           return <p key={index} className="text-base font-sans text-slate-700 leading-relaxed">{line}</p>;
//         })}
//       </div>
//     </div>
//   );
// };

// // --- MAIN COMPONENT INTERFACES (UNCHANGED) ---
// interface EvaluationData {
//   overall_score: number;
//   breakdown: { [key: string]: string };
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
//     if (typeof data === 'object' && data !== null && 'raw_output' in data) return data.raw_output;
//     return '';
//   };

//   let evaluationData: EvaluationData | null = null;
//   const evaluationString = getRenderableString(results.evaluation);
  
//   try {
//     if (evaluationString) {
//       evaluationData = JSON.parse(evaluationString);
//     }
//   } catch (error)
//   {
//     console.error("Failed to parse evaluation JSON:", error);
//   }

//   const finalResumeText = getRenderableString(results.final_resume);
//   const cleanedText = getRenderableString(results.cleaned);
//   const rewrittenText = getRenderableString(results.rewritten);

//   // --- DOCX DOWNLOAD HANDLER (UNCHANGED) ---
//   const handleDownloadDocx = () => {
//     const lines = finalResumeText.split('\n');
//     const docChildren: Paragraph[] = [];
//     lines.forEach((line, index) => {
//       if (line.trim().match(/^[A-Z\s&]+$/) && line.trim().length > 5 && !line.includes('|')) {
//         docChildren.push(new Paragraph({ text: line, heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 } }));
//       } else if (index === 0) {
//         docChildren.push(new Paragraph({ text: line, heading: HeadingLevel.HEADING_1, style: 'Title' }));
//       } else if (line.trim().startsWith('-')) {
//         docChildren.push(new Paragraph({ text: line.substring(1).trim(), bullet: { level: 0 } }));
//       } else {
//         docChildren.push(new Paragraph(line));
//       }
//     });
//     const doc = new Document({ sections: [{ children: docChildren }] });
//     Packer.toBlob(doc).then(blob => saveAs(blob, "Optimized_Resume.docx"));
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
//       {/* SECTION 2: ATS Evaluation (UNTOUCHED)                              */}
//       {/* ==================================================================== */}
//       <TabsContent value="evaluation">
//         <Card>
//           <CardHeader>
//             <CardTitle>ATS Evaluation & Score 📊</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-8">
//             {evaluationData ? (
//               <>
//                 <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"><p className="text-sm font-semibold text-blue-700 tracking-wider uppercase">Overall ATS Score</p><p className="text-7xl font-bold text-blue-900 mt-2">{evaluationData.overall_score}<span className="text-3xl text-gray-400">/100</span></p></div>
//                 <div><h4 className="font-semibold text-gray-800 mb-3">Score Breakdown</h4><div className="flex flex-wrap gap-3">{Object.entries(evaluationData.breakdown).map(([key, value]) => (<div key={key} className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1.5 rounded-lg">{key.charAt(0).toUpperCase() + key.slice(1)}: <strong>{value}</strong></div>))}</div></div>
//                 <div><h4 className="font-semibold text-gray-800 mb-3 flex items-center"><AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />Missing Keywords to Include</h4><div className="flex flex-wrap gap-2">{evaluationData.missing_keywords.map((keyword, index) => (<span key={index} className="bg-orange-100 text-orange-800 text-xs font-semibold me-2 px-2.5 py-1 rounded-full">{keyword}</span>))}</div></div>
//                 <div><h4 className="font-semibold text-gray-800 mb-3 flex items-center"><Lightbulb className="h-5 w-5 mr-2 text-green-500" />Actionable Recommendations</h4><ul className="space-y-3 text-sm text-gray-700">{evaluationData.quick_wins.map((win, index) => (<li key={index} className="flex items-start"><CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" /><span>{win}</span></li>))}</ul></div>
//               </>
//             ) : (
//               <div className="w-full p-4 bg-red-50 rounded-lg border border-red-200 text-sm text-red-800"><p className="font-semibold mb-2 flex items-center"><AlertTriangle className="h-5 w-5 mr-2" />Could not parse evaluation data.</p><pre className="w-full p-4 bg-gray-50 text-gray-700 rounded-md border text-xs whitespace-pre-wrap font-sans">{evaluationString || "No evaluation data was received."}</pre></div>
//             )}
//           </CardContent>
//         </Card>
//       </TabsContent>

//       {/* ==================================================================== */}
//       {/* SECTION 3: Optimized Resume (FIXED AND UNTOUCHED)                  */}
//       {/* ==================================================================== */}
//       <TabsContent value="optimized">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between">
//             <CardTitle>📄 Optimized Resume</CardTitle>
//             <Button onClick={handleDownloadDocx}><Download className="mr-2 h-4 w-4" />Download as .docx</Button>
//           </CardHeader>
//           <CardContent className="bg-slate-100 p-8 flex justify-center">
//             <StyledResume text={finalResumeText} />
//           </CardContent>
//         </Card>
//       </TabsContent>

//       {/* ==================================================================== */}
//       {/* SECTION 4: Rewritten Sections (UNTOUCHED)                          */}
//       {/* ==================================================================== */}
//       <TabsContent value="rewritten">
//         <Card>
//           <CardHeader>
//             <CardTitle>✍️ Rewritten Sections</CardTitle>
//              <p className="text-sm text-gray-500 pt-1">Comparing the original text (left) with the rewritten version (right).</p>
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
//       {/* SECTION 5: Cleaned Resume (UNTOUCHED)                              */}
//       {/* ==================================================================== */}
//       <TabsContent value="cleaned">
//         <Card>
//           <CardHeader><CardTitle>🧹 Cleaned & Parsed Resume</CardTitle></CardHeader>
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
import { CheckCircle, AlertTriangle, Lightbulb, Download, Mail, Linkedin, Github, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import ReactDiffViewer from 'react-diff-viewer-continued';

// ====================================================================
// SECTION 1: STYLED RESUME COMPONENT (UPGRADED VISUALS)
// ====================================================================
const StyledResume = ({ text }: { text: string }) => {
  if (!text) return null;
  const lines = text.split('\n').filter(line => line.trim() !== '');

  return (
    <div className="w-full max-w-4xl p-8 md:p-12 bg-white rounded-lg font-serif text-slate-800 shadow-lg border">
      <div className="space-y-6">
        {lines.map((line, index) => {
          if (index === 0) {
            return <h1 key={index} className="text-5xl font-bold text-center text-slate-800 tracking-tight">{line}</h1>;
          }
          if (line.includes('@') && line.includes('linkedin')) {
            const contactParts = line.split('|').map(p => p.trim());
            return (
              <div key={index} className="flex justify-center items-center gap-x-4 gap-y-1 flex-wrap text-sm text-slate-500 font-sans pb-6 border-b border-slate-200">
                {contactParts.map((part, partIndex) => {
                  let icon = null;
                  if (part.includes('@')) icon = <Mail size={14} />;
                  if (part.toLowerCase().includes('linkedin')) icon = <Linkedin size={14} />;
                  if (part.toLowerCase().includes('github')) icon = <Github size={14} />;
                  return <a href={part.startsWith('http') || part.includes('@') ? (part.includes('@') ? `mailto:${part}` : part) : '#'} target="_blank" rel="noopener noreferrer" key={partIndex} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">{icon}{part}</a>;
                })}
              </div>
            );
          }
          if (line.trim().match(/^[A-Z\s&]+$/) && line.trim().length > 5 && !line.includes('|')) {
            return <h2 key={index} className="text-lg font-bold text-blue-700 tracking-wide uppercase border-b-2 border-slate-200 pb-2 mt-4 font-sans">{line}</h2>;
          }
          if (line.includes('|')) {
            const parts = line.split('|').map(p => p.trim());
            return (
              <div key={index} className="mt-3">
                <p className="text-xl font-semibold text-slate-900">{parts[0]}</p>
                <div className="flex justify-between text-md text-slate-600 font-medium font-sans">
                  <span>{parts[1]}</span>
                  <span className="font-semibold text-slate-700">{parts[2]}</span>
                </div>
              </div>
            );
          }
          if (line.trim().startsWith('-')) {
            return (
              <div key={index} className="flex items-start text-base ml-4">
                <span className="mr-3 mt-1 text-blue-600 font-bold">•</span>
                <p className="flex-1 font-sans text-slate-700">{line.substring(1).trim()}</p>
              </div>
            );
          }
          return <p key={index} className="text-base font-sans text-slate-700 leading-relaxed">{line}</p>;
        })}
      </div>
    </div>
  );
};

interface EvaluationData {
  overall_score: number;
  breakdown: { [key: string]: string };
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
    if (typeof data === 'object' && data !== null && 'raw_output' in data) return data.raw_output;
    return '';
  };

  let evaluationData: EvaluationData | null = null;
  const evaluationString = getRenderableString(results.evaluation);

  // --- FIXED PARSER (inspired by Streamlit app) ---
  if (evaluationString) {
    try {
      evaluationData = JSON.parse(evaluationString);
    } catch {
      try {
        const fixed = evaluationString.replace(/'/g, '"');
        evaluationData = JSON.parse(fixed);
      } catch (err) {
        console.error("Failed to parse evaluation data:", err);
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
      if (line.trim().match(/^[A-Z\s&]+$/) && line.trim().length > 5 && !line.includes('|')) {
        docChildren.push(new Paragraph({ text: line, heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 } }));
      } else if (index === 0) {
        docChildren.push(new Paragraph({ text: line, heading: HeadingLevel.HEADING_1, style: 'Title' }));
      } else if (line.trim().startsWith('-')) {
        docChildren.push(new Paragraph({ text: line.substring(1).trim(), bullet: { level: 0 } }));
      } else {
        docChildren.push(new Paragraph(line));
      }
    });
    const doc = new Document({ sections: [{ children: docChildren }] });
    Packer.toBlob(doc).then(blob => saveAs(blob, "Optimized_Resume.docx"));
  };

  return (
    <Tabs defaultValue="optimized" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="evaluation">ATS Evaluation</TabsTrigger>
        <TabsTrigger value="optimized">Optimized Resume</TabsTrigger>
        <TabsTrigger value="rewritten">Rewritten Sections</TabsTrigger>
        <TabsTrigger value="cleaned">Cleaned Resume</TabsTrigger>
      </TabsList>

      {/* ==================================================================== */}
      {/* SECTION 2: ATS Evaluation (FIXED + BEAUTIFUL)                        */}
      {/* ==================================================================== */}
      <TabsContent value="evaluation">
        <Card>
          <CardHeader>
            <CardTitle>📊 ATS Evaluation Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-10">
            {evaluationData ? (
              <>
                {/* Overall Score */}
                <div className="flex justify-center">
                  <div className="flex flex-col items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-md p-8 border border-blue-200">
                    <p className="text-sm font-semibold text-blue-700 tracking-wider uppercase">Overall ATS Score</p>
                    <div className="relative flex items-center justify-center mt-4">
                      <div className="w-32 h-32 rounded-full border-8 border-blue-200 flex items-center justify-center">
                        <span className="text-5xl font-bold text-blue-900">{evaluationData.overall_score}</span>
                      </div>
                      <span className="absolute bottom-3 text-gray-500 text-sm">/100</span>
                    </div>
                    <p className="mt-4 text-sm text-gray-600">Higher scores increase chances of passing ATS filters.</p>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-indigo-500" /> Score Breakdown
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(evaluationData.breakdown).map(([key, value]) => (
                      <div key={key} className="bg-white shadow-sm border px-4 py-2 rounded-lg text-sm">
                        <span className="font-medium text-gray-700">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>{' '}
                        <span className="font-bold text-indigo-600">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing Keywords */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" /> Missing Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {evaluationData.missing_keywords.map((keyword, index) => (
                      <span key={index} className="bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actionable Recommendations */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-green-500" /> Actionable Recommendations
                  </h4>
                  <ul className="space-y-3 text-sm text-gray-700">
                    {evaluationData.quick_wins.map((win, index) => (
                      <li key={index} className="flex items-start bg-green-50 border border-green-200 p-3 rounded-lg shadow-sm">
                        <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                        <span>{win}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="w-full p-4 bg-red-50 rounded-lg border border-red-200 text-sm text-red-800">
                <p className="font-semibold mb-2 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" /> Could not parse evaluation data.
                </p>
                <pre className="w-full p-4 bg-gray-50 text-gray-700 rounded-md border text-xs whitespace-pre-wrap font-sans">
                  {evaluationString || "No evaluation data was received."}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ==================================================================== */}
      {/* SECTION 3: Optimized Resume (UNCHANGED)                             */}
      {/* ==================================================================== */}
      <TabsContent value="optimized">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>📄 Optimized Resume</CardTitle>
            <Button onClick={handleDownloadDocx}><Download className="mr-2 h-4 w-4" />Download as .docx</Button>
          </CardHeader>
          <CardContent className="bg-slate-100 p-8 flex justify-center">
            <StyledResume text={finalResumeText} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* ==================================================================== */}
      {/* SECTION 4: Rewritten Sections (UNCHANGED)                           */}
      {/* ==================================================================== */}
      <TabsContent value="rewritten">
        <Card>
          <CardHeader>
            <CardTitle>✍️ Rewritten Sections</CardTitle>
             <p className="text-sm text-gray-500 pt-1">Comparing the original text (left) with the rewritten version (right).</p>
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
      
      {/* ==================================================================== */}
      {/* SECTION 5: Cleaned Resume (UNCHANGED)                               */}
      {/* ==================================================================== */}
      <TabsContent value="cleaned">
        <Card>
          <CardHeader><CardTitle>🧹 Cleaned & Parsed Resume</CardTitle></CardHeader>
          <CardContent>
            <pre className="w-full p-4 bg-gray-50 rounded-lg border text-sm whitespace-pre-wrap font-sans">
              {cleanedText}
            </pre>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
