import { ChoiceLabel, Question } from './Question.js';

/**
 * 試験モード
 */
export enum ExamMode {
  FULL_EXAM = 'exam',   // 本番形式の試験 (65問)
  PRACTICE = 'practice' // 練習モード (ドメイン指定、任意の問題数)
}

/**
 * 試験の結果を表すクラス
 */
export class Score {
  /**
   * @param correct 正解数
   * @param total 全問題数
   * @param correctByDomain ドメイン別の正解数
   */
  constructor(
    public readonly correct: number,
    public readonly total: number,
    public readonly correctByDomain: Record<string, number> = {}
  ) {}

  /**
   * 正答率を計算して返す
   * @returns 正答率 (0-100)
   */
  percent(): number {
    if (this.total === 0) return 0;
    return Math.round((this.correct / this.total) * 100);
  }

  /**
   * 合格したかどうかを判定する
   * AWS CP試験の合格ラインは通常70%
   * @returns 合格ならtrue、不合格ならfalse
   */
  isPassed(): boolean {
    return this.percent() >= 70;
  }
}

/**
 * 試験セッションを表すエンティティクラス
 */
export class ExamSession {
  private responses: Map<string, ChoiceLabel> = new Map();
  private startTime: Date;
  private endTime: Date | null = null;
  private currentQuestionIndex: number = 0;

  /**
   * @param questions 試験問題の配列
   * @param mode 試験モード
   * @param timeLimit 制限時間（分）
   */
  constructor(
    public readonly questions: Question[],
    public readonly mode: ExamMode = ExamMode.FULL_EXAM,
    public readonly timeLimit: number = 90,
    public readonly examType: string = 'cp'
  ) {
    this.startTime = new Date();
  }

  /**
   * 現在の問題を返す
   * @returns 現在の問題、もしくはnull（全問終了時）
   */
  getCurrentQuestion(): Question | null {
    if (this.currentQuestionIndex >= this.questions.length) {
      return null;
    }
    return this.questions[this.currentQuestionIndex];
  }

  /**
   * 次の問題に進む
   * @returns 次の問題、もしくはnull（全問終了時）
   */
  nextQuestion(): Question | null {
    this.currentQuestionIndex++;
    return this.getCurrentQuestion();
  }

  /**
   * 現在の問題に回答する
   * @param answer 選択した回答
   */
  submitAnswer(answer: ChoiceLabel): void {
    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion) {
      throw new Error('No current question to answer');
    }

    this.responses.set(currentQuestion.id, answer);
  }

  /**
   * 試験を終了する
   * @returns 試験の結果
   */
  finish(): Score {
    this.endTime = new Date();
    return this.getScore();
  }

  /**
   * 試験の結果を計算して返す
   * @returns 試験の結果
   */
  getScore(): Score {
    let correct = 0;
    const correctByDomain: Record<string, { correct: number, total: number }> = {};

    this.questions.forEach(question => {
      const userAnswer = this.responses.get(question.id);
      
      // ドメイン統計の初期化
      if (!correctByDomain[question.domain]) {
        correctByDomain[question.domain] = { correct: 0, total: 0 };
      }
      correctByDomain[question.domain].total++;

      // 正解かどうかをチェック
      if (userAnswer === question.answer) {
        correct++;
        correctByDomain[question.domain].correct++;
      }
    });

    // ドメイン別の正解率を計算
    const domainStats: Record<string, number> = {};
    Object.entries(correctByDomain).forEach(([domain, stats]) => {
      domainStats[domain] = stats.correct;
    });

    return new Score(correct, this.questions.length, domainStats);
  }

  /**
   * 残り時間を計算する（秒単位）
   * @returns 残り時間（秒）、0以下の場合は制限時間超過
   */
  getRemainingTime(): number {
    if (this.endTime) return 0;
    
    const now = new Date();
    const elapsed = (now.getTime() - this.startTime.getTime()) / 1000; // 秒に変換
    const remaining = (this.timeLimit * 60) - elapsed;
    
    return Math.max(0, Math.floor(remaining));
  }

  /**
   * 進捗状況を取得する
   * @returns 進捗状況（回答済み数 / 全問題数）
   */
  getProgress(): { answered: number, total: number } {
    return {
      answered: this.responses.size,
      total: this.questions.length
    };
  }

  /**
   * ユーザーの解答を取得する
   * @param questionId 問題ID
   * @returns ユーザーの解答、未回答の場合はundefined
   */
  getUserAnswer(questionId: string): ChoiceLabel | undefined {
    return this.responses.get(questionId);
  }
} 