import 'reflect-metadata';
import { injectable, inject } from 'tsyringe';
import { ExamSession, Score, ExamMode } from '../domain/ExamSession.js';
import { ExamPresenter, QuestionDTO, ExamSummaryDTO } from './ports/ExamPresenter.js';
import { StatsStore, ExamResult } from './ports/StatsStore.js';
import chalk from 'chalk';
import prompts from 'prompts';

/**
 * 試験を実行するユースケース
 */
@injectable()
export class RunExam {
  constructor(
    @inject('ExamPresenter') private presenter: ExamPresenter,
    @inject('StatsStore') private statsStore: StatsStore
  ) {}

  /**
   * 試験を実行する
   * @param session 試験セッション
   * @returns 試験結果
   */
  async execute(session: ExamSession): Promise<Score> {
    const startTime = new Date();
    const totalQuestions = session.questions.length;
    let questionNumber = 1;
    
    try {
      let currentQuestion = session.getCurrentQuestion();
      
      // 問題がなくなるまで繰り返す
      while (currentQuestion) {
        // 残り時間を取得
        const remainingTime = session.getRemainingTime();
        
        // 時間切れの場合は終了
        if (remainingTime <= 0) {
          await this.presenter.showError('試験時間が終了しました。');
          break;
        }
        
        // 問題を表示
        const answer = await this.presenter.showQuestion({
          questionNumber,
          totalQuestions,
          question: currentQuestion,
          remainingTime
        });
        
        // 回答を記録
        session.submitAnswer(answer as any);
        
        // 練習モードの場合、1問ごとに解答を表示
        if (session.mode === ExamMode.PRACTICE) {
          const isCorrect = answer === currentQuestion.answer;
          await this.presenter.showAnswerExplanation(
            currentQuestion,
            answer,
            isCorrect
          );
        }
        
        // 進捗を表示
        await this.presenter.showProgress(questionNumber, totalQuestions, remainingTime);
        
        // 次の問題へ
        currentQuestion = session.nextQuestion();
        questionNumber++;
      }
      
      // 試験終了
      const score = session.finish();
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
      
      // ユーザーの解答を集計
      const userAnswers: Record<string, string> = {};
      session.questions.forEach(question => {
        const answer = session.getUserAnswer(question.id);
        if (answer) {
          userAnswers[question.id] = answer;
        }
      });
      
      // 結果を表示（本番モードの場合のみ詳細な結果を表示）
      if (session.mode === ExamMode.FULL_EXAM) {
        await this.presenter.showSummary({
          score,
          duration,
          questions: session.questions,
          userAnswers
        });
      } else {
        // 練習モードの場合は簡易的な結果のみ表示
        await this.showPracticeSummary(score, duration);
      }
      
      // 結果を保存
      await this.saveResult(session, score, duration);
      
      return score;
    } catch (error) {
      await this.presenter.showError(error instanceof Error ? error : String(error));
      throw error;
    }
  }
  
  /**
   * 練習モード用の簡易的な結果表示
   */
  private async showPracticeSummary(score: Score, duration: number): Promise<void> {
    console.log(chalk.cyan('\n======================================'));
    console.log(chalk.cyan('練習結果'));
    console.log(chalk.cyan('======================================\n'));
    
    console.log(`正解数: ${score.correct}/${score.total} (${score.percent()}%)`);
    
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    console.log(`所要時間: ${minutes}分${seconds}秒\n`);
    
    await prompts({
      type: 'confirm',
      name: 'continue',
      message: 'メインメニューに戻る',
      initial: true
    });
  }
  
  /**
   * 試験結果を保存する
   * @param session 試験セッション
   * @param score 試験スコア
   * @param duration 所要時間（秒）
   */
  private async saveResult(session: ExamSession, score: Score, duration: number): Promise<void> {
    const result: ExamResult = {
      timestamp: new Date(),
      examType: session.examType,
      mode: session.mode,
      score: score.percent(),
      correct: score.correct,
      total: score.total,
      domainStats: score.correctByDomain,
      duration
    };
    
    await this.statsStore.save(result);
  }
} 