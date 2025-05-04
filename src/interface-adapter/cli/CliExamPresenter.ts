import { ExamPresenter, ExamSummaryDTO, QuestionDTO } from '../../usecase/ports/ExamPresenter.js';
import chalk from 'chalk';
import prompts from 'prompts';
import { injectable } from 'tsyringe';

/**
 * CLI用のExamPresenter実装
 */
@injectable()
export class CliExamPresenter implements ExamPresenter {
  /**
   * 問題を表示し、ユーザーの回答を受け付ける
   * @param dto 表示する問題のDTO
   * @returns ユーザーが選択した回答
   */
  async showQuestion(dto: QuestionDTO): Promise<string> {
    this.clearScreen();
    
    // 問題ヘッダー表示
    console.log(chalk.cyan('======================================'));
    console.log(chalk.cyan(`質問 ${dto.questionNumber}/${dto.totalQuestions}`));
    
    if (dto.remainingTime) {
      const minutes = Math.floor(dto.remainingTime / 60);
      const seconds = dto.remainingTime % 60;
      console.log(chalk.yellow(`残り時間: ${minutes}分${seconds}秒`));
    }
    console.log(chalk.cyan('======================================'));
    
    // 問題文表示
    console.log(chalk.white.bold('\n' + dto.question.stem + '\n'));
    
    // 選択肢表示
    Object.entries(dto.question.choices).forEach(([key, value]) => {
      console.log(chalk.white(`${key}: ${value}`));
    });
    
    console.log('\n'); // 空行
    
    // ユーザー入力受付
    const response = await prompts({
      type: 'select',
      name: 'answer',
      message: '回答を選択してください:',
      choices: Object.keys(dto.question.choices).map(key => ({
        title: `${key}`,
        value: key
      }))
    });
    
    return response.answer;
  }
  
  /**
   * 試験結果のサマリーを表示する
   * @param dto 表示する試験結果のDTO
   */
  async showSummary(dto: ExamSummaryDTO): Promise<void> {
    this.clearScreen();
    
    // 試験結果ヘッダー
    console.log(chalk.cyan('======================================'));
    console.log(chalk.cyan('試験結果'));
    console.log(chalk.cyan('======================================'));
    
    // スコア表示
    const score = dto.score.percent();
    const isPassed = dto.score.isPassed();
    
    console.log(`\n正解数: ${dto.score.correct}/${dto.score.total} (${score}%)`);
    console.log(`結果: ${isPassed ? chalk.green('合格') : chalk.red('不合格')}`);
    
    // 時間表示
    const minutes = Math.floor(dto.duration / 60);
    const seconds = dto.duration % 60;
    console.log(`所要時間: ${minutes}分${seconds}秒\n`);
    
    // ドメイン別結果
    console.log(chalk.cyan('ドメイン別結果:'));
    Object.entries(dto.score.correctByDomain).forEach(([domain, correct]) => {
      const domainName = this.getDomainName(domain);
      console.log(`${domainName}: ${correct}問正解`);
    });
    
    console.log('\n');
    
    // ユーザーに続行を促す
    await prompts({
      type: 'confirm',
      name: 'continue',
      message: 'メインメニューに戻る',
      initial: true
    });
  }
  
  /**
   * 進捗状況を表示する
   * @param current 現在の問題番号
   * @param total 全問題数
   * @param remainingTime 残り時間（秒）
   */
  async showProgress(current: number, total: number, remainingTime?: number): Promise<void> {
    const progressBar = this.createProgressBar(current, total);
    
    console.log(chalk.cyan('進捗状況:'));
    console.log(progressBar);
    console.log(`${current}/${total} 問完了`);
    
    if (remainingTime) {
      const minutes = Math.floor(remainingTime / 60);
      const seconds = remainingTime % 60;
      console.log(chalk.yellow(`残り時間: ${minutes}分${seconds}秒`));
    }
  }
  
  /**
   * エラーメッセージを表示する
   * @param error エラーメッセージまたはエラーオブジェクト
   */
  async showError(error: string | Error): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : error;
    console.error(chalk.red('エラーが発生しました:'));
    console.error(chalk.red(errorMessage));
    
    await prompts({
      type: 'confirm',
      name: 'acknowledge',
      message: '続行するには Enter キーを押してください',
      initial: true
    });
  }
  
  /**
   * 画面をクリアする
   */
  private clearScreen(): void {
    // プロセスの種類に応じて画面をクリア
    process.stdout.write(process.platform === 'win32' ? '\x1Bc' : '\x1B[2J\x1B[3J\x1B[H');
  }
  
  /**
   * プログレスバーを作成する
   * @param current 現在の値
   * @param total 合計値
   * @returns プログレスバー文字列
   */
  private createProgressBar(current: number, total: number): string {
    const width = 30;
    const percent = Math.min(current / total, 1);
    const filledWidth = Math.round(width * percent);
    
    const filled = '█'.repeat(filledWidth);
    const empty = '░'.repeat(width - filledWidth);
    
    return `${filled}${empty} ${Math.round(percent * 100)}%`;
  }
  
  /**
   * ドメインのキーから表示名を取得する
   * @param domainKey ドメインのキー
   * @returns ドメインの表示名
   */
  private getDomainName(domainKey: string): string {
    const domainNames: Record<string, string> = {
      'cloud_concepts': 'クラウドコンセプト',
      'security': 'セキュリティ',
      'technology': 'テクノロジー',
      'billing': '請求と料金'
    };
    
    return domainNames[domainKey] || domainKey;
  }
} 