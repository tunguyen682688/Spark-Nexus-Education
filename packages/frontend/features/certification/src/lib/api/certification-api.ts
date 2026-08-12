export { DashboardApi } from './dashboard-api';
export { CollectionApi } from './collection-api';
export { ExamApi } from './exam-api';
export { SessionApi } from './session-api';
export { UserDataApi } from './user-data-api';

import { DashboardApi } from './dashboard-api';
import { CollectionApi } from './collection-api';
import { ExamApi } from './exam-api';
import { SessionApi } from './session-api';
import { UserDataApi } from './user-data-api';

export class CertificationApi {
  // Dashboard
  static getDashboardStats = DashboardApi.getDashboardStats;
  static getCreatorDashboardData = DashboardApi.getCreatorDashboardData;
  static getStudyPlan = DashboardApi.getStudyPlan;
  static getTopContributors = DashboardApi.getTopContributors;

  // Collection
  static getFeaturedCollections = CollectionApi.getFeaturedCollections;
  static getTrendingCollections = CollectionApi.getTrendingCollections;
  static getOfficialCollections = CollectionApi.getOfficialCollections;
  static getCommunityCollections = CollectionApi.getCommunityCollections;
  static getCollection = CollectionApi.getCollection;
  static getCollectionItems = CollectionApi.getCollectionItems;
  static getCollectionReviews = CollectionApi.getCollectionReviews;
  static addCollectionReview = CollectionApi.addCollectionReview;
  static getCollectionDiscussions = CollectionApi.getCollectionDiscussions;
  static addCollectionDiscussion = CollectionApi.addCollectionDiscussion;
  static getCollectionActivities = CollectionApi.getCollectionActivities;
  static saveCollection = CollectionApi.saveCollection;
  static getSavedCollections = CollectionApi.getSavedCollections;
  static cloneCollection = CollectionApi.cloneCollection;
  static reportCollection = CollectionApi.reportCollection;
  static createCollection = CollectionApi.createCollection;
  static updateCollection = CollectionApi.updateCollection;
  static deleteCollection = CollectionApi.deleteCollection;
  static getCollectionEditorData = CollectionApi.getCollectionEditorData;
  static syncChapters = CollectionApi.syncChapters;

  // Exam
  static getExam = ExamApi.getExam;
  static getExamBuilderData = ExamApi.getExamBuilderData;
  static getSectionQuestions = ExamApi.getSectionQuestions;
  static getQuestionBuilderData = ExamApi.getQuestionBuilderData;
  static saveQuestion = ExamApi.saveQuestion;
  static deleteQuestion = ExamApi.deleteQuestion;
  static getQuestionHistory = ExamApi.getQuestionHistory;
  static createExam = ExamApi.createExam;
  static updateExam = ExamApi.updateExam;
  static deleteExam = ExamApi.deleteExam;
  static saveExamSections = ExamApi.saveExamSections;
  static linkQuestionToExam = ExamApi.linkQuestionToExam;
  static unlinkQuestionFromExam = ExamApi.unlinkQuestionFromExam;

  // Session
  static startExamSession = SessionApi.startExamSession;
  static getExamSession = SessionApi.getExamSession;
  static saveSessionAnswer = SessionApi.saveSessionAnswer;
  static recordSessionViolation = SessionApi.recordSessionViolation;
  static submitExamSession = SessionApi.submitExamSession;
  static getExamResult = SessionApi.getExamResult;
  static getInProgressSessions = SessionApi.getInProgressSessions;

  // User Data
  static getPracticeHistory = UserDataApi.getPracticeHistory;
  static getCompletedCollections = UserDataApi.getCompletedCollections;
  static getFavorites = UserDataApi.getFavorites;
  static addFavorite = UserDataApi.addFavorite;
  static removeFavorite = UserDataApi.removeFavorite;
  static getBookmarks = UserDataApi.getBookmarks;
  static addBookmark = UserDataApi.addBookmark;
  static removeBookmark = UserDataApi.removeBookmark;
  static getDownloads = UserDataApi.getDownloads;
  static deleteDownload = UserDataApi.deleteDownload;
  static clearDownloads = UserDataApi.clearDownloads;
  static getPurchasedCollections = UserDataApi.getPurchasedCollections;
  static getCertificates = UserDataApi.getCertificates;
  static downloadCertificate = UserDataApi.downloadCertificate;
  static getClonedCollections = UserDataApi.getClonedCollections;
}
