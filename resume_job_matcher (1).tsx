import React, { useState } from 'react';
import { Upload, FileText, Briefcase, TrendingUp, AlertCircle, CheckCircle, XCircle, Lightbulb } from 'lucide-react';

const ResumeJobMatcher = () => {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Indian-specific skill mappings and normalizations
  const skillMappings = {
    'javascript': ['js', 'javascript', 'ecmascript', 'es6', 'es2015'],
    'python': ['python', 'py', 'python3'],
    'react': ['react', 'reactjs', 'react.js', 'react native'],
    'node': ['node', 'nodejs', 'node.js', 'express'],
    'java': ['java', 'core java', 'j2ee', 'spring', 'spring boot'],
    'aws': ['aws', 'amazon web services', 'ec2', 's3', 'lambda'],
    'docker': ['docker', 'containerization', 'containers'],
    'kubernetes': ['kubernetes', 'k8s', 'container orchestration'],
    'machine learning': ['ml', 'machine learning', 'ai/ml', 'artificial intelligence'],
    'sql': ['sql', 'mysql', 'postgresql', 'oracle', 'sql server'],
    'mongodb': ['mongodb', 'mongo', 'nosql'],
    'git': ['git', 'github', 'gitlab', 'version control'],
    'agile': ['agile', 'scrum', 'sprint', 'kanban'],
    'rest api': ['rest', 'rest api', 'restful', 'api'],
    'microservices': ['microservices', 'micro services', 'microservice architecture'],
    'devops': ['devops', 'ci/cd', 'jenkins', 'gitlab ci'],
    'angular': ['angular', 'angularjs', 'angular2+'],
    'vue': ['vue', 'vuejs', 'vue.js'],
    'django': ['django', 'django rest framework', 'drf'],
    'flask': ['flask', 'flask-restful'],
    'azure': ['azure', 'microsoft azure', 'azure devops'],
    'gcp': ['gcp', 'google cloud', 'google cloud platform'],
  };

  // Indian context patterns
  const indianPatterns = {
    ctc: /(?:CTC|Current CTC|Expected CTC)[:\s]*(?:INR\s*)?(\d+(?:\.\d+)?)\s*(?:LPA|Lakhs?|L|per annum)/gi,
    experience: /(\d+(?:\.\d+)?)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience)?/gi,
    noticePeriod: /(?:Notice Period|NP)[:\s]*(\d+)\s*(?:days?|months?)/gi,
    fresher: /\b(?:fresher|recent graduate|0-1 years?|entry level)\b/gi,
    serviceBased: /\b(?:TCS|Infosys|Wipro|HCL|Tech Mahindra|Cognizant|Accenture|Capgemini)\b/gi,
  };

  // Extract skills from text
  const extractSkills = (text) => {
    const lowerText = text.toLowerCase();
    const foundSkills = new Set();

    Object.entries(skillMappings).forEach(([canonical, variations]) => {
      variations.forEach(variation => {
        const regex = new RegExp(`\\b${variation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        if (regex.test(lowerText)) {
          foundSkills.add(canonical);
        }
      });
    });

    return Array.from(foundSkills);
  };

  // Extract experience in years
  const extractExperience = (text) => {
    const matches = [...text.matchAll(indianPatterns.experience)];
    if (matches.length > 0) {
      const years = matches.map(m => parseFloat(m[1]));
      return Math.max(...years);
    }
    
    if (indianPatterns.fresher.test(text)) {
      return 0;
    }
    
    return null;
  };

  // Extract Indian-specific context
  const extractIndianContext = (text) => {
    const context = {
      isFresher: indianPatterns.fresher.test(text),
      hasServiceBasedExp: indianPatterns.serviceBased.test(text),
      ctcMentioned: indianPatterns.ctc.test(text),
      noticePeriodMentioned: indianPatterns.noticePeriod.test(text),
    };

    const ctcMatch = text.match(indianPatterns.ctc);
    if (ctcMatch) {
      context.ctc = parseFloat(ctcMatch[1]);
    }

    return context;
  };

  // Calculate keyword match score
  const calculateKeywordScore = (resumeSkills, jdSkills) => {
    if (jdSkills.length === 0) return 0;
    
    const matchedSkills = resumeSkills.filter(skill => jdSkills.includes(skill));
    return (matchedSkills.length / jdSkills.length) * 100;
  };

  // Calculate semantic similarity (simplified - using word overlap)
  const calculateSemanticScore = (resumeText, jdText) => {
    const resumeWords = new Set(resumeText.toLowerCase().match(/\b\w+\b/g) || []);
    const jdWords = new Set(jdText.toLowerCase().match(/\b\w+\b/g) || []);
    
    // Remove common stop words
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'as', 'by']);
    
    const meaningfulResumeWords = new Set([...resumeWords].filter(w => !stopWords.has(w) && w.length > 2));
    const meaningfulJdWords = new Set([...jdWords].filter(w => !stopWords.has(w) && w.length > 2));
    
    const intersection = new Set([...meaningfulResumeWords].filter(w => meaningfulJdWords.has(w)));
    const union = new Set([...meaningfulResumeWords, ...meaningfulJdWords]);
    
    return (intersection.size / union.size) * 100;
  };

  // Calculate rule-based score
  const calculateRuleScore = (resumeExp, jdExp, resumeContext, jdContext) => {
    let score = 100;
    
    // Experience matching
    if (resumeExp !== null && jdExp !== null) {
      const expDiff = Math.abs(resumeExp - jdExp);
      if (expDiff <= 1) {
        score -= 0;
      } else if (expDiff <= 2) {
        score -= 15;
      } else {
        score -= 30;
      }
    }
    
    // Fresher handling
    if (jdContext.isFresher && !resumeContext.isFresher && resumeExp > 2) {
      score -= 20;
    }
    
    // Service-based to product company transition (common in India)
    if (resumeContext.hasServiceBasedExp && !jdContext.hasServiceBasedExp) {
      score -= 5; // Minor penalty, but acceptable
    }
    
    return Math.max(0, score);
  };

  // Generate detailed explanation
  const generateExplanation = (resumeSkills, jdSkills, resumeExp, jdExp, resumeContext) => {
    const matchedSkills = resumeSkills.filter(skill => jdSkills.includes(skill));
    const missingSkills = jdSkills.filter(skill => !resumeSkills.includes(skill));
    const extraSkills = resumeSkills.filter(skill => !jdSkills.includes(skill));
    
    const strengths = [];
    const weaknesses = [];
    
    if (matchedSkills.length > 0) {
      strengths.push(`Strong match in ${matchedSkills.length} key skills: ${matchedSkills.slice(0, 5).join(', ')}`);
    }
    
    if (resumeExp !== null && jdExp !== null && Math.abs(resumeExp - jdExp) <= 1) {
      strengths.push(`Experience level matches requirement (${resumeExp} years vs ${jdExp} years required)`);
    }
    
    if (resumeContext.hasServiceBasedExp) {
      strengths.push('Experience in service-based companies shows client-facing project work');
    }
    
    if (missingSkills.length > 0) {
      weaknesses.push(`Missing ${missingSkills.length} required skills: ${missingSkills.slice(0, 5).join(', ')}`);
    }
    
    if (resumeExp !== null && jdExp !== null && resumeExp < jdExp - 1) {
      weaknesses.push(`Experience gap: Resume shows ${resumeExp} years, JD requires ${jdExp}+ years`);
    }
    
    return {
      matchedSkills,
      missingSkills,
      extraSkills: extraSkills.slice(0, 5),
      strengths,
      weaknesses,
    };
  };

  // Generate improvement suggestions
  const generateSuggestions = (explanation, resumeContext) => {
    const suggestions = [];
    
    if (explanation.missingSkills.length > 0) {
      explanation.missingSkills.slice(0, 3).forEach(skill => {
        suggestions.push({
          category: 'Skill Gap',
          recommendation: `Add ${skill} to your skillset. Consider free courses on Coursera, Udemy India, or YouTube.`,
          priority: 'High',
          impact: '+12-15 points',
        });
      });
    }
    
    if (!resumeContext.ctcMentioned) {
      suggestions.push({
        category: 'Resume Format',
        recommendation: 'Add Current/Expected CTC in LPA format (standard in Indian resumes)',
        priority: 'Medium',
        impact: '+5 points',
      });
    }
    
    if (explanation.matchedSkills.length > 0) {
      suggestions.push({
        category: 'Keyword Optimization',
        recommendation: `Emphasize matched skills (${explanation.matchedSkills.slice(0, 3).join(', ')}) in project descriptions`,
        priority: 'Medium',
        impact: '+8-10 points',
      });
    }
    
    if (resumeContext.hasServiceBasedExp) {
      suggestions.push({
        category: 'Experience Highlighting',
        recommendation: 'Highlight individual contributions and technical ownership in service-based projects',
        priority: 'Medium',
        impact: '+6-8 points',
      });
    }
    
    suggestions.push({
      category: 'ATS Optimization',
      recommendation: 'Use standard section headers: Summary, Skills, Experience, Education, Projects',
      priority: 'Low',
      impact: '+3-5 points',
    });
    
    return suggestions;
  };

  // Main matching function
  const performMatching = () => {
    setLoading(true);
    
    setTimeout(() => {
      // Extract features
      const resumeSkills = extractSkills(resume);
      const jdSkills = extractSkills(jobDescription);
      
      const resumeExp = extractExperience(resume);
      const jdExp = extractExperience(jobDescription);
      
      const resumeContext = extractIndianContext(resume);
      const jdContext = extractIndianContext(jobDescription);
      
      // Calculate scores
      const keywordScore = calculateKeywordScore(resumeSkills, jdSkills);
      const semanticScore = calculateSemanticScore(resume, jobDescription);
      const ruleScore = calculateRuleScore(resumeExp, jdExp, resumeContext, jdContext);
      
      // Weighted final score
      const finalScore = Math.round(
        0.30 * keywordScore +
        0.50 * semanticScore +
        0.20 * ruleScore
      );
      
      // Generate explanation and suggestions
      const explanation = generateExplanation(resumeSkills, jdSkills, resumeExp, jdExp, resumeContext);
      const suggestions = generateSuggestions(explanation, resumeContext);
      
      setResult({
        score: finalScore,
        breakdown: {
          keywordScore: Math.round(keywordScore),
          semanticScore: Math.round(semanticScore),
          ruleScore: Math.round(ruleScore),
        },
        explanation,
        suggestions,
        resumeExp,
        jdExp,
      });
      
      setLoading(false);
    }, 1500);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent Match';
    if (score >= 70) return 'Good Match';
    if (score >= 50) return 'Moderate Match';
    return 'Poor Match';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">AI Resume-Job Matcher</h1>
          </div>
          <p className="text-gray-600 mb-2">Tailored for the Indian Job Market</p>
          <p className="text-sm text-gray-500">Supports Indian-specific formats: CTC (LPA), Notice Period, Fresher/Experienced, Service-based companies</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-800">Resume Text</h2>
            </div>
            <textarea
              className="w-full h-64 p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
              placeholder="Paste your resume here...&#10;&#10;Example:&#10;Software Engineer with 3 years experience&#10;Skills: Python, Django, React, PostgreSQL, AWS&#10;Current CTC: 8 LPA&#10;Notice Period: 30 days&#10;&#10;Experience:&#10;- TCS (2021-2023): Backend development&#10;- Startup XYZ (2023-Present): Full-stack developer"
              value={resume}
              onChange={(e) => setResume(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-800">Job Description</h2>
            </div>
            <textarea
              className="w-full h-64 p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
              placeholder="Paste job description here...&#10;&#10;Example:&#10;We are looking for a Senior Backend Engineer&#10;&#10;Requirements:&#10;- 4-6 years of experience&#10;- Strong in Python, Django, PostgreSQL&#10;- Experience with AWS, Docker, Kubernetes&#10;- REST API design&#10;- Microservices architecture"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <button
            onClick={performMatching}
            disabled={!resume || !jobDescription || loading}
            className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Analyzing...
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5" />
                Calculate Match Score
              </>
            )}
          </button>
        </div>

        {result && (
          <div className="space-y-6">
            {/* Score Display */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Match Score</h2>
                <div className={`text-7xl font-bold mb-2 ${getScoreColor(result.score)}`}>
                  {result.score}
                </div>
                <div className={`text-2xl font-semibold mb-6 ${getScoreColor(result.score)}`}>
                  {getScoreLabel(result.score)}
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Keyword Match</div>
                    <div className="text-2xl font-bold text-blue-600">{result.breakdown.keywordScore}%</div>
                    <div className="text-xs text-gray-500 mt-1">Weight: 30%</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Semantic Match</div>
                    <div className="text-2xl font-bold text-green-600">{result.breakdown.semanticScore}%</div>
                    <div className="text-xs text-gray-500 mt-1">Weight: 50%</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Rule-Based</div>
                    <div className="text-2xl font-bold text-purple-600">{result.breakdown.ruleScore}%</div>
                    <div className="text-xs text-gray-500 mt-1">Weight: 20%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-indigo-600" />
                Detailed Analysis
              </h3>

              {/* Matched Skills */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-700">Matched Skills ({result.explanation.matchedSkills.length})</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.explanation.matchedSkills.map((skill, idx) => (
                    <span key={idx} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              {result.explanation.missingSkills.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <h4 className="font-semibold text-red-700">Missing Skills ({result.explanation.missingSkills.length})</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.explanation.missingSkills.map((skill, idx) => (
                      <span key={idx} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths */}
              {result.explanation.strengths.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-green-700 mb-2">Strengths</h4>
                  <ul className="space-y-2">
                    {result.explanation.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {result.explanation.weaknesses.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-700 mb-2">Areas for Improvement</h4>
                  <ul className="space-y-2">
                    {result.explanation.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Suggestions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-yellow-600" />
                Improvement Suggestions
              </h3>
              <div className="space-y-4">
                {result.suggestions.map((suggestion, idx) => (
                  <div key={idx} className="border-l-4 border-indigo-500 bg-indigo-50 p-4 rounded-r-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-indigo-700">{suggestion.category}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          suggestion.priority === 'High' ? 'bg-red-100 text-red-700' :
                          suggestion.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {suggestion.priority} Priority
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-green-600">{suggestion.impact}</span>
                    </div>
                    <p className="text-gray-700">{suggestion.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-xl font-semibold mb-4">Next Steps</h3>
              <ul className="space-y-3">
                {result.score >= 70 ? (
                  <>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>Apply to this position - you're a strong candidate!</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>Tailor your resume using the suggestions above for an even better match</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>Prepare for interviews by focusing on your matched skills</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>Work on the missing skills through online courses (Coursera, Udemy India, YouTube)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>Update your resume with relevant projects showcasing required technologies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>Consider similar roles that better match your current skill level</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeJobMatcher;