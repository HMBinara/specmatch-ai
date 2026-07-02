import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, Users, Cpu, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000';

export default function App() {
  // Tab State
  const [activeTab, setActiveTab] = useState('upload');

  // CV Upload States
  const [devName, setDevName] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  // RFP Analysis States
  const [rfpFile, setRfpFile] = useState(null);
  const [rfpData, setRfpData] = useState(null);
  const [loadingRfp, setLoadingRfp] = useState(false);

  // Matching States
  const [matchReport, setMatchReport] = useState(null);
  const [loadingMatch, setLoadingMatch] = useState(false);

  // Handle CV Upload
  const handleCvUpload = async (e) => {
    e.preventDefault();
    if (!devName || !cvFile) {
      setUploadStatus('Please provide both Developer Name and CV PDF.');
      return;
    }
    const formData = new FormData();
    formData.append('file', cvFile);

    try {
      setUploadStatus('Uploading and indexing CV...');
      const res = await axios.post(`${API_BASE_URL}/upload-cv/?developer_name=${encodeURIComponent(devName)}`, formData);
      setUploadStatus(`✅ ${res.data.message}`);
      setDevName('');
      setCvFile(null);
    } catch (err) {
      setUploadStatus(`❌ Error: ${err.response?.data?.detail || err.message}`);
    }
  };

  // Handle RFP Analysis
  const handleRfpAnalysis = async (e) => {
    e.preventDefault();
    if (!rfpFile) return;

    setLoadingRfp(true);
    setRfpData(null);
    const formData = new FormData();
    formData.append('file', rfpFile);

    try {
      const res = await axios.post(`${API_BASE_URL}/analyze-rfp/`, formData);
      setRfpData(res.data.data);
    } catch (err) {
      alert(`RFP Analysis Failed: ${err.message}`);
    } finally {
      setLoadingRfp(false);
    }
  };

  // Handle Resource Matching
  const triggerResourceMatching = async () => {
    if (!rfpData) return;
    setLoadingMatch(true);
    setMatchReport(null);

    try {
      const res = await axios.post(`${API_BASE_URL}/match-resources/`, rfpData);
      setMatchReport(res.data.report);
      setActiveTab('match'); // Automatically switch to match tab to show results
    } catch (err) {
      alert(`Matching Failed: ${err.message}`);
    } finally {
      setLoadingMatch(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/20">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              SpecMatch AI
            </h1>
            <p className="text-xs text-indigo-400 font-medium tracking-wider uppercase">RAG Resource Allocation</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'upload' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Upload className="w-4 h-4" /> Talent Ingestion
          </button>
          <button
            onClick={() => setActiveTab('rfp')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'rfp' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <FileText className="w-4 h-4" /> RFP Intelligence
          </button>
          <button
            onClick={() => setActiveTab('match')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'match' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Users className="w-4 h-4" /> Fitment Matrix
          </button>
        </nav>
      </header>

      {/* Main Dashboard Container */}
      <main className="max-w-7xl mx-auto p-6 md:p-8">

        {/* TAB 1: TALENT INGESTION (CV UPLOAD) */}
        {activeTab === 'upload' && (
          <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-1 bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold mb-2 text-white">Add Developer Profile</h2>
              <p className="text-slate-400 text-sm mb-6">Upload an internal engineer's CV to extract features and index into ChromaDB vector store.</p>

              <form onSubmit={handleCvUpload} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Developer Name</label>
                  <input
                    type="text"
                    value={devName}
                    onChange={(e) => setDevName(e.target.value)}
                    placeholder="e.g. Kasun Perera"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Upload CV (PDF)</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setCvFile(e.target.files[0])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 text-slate-400"
                  />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl py-3 text-sm font-semibold hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" /> Parse & Embed CV
                </button>
              </form>

              {uploadStatus && (
                <div className="mt-4 p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 font-medium">
                  {uploadStatus}
                </div>
              )}
            </div>

            <div className="md:col-span-2 bg-gradient-to-br from-indigo-950/20 to-purple-950/10 border border-indigo-900/30 rounded-2xl p-8 flex flex-col justify-between h-full min-h-[340px]">
              <div>
                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">Vector Store Ingestion</span>
                <h2 className="text-2xl font-bold mt-4 mb-3 text-white">Semantic Knowledge Base</h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                  By compiling unstructured PDF resumes into standard plain text, the system invokes Gemini Text Embeddings (<code className="text-indigo-300">text-embedding-004</code>) to translate skills, domain familiarity, and structural experience into mathematical vector representations stored permanently inside ChromaDB.
                </p>
              </div>
              <div className="border-t border-slate-800/60 pt-6 flex items-center justify-between text-slate-400 text-xs">
                <span>Database Node Status: <span className="text-emerald-400 font-bold">● Active</span></span>
                <span>Storage Type: Persistent Vector Log</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RFP INTELLIGENCE */}
        {activeTab === 'rfp' && (
          <div className="space-y-8">
            <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl max-w-2xl">
              <h2 className="text-lg font-semibold mb-2 text-white">Analyze Client Requirements (RFP)</h2>
              <p className="text-slate-400 text-sm mb-6">Upload the incoming client's project document to extract features, architecture design requirements, and technical boundaries dynamically via LLMs.</p>

              <form onSubmit={handleRfpAnalysis} className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Select RFP Document (PDF)</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setRfpFile(e.target.files[0])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loadingRfp || !rfpFile}
                  className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {loadingRfp ? 'Processing...' : 'Analyze Architecture'}
                </button>
              </form>
            </div>

            {rfpData && (
              <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 shadow-2xl animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Structured Intelligence Output</span>
                    <h3 className="text-xl font-bold text-white mt-1">{rfpData.project_name}</h3>
                  </div>
                  <button
                    onClick={triggerResourceMatching}
                    disabled={loadingMatch}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-lg shadow-emerald-600/10 transition-all flex items-center gap-2"
                  >
                    {loadingMatch ? 'Querying Matrix...' : 'Run Optimal Allocation Match'}
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800/80">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-indigo-400" /> Target Technical Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {rfpData.technical_stack?.map((tech, idx) => (
                        <span key={idx} className="bg-slate-900 border border-slate-700/60 text-slate-200 text-xs px-2.5 py-1 rounded-md font-medium">{tech}</span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800/80 md:col-span-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-indigo-400" /> Core Functional Capabilities</h4>
                    <ul className="space-y-2 text-sm text-slate-300">
                      {rfpData.core_features?.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-indigo-500 font-bold mt-0.5">•</span> {feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FITMENT MATRIX & GAP ANALYSIS */}
        {activeTab === 'match' && (
          <div className="space-y-6">
            {!matchReport ? (
              <div className="text-center py-16 bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-base font-semibold text-slate-300 mb-1">No Fitment Report Generated</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">Please go to the RFP Intelligence tab, upload a document, and hit 'Run Optimal Allocation Match' to view vector matching context.</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                {/* Score & Meta */}
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Match Affinity</p>
                      <h3 className="text-3xl font-black text-white mt-1">{matchReport.overall_match_score}%</h3>
                    </div>
                    <div className="w-14 h-14 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 flex items-center justify-center font-bold text-sm text-indigo-400 shadow-inner">
                      RAG
                    </div>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl md:col-span-3 flex flex-col justify-center">
                    <p className="text-xs font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Critical Technical Gaps Identified
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {matchReport.critical_skills_gap?.length > 0 ? (
                        matchReport.critical_skills_gap.map((gap, idx) => (
                          <span key={idx} className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs px-2.5 py-1 rounded-md font-semibold">{gap}</span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Compliant. Zero capability gaps detected.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Team Allocation Grid */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-indigo-400" /> Proposed Resource Allocation Matrix</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-950/40">
                          <th className="p-4 rounded-tl-xl">Developer / Resource</th>
                          <th className="p-4">Suggested Project Role</th>
                          <th className="p-4 rounded-tr-xl">Overlapping Verified Skills</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {matchReport.allocated_team?.map((member, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/20 transition-colors">
                            <td className="p-4 font-semibold text-white">{member.name}</td>
                            <td className="p-4"><span className="bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-1 rounded-md font-medium border border-indigo-500/10">{member.role}</span></td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1.5">
                                {member.matched_skills?.map((skill, sIdx) => (
                                  <span key={sIdx} className="bg-slate-900 text-slate-300 text-xs px-2 py-0.5 rounded border border-slate-800">{skill}</span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950/20 border border-slate-800 p-6 rounded-2xl">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Strategic Hiring & Upskilling Advisory
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{matchReport.hiring_recommendation}</p>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}