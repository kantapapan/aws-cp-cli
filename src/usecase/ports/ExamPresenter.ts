import { Question } from '../../domain/Question.js';
import { Score } from '../../domain/ExamSession.js';

/**
 * 問題表示のためのDTOクラス
 */
export interface QuestionDTO {
  questionNumber: number;
  totalQuestions: number;
  question: Question;
  remainingTime?: number; // 秒単位
}

/**
 * 試験結果表示のためのDTOクラス
 */
export interface ExamSummaryDTO {
  score: Score;
  duration: number; // 秒単位
  questions: Question[];
  userAnswers: Record<string, string>;
}

/**
 * 試験の表示を担当するプレゼンターインターフェース
 */
export interface ExamPresenter {
  /**
   * 問題を表示する
   * @param dto 表示する問題のDTO
   * @returns ユーザーが選択した回答
   */
  showQuestion(dto: QuestionDTO): Promise<string>;
  
  /**
   * 試験結果のサマリーを表示する
   * @param dto 表示する試験結果のDTO
   */
  showSummary(dto: ExamSummaryDTO): Promise<void>;
  
  /**
   * 進捗状況を表示する
   * @param current 現在の問題番号
   * @param total 全問題数
   * @param remainingTime 残り時間（秒）
   */
  showProgress(current: number, total: number, remainingTime?: number): Promise<void>;
  
  /**
   * エラーメッセージを表示する
   * @param error エラーメッセージまたはエラーオブジェクト
   */
  showError(error: string | Error): Promise<void>;

  /**
   * 問題の解答と解説を表示する
   * @param question 問題
   * @param userAnswer ユーザーの回答
   * @param isCorrect 正解かどうか
   */
  showAnswerExplanation(question: Question, userAnswer: string, isCorrect: boolean): Promise<void>;
} 