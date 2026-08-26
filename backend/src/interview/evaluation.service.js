import { GoogleGenAI } from '@google/genai';
import Interview from './interview.model.js';
import InterviewQuestion from './interviewQuestion.model.js';
import InterviewResult from './interviewResult.model.js';
import { buildAnswerEvaluationPrompt } from './answerEvaluation.prompt.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Isolated AI Evaluation Service
 * Evaluates candidate responses per question using Gemini AI, updates question records,
 * tracks completion progress, and generates composite performance summaries upon interview completion.
 */
class EvaluationService {
  constructor() {
    this.defaultModel = 'gemini-2.5-flash';
    this.maxRetries = 3;
  }

  /**
   * Helper utility for asynchronous sleep delay used during exponential backoff retries
   * @param {number} ms - Delay in milliseconds
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Initialize and return GoogleGenAI SDK client instance using environment variable keys.
   * @returns {GoogleGenAI|null} Configured SDK client instance or null if unconfigured
   */
  getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key' || apiKey === 'demo_api_key') {
      logger.warn(
        'Gemini API key missing or unconfigured. Answer evaluation will use fallback simulated analysis.'
      );
      return null;
    }
    return new GoogleGenAI({ apiKey });
  }

  /**
   * Safely parse raw AI output into valid JSON, stripping code block wrappers (```json ... ```).
   *
   * @param {string} rawText - Raw text output from Gemini
   * @returns {object} Parsed JSON evaluation object
   */
  parseAndCleanJsonResponse(rawText) {
    if (!rawText || typeof rawText !== 'string') {
      throw new Error('Empty raw text response received from AI service.');
    }

    let cleaned = rawText.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
    }

    try {
      return JSON.parse(cleaned);
    } catch (parseErr) {
      logger.error(`JSON Parse Error on raw evaluation response: ${parseErr.message}`);
      throw new Error(`Failed to parse structured JSON from evaluation output: ${parseErr.message}`);
    }
  }

  /**
   * Execute prompt request against Gemini API with Exponential Backoff Retry Strategy.
   *
   * @param {string} prompt - Engineered evaluation prompt
   * @param {string} modelName - Target model name
   * @param {number} [maxRetries=3] - Maximum retry attempts
   * @returns {Promise<string|null>} Raw text output from Gemini or null
   */
  async generateWithRetry(prompt, modelName = this.defaultModel, maxRetries = this.maxRetries) {
    const ai = this.getGeminiClient();
    if (!ai) return null;

    let attempt = 0;
    let lastError = null;

    while (attempt < maxRetries) {
      try {
        attempt++;
        logger.info(`Sending Answer Evaluation prompt to Gemini (${modelName}), Attempt ${attempt}/${maxRetries}...`);

        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2, // Low temperature for analytical consistency
          },
        });

        if (!response || !response.text) {
          throw new Error('Gemini API returned an empty text response.');
        }

        return response.text;
      } catch (error) {
        lastError = error;
        const errorMessage = error.message || '';
        const isRateLimit =
          errorMessage.includes('429') ||
          errorMessage.toLowerCase().includes('quota') ||
          errorMessage.toLowerCase().includes('rate');
        const isTransientServerErr =
          errorMessage.includes('503') ||
          errorMessage.includes('500') ||
          errorMessage.toLowerCase().includes('overloaded');

        if ((isRateLimit || isTransientServerErr) && attempt < maxRetries) {
          const backoffDelay = Math.pow(2, attempt) * 1000;
          logger.warn(
            `Gemini API transient failure (${error.message}). Retrying in ${backoffDelay / 1000}s (Attempt ${attempt}/${maxRetries})...`
          );
          await this.sleep(backoffDelay);
        } else {
          logger.error(`Gemini API non-retryable failure on attempt ${attempt}: ${error.message}`);
          break;
        }
      }
    }

    logger.error(`Gemini API exhausted ${attempt} attempts: ${lastError?.message}`);
    return null;
  }

  /**
   * Direct AI evaluation engine: Calls Gemini to grade a candidate answer.
   *
   * @param {object} params
   * @param {string} params.question - Question text
   * @param {string} params.userAnswer - Candidate answer
   * @param {string} [params.expectedAnswer] - Benchmark reference answer
   * @param {string} [params.role] - Target role
   * @param {string} [params.interviewType] - Technical / HR / Behavioral / Mixed
   * @param {string} [params.difficulty] - Beginner / Intermediate / Advanced
   * @returns {Promise<object>} Evaluation metrics (Technical, Communication, Confidence, Completeness scores, Strengths, Weaknesses, Suggestions, Feedback)
   */
  async evaluateAnswerWithGemini({
    question,
    userAnswer,
    expectedAnswer = '',
    role = 'Software Engineer',
    interviewType = 'Technical',
    difficulty = 'Intermediate',
  }) {
    const prompt = buildAnswerEvaluationPrompt({
      question,
      userAnswer,
      expectedAnswer,
      selectedRole: role,
      interviewType,
      difficulty,
    });

    let rawOutput = await this.generateWithRetry(prompt);
    let parsed = null;

    if (rawOutput) {
      try {
        parsed = this.parseAndCleanJsonResponse(rawOutput);
      } catch (parseErr) {
        logger.warn('Initial evaluation JSON parsing failed. Retrying once...');
        rawOutput = await this.generateWithRetry(prompt, this.defaultModel, 1);
        if (rawOutput) {
          try {
            parsed = this.parseAndCleanJsonResponse(rawOutput);
          } catch (retryErr) {
            logger.error(`Retry evaluation JSON parsing failed: ${retryErr.message}`);
          }
        }
      }
    }

    if (parsed && typeof parsed.score === 'number') {
      const dim = parsed.dimensionScores || {};
      return {
        score: Math.max(0, Math.min(100, Math.round(parsed.score))),
        technicalScore: Math.round(dim.technicalAccuracy?.score || parsed.score),
        communicationScore: Math.round(dim.communication?.score || parsed.score),
        confidenceScore: Math.round(dim.confidence?.score || parsed.score),
        completenessScore: Math.round(dim.completeness?.score || parsed.score),
        problemSolvingScore: Math.round(dim.problemSolving?.score || parsed.score),
        practicalKnowledgeScore: Math.round(dim.practicalKnowledge?.score || parsed.score),
        aiFeedback: {
          comments: parsed.aiFeedback?.comments || 'Answer evaluated successfully.',
          keyPointsCovered: Array.isArray(parsed.aiFeedback?.keyPointsCovered) ? parsed.aiFeedback.keyPointsCovered : [],
          keyPointsMissed: Array.isArray(parsed.aiFeedback?.keyPointsMissed) ? parsed.aiFeedback.keyPointsMissed : [],
          clarityScore: Math.round(parsed.aiFeedback?.clarityScore || 80),
          relevanceScore: Math.round(parsed.aiFeedback?.relevanceScore || 80),
        },
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
        suggestions: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        overallFeedback: parsed.aiFeedback?.comments || 'Solid overall effort.',
        sampleImprovedAnswer: parsed.sampleImprovedAnswer || '',
      };
    }

    // Fallback simulated evaluation when API is offline or unconfigured
    logger.info('Using simulated mock evaluation fallback.');
    return this.generateMockEvaluationFallback({ question, userAnswer, expectedAnswer });
  }

  /**
   * Evaluates candidate answer for a specific question ID and persists evaluation to MongoDB.
   *
   * @param {object} params
   * @param {string} params.interviewId - Parent Interview ID
   * @param {string} params.questionId - Target InterviewQuestion ID
   * @param {string} params.userAnswer - Candidate's written or transcribed answer
   * @returns {Promise<{ question: object, evaluation: object, isInterviewCompleted: boolean, result?: object }>} Updated question and result
   */
  async evaluateQuestionAnswer({ interviewId, questionId, userAnswer }) {
    if (!interviewId || !questionId) {
      throw ApiError.badRequest('Interview ID and Question ID are required for answer evaluation');
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      throw ApiError.notFound(`Interview session with ID ${interviewId} not found`);
    }

    const questionDoc = await InterviewQuestion.findOne({ _id: questionId, interview: interviewId });
    if (!questionDoc) {
      throw ApiError.notFound(`Question ID ${questionId} not found for this interview session`);
    }

    // Update interview status to In Progress if currently Pending
    if (interview.status === 'Pending') {
      interview.status = 'In Progress';
      interview.startedAt = interview.startedAt || new Date();
      await interview.save();
    }

    // Evaluate answer with Gemini AI
    const evalResult = await this.evaluateAnswerWithGemini({
      question: questionDoc.question,
      userAnswer: userAnswer || '',
      expectedAnswer: questionDoc.expectedAnswer,
      role: interview.role,
      interviewType: interview.interviewType,
      difficulty: interview.difficulty,
    });

    // Store evaluation on InterviewQuestion document
    questionDoc.answer = userAnswer || '';
    questionDoc.score = evalResult.score;
    questionDoc.aiFeedback = {
      comments: evalResult.overallFeedback,
      keyPointsCovered: evalResult.aiFeedback.keyPointsCovered,
      keyPointsMissed: evalResult.aiFeedback.keyPointsMissed,
      clarityScore: evalResult.aiFeedback.clarityScore,
      relevanceScore: evalResult.aiFeedback.relevanceScore,
    };
    await questionDoc.save();

    // Recalculate completed questions count
    const completedCount = await InterviewQuestion.countDocuments({
      interview: interviewId,
      answer: { $ne: '' },
    });

    interview.completedQuestions = completedCount;
    await interview.save();

    let isInterviewCompleted = false;
    let finalResult = null;

    // Trigger Final Interview Result generation when all questions answered
    if (completedCount >= interview.totalQuestions) {
      isInterviewCompleted = true;
      finalResult = await this.generateFinalInterviewResult(interviewId);
    }

    return {
      question: questionDoc,
      evaluation: evalResult,
      completedQuestions: interview.completedQuestions,
      totalQuestions: interview.totalQuestions,
      isInterviewCompleted,
      result: finalResult,
    };
  }

  /**
   * Aggregates all question evaluations in an interview session and stores final InterviewResult.
   *
   * @param {string} interviewId - Interview ID
   * @returns {Promise<object>} Final InterviewResult document
   */
  async generateFinalInterviewResult(interviewId) {
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      throw ApiError.notFound(`Interview session with ID ${interviewId} not found`);
    }

    const questions = await InterviewQuestion.find({ interview: interviewId }).sort({ sequenceNumber: 1 });
    if (!questions || questions.length === 0) {
      throw ApiError.badRequest('Cannot generate final result for an interview with no questions');
    }

    // Compute composite scores
    const totalScore = questions.reduce((sum, q) => sum + (q.score || 0), 0);
    const overallScore = Math.round(totalScore / questions.length);

    // Derive category scores based on question categories or overall score
    const techQuestions = questions.filter((q) => !q.category || q.category === 'Technical');
    const hrQuestions = questions.filter((q) => q.category === 'HR' || q.category === 'Behavioral');

    const technicalScore = techQuestions.length > 0
      ? Math.round(techQuestions.reduce((sum, q) => sum + (q.score || 0), 0) / techQuestions.length)
      : overallScore;

    const hrScore = hrQuestions.length > 0
      ? Math.round(hrQuestions.reduce((sum, q) => sum + (q.score || 0), 0) / hrQuestions.length)
      : overallScore;

    const communicationScore = Math.round(
      questions.reduce((sum, q) => sum + (q.aiFeedback?.clarityScore || 80), 0) / questions.length
    );

    // Aggregate strengths, weaknesses, recommendations
    const allStrengths = [];
    const allWeaknesses = [];
    const allRecommendations = [];

    questions.forEach((q) => {
      if (q.aiFeedback?.keyPointsCovered) allStrengths.push(...q.aiFeedback.keyPointsCovered);
      if (q.aiFeedback?.keyPointsMissed) allWeaknesses.push(...q.aiFeedback.keyPointsMissed);
    });

    const uniqueStrengths = [...new Set(allStrengths)].slice(0, 5);
    const uniqueWeaknesses = [...new Set(allWeaknesses)].slice(0, 5);

    if (overallScore >= 80) {
      allRecommendations.push('Excellent performance! Maintain clear articulation and explore senior-level system design topics.');
    } else if (overallScore >= 60) {
      allRecommendations.push('Solid foundation demonstrated. Focus on filling key concept gaps mentioned in question feedback.');
    } else {
      allRecommendations.push('Review foundational concepts and practice structured STAR responses before retrying.');
    }

    const summaryText = `Candidate completed a ${interview.difficulty} level ${interview.interviewType} interview for the ${interview.role} position with an overall score of ${overallScore}/100 across ${questions.length} questions.`;

    // Upsert InterviewResult record (1-to-1 relationship)
    const resultDoc = await InterviewResult.findOneAndUpdate(
      { interview: interviewId },
      {
        interview: interviewId,
        overallScore,
        technicalScore,
        communicationScore,
        hrScore,
        strengths: uniqueStrengths.length > 0 ? uniqueStrengths : ['Good basic comprehension of role topics'],
        weaknesses: uniqueWeaknesses.length > 0 ? uniqueWeaknesses : ['Could elaborate on implementation details'],
        recommendations: allRecommendations,
        summary: summaryText,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Update Interview session status to Completed
    interview.status = 'Completed';
    interview.completedAt = new Date();
    await interview.save();

    logger.info(`Generated and persisted final InterviewResult for interviewId ${interviewId} with overall score ${overallScore}/100.`);
    return resultDoc;
  }

  /**
   * Deterministic mock evaluation builder when AI API is offline or unconfigured.
   *
   * @param {object} params
   * @returns {object} Mock evaluation result metrics
   */
  generateMockEvaluationFallback({ question, userAnswer }) {
    const hasAnswer = userAnswer && userAnswer.trim().length > 10;
    const score = hasAnswer ? 82 : 20;

    return {
      score,
      technicalScore: hasAnswer ? 85 : 20,
      communicationScore: hasAnswer ? 80 : 30,
      confidenceScore: hasAnswer ? 84 : 20,
      completenessScore: hasAnswer ? 78 : 10,
      problemSolvingScore: hasAnswer ? 82 : 20,
      practicalKnowledgeScore: hasAnswer ? 80 : 20,
      aiFeedback: {
        comments: hasAnswer
          ? 'Candidate provided a structured and relevant answer demonstrating practical understanding.'
          : 'Answer was missing or too brief to demonstrate technical competency.',
        keyPointsCovered: hasAnswer ? ['Addressed primary question objective', 'Used relevant industry terminology'] : [],
        keyPointsMissed: hasAnswer ? ['Could mention edge case handling and optimization'] : ['Missing core concepts'],
        clarityScore: hasAnswer ? 85 : 30,
        relevanceScore: hasAnswer ? 88 : 20,
      },
      strengths: hasAnswer ? ['Clear conceptual explanation', 'Direct response to question prompt'] : [],
      weaknesses: hasAnswer ? ['Lacks concrete performance benchmark metrics'] : ['No substantive answer provided'],
      suggestions: hasAnswer
        ? ['Elaborate on production failure recovery and edge cases.']
        : ['Review foundational concepts and provide complete answers.'],
      overallFeedback: hasAnswer
        ? 'Well-structured response showing practical role knowledge.'
        : 'Incomplete response.',
      sampleImprovedAnswer: `A top-tier answer would clearly state core concepts, list production trade-offs, and outline best practices.`,
    };
  }
}

export default new EvaluationService();
export { EvaluationService };
