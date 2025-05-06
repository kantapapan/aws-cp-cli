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
  /**
   * 重複排除を行うかどうか（デフォルト：true）
   */
  preventDuplication?: boolean;
  /**
   * 類似度の閾値（デフォルト：0.8）
   */
  similarityThreshold?: number;
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
      
      // 問題を取得（重複排除ありまたはなし）
      const questions = await this.fetchQuestions(input, count);
      
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
    
    // 一時的に本試験モードの問題数を20問に設定（本来は65問）
    // TODO: 十分な問題データが追加されたら65に戻す
    return input.mode === ExamMode.FULL_EXAM ? 20 : 10;
  }

  /**
   * 指定されたドメインから問題を取得する
   * @param input 試験設定
   * @param count 問題数
   * @returns 問題の配列
   */
  private async fetchQuestions(
    input: StartExamInput,
    count: number
  ): Promise<Question[]> {
    // デフォルトでは重複排除を有効にする
    const preventDuplication = input.preventDuplication ?? true;

    if (preventDuplication) {
      return this.questionRepo.findRandomWithoutDuplication({
        domain: input.domain,
        count,
        lang: input.lang,
        similarityThreshold: input.similarityThreshold
      });
    } else {
      return this.questionRepo.findRandom({
        domain: input.domain,
        count,
        lang: input.lang
      });
    }
  }
} 