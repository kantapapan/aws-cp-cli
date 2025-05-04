import 'reflect-metadata';
import { injectable, inject } from 'tsyringe';
import { Domain, Question } from '../domain/Question.js';
import { ExamMode, ExamSession } from '../domain/ExamSession.js';
import { InsufficientQuestionsError } from '../domain/DomainError.js';
import { QuestionRepository, ExamPresenter } from './ports/index.js';

/**
 * StartExamユースケースの入力パラメータ
 */
export interface StartExamInput {
  mode: ExamMode;
  domain?: Domain;
  count?: number;
  lang?: string;
}

/**
 * 試験を開始するユースケース
 */
@injectable()
export class StartExam {
  constructor(
    @inject('QuestionRepository') private questionRepo: QuestionRepository,
    @inject('ExamPresenter') private presenter: ExamPresenter
  ) {}

  /**
   * 試験を開始する
   * @param input 試験の設定
   * @returns 作成されたExamSessionオブジェクト
   */
  async execute(input: StartExamInput): Promise<ExamSession> {
    try {
      // モードに基づいて問題数を決定
      const count = this.determineQuestionCount(input);
      
      // 問題を取得
      const questions = await this.fetchQuestions(input.domain, count, input.lang);
      
      // 問題数が足りない場合はエラー
      if (questions.length < count) {
        throw new InsufficientQuestionsError(
          input.domain,
          count,
          questions.length
        );
      }
      
      // 試験セッションを作成
      const session = new ExamSession(
        questions,
        input.mode,
        input.mode === ExamMode.FULL_EXAM ? 90 : 30
      );
      
      return session;
    } catch (error) {
      await this.presenter.showError(error instanceof Error ? error : String(error));
      throw error;
    }
  }

  /**
   * 試験モードに基づいて問題数を決定する
   * @param input 試験設定
   * @returns 問題数
   */
  private determineQuestionCount(input: StartExamInput): number {
    if (input.count) {
      return input.count;
    }
    
    return input.mode === ExamMode.FULL_EXAM ? 65 : 10;
  }

  /**
   * 指定されたドメインから問題を取得する
   * @param domain 問題ドメイン（省略可）
   * @param count 問題数
   * @param lang 言語（省略可）
   * @returns 問題の配列
   */
  private async fetchQuestions(
    domain?: Domain,
    count: number = 65,
    lang?: string
  ): Promise<Question[]> {
    return this.questionRepo.findRandom({
      domain,
      count,
      lang
    });
  }
} 