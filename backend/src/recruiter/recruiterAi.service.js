import jobRepository from '../job/job.repository.js';
import applicationRepository from '../application/application.repository.js';
import resumeRepository from '../resume/resume.repository.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Recruiter AI Service
 * Provides hiring assistance tools (candidate-job matching, ranking, skill extraction, recruiter question generation)
 * strictly for jobs owned by the recruiter.
 */
class RecruiterAiService {
  /**
   * Match candidates to a specific recruiter job and rank them.
   * @param {string} jobId
   * @param {object} recruiterUser
   * @returns {Promise<object>}
   */
  async matchCandidatesForJob(jobId, recruiterUser) {
    const job = await jobRepository.getJob(jobId, '');
    if (!job) {
      throw ApiError.notFound('Job posting not found');
    }

    const isJobOwner = job.createdBy.toString() === recruiterUser._id.toString();
    const isAdmin = recruiterUser.role === 'Admin';
    if (!isJobOwner && !isAdmin) {
      throw ApiError.forbidden('You are not authorized to run AI analysis for this job');
    }

    const applications = await applicationRepository.getApplications({ job: jobId }, { limit: 100 });

    const requiredSkills = (job.skills || []).map((s) => s.toLowerCase());

    const rankedCandidates = (applications.items || []).map((app) => {
      const candidateName = app.user ? `${app.user.firstName || ''} ${app.user.lastName || ''}`.trim() : 'Candidate';
      const resume = app.resume;

      let score = 60;
      let matchedSkills = [];
      let missingSkills = [];

      if (resume && Array.isArray(resume.skills)) {
        const candidateSkills = resume.skills.map((s) => String(s).toLowerCase());
        matchedSkills = requiredSkills.filter((sk) => candidateSkills.some((cs) => cs.includes(sk)));
        missingSkills = requiredSkills.filter((sk) => !matchedSkills.includes(sk));

        if (requiredSkills.length > 0) {
          const matchRatio = matchedSkills.length / requiredSkills.length;
          score = Math.round(50 + matchRatio * 50);
        }
      }

      return {
        applicationId: app._id,
        candidateId: app.user?._id,
        candidateName,
        email: app.user?.email,
        jobTitle: job.title,
        matchScore: Math.min(99, Math.max(40, score)),
        matchedSkills,
        missingSkills,
        status: app.status,
        appliedAt: app.createdAt,
        recommendation: score >= 80 ? 'Strong Match' : score >= 65 ? 'Potential Match' : 'Review Required',
      };
    });

    rankedCandidates.sort((a, b) => b.matchScore - a.matchScore);

    return {
      jobId: job._id,
      jobTitle: job.title,
      totalApplicants: rankedCandidates.length,
      topMatches: rankedCandidates.slice(0, 10),
      rankedCandidates,
    };
  }

  /**
   * Generate interview questions for a recruiter's job position.
   * @param {string} jobId
   * @param {object} recruiterUser
   * @returns {Promise<object>}
   */
  async generateInterviewQuestions(jobId, recruiterUser) {
    const job = await jobRepository.getJob(jobId, '');
    if (!job) {
      throw ApiError.notFound('Job posting not found');
    }

    const isJobOwner = job.createdBy.toString() === recruiterUser._id.toString();
    const isAdmin = recruiterUser.role === 'Admin';
    if (!isJobOwner && !isAdmin) {
      throw ApiError.forbidden('You are not authorized to generate questions for this job');
    }

    const skills = job.skills || ['General Software Development'];

    return {
      jobId: job._id,
      jobTitle: job.title,
      experienceLevel: job.experienceLevel || 'Mid-Level',
      questions: [
        {
          id: 1,
          category: 'Technical Competency',
          question: `Can you walk us through a recent project where you utilized ${skills[0] || 'core technologies'} in production?`,
          whatToLookFor: 'Demonstrates deep technical understanding, architecture choices, and real-world deployment experience.',
        },
        {
          id: 2,
          category: 'Problem Solving & System Design',
          question: `How would you approach scaling an application built with ${skills.slice(0, 2).join(', ')} to handle 10x traffic spikes?`,
          whatToLookFor: 'Evaluates system design awareness, performance optimization, caching strategies, and database indexing.',
        },
        {
          id: 3,
          category: 'Behavioral & Collaboration',
          question: 'Describe a situation where you had a technical disagreement with a teammate. How did you resolve it?',
          whatToLookFor: 'Clear communication, empathy, constructive conflict resolution, and focus on project outcomes.',
        },
      ],
    };
  }
}

export default new RecruiterAiService();
