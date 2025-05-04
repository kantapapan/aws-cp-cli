import chalk from 'chalk';
import prompts from 'prompts';
import { injectable, inject } from 'tsyringe';
import { Domain } from '../../domain/Question.js';
import { ExamMode } from '../../domain/ExamSession.js';
import { StartExam } from '../../usecase/StartExam.js';
import { RunExam } from '../../usecase/RunExam.js';

/**
 * アプリケーションのメインメニュー
 */
@injectable()
export class MainMenu {
  constructor(
    @inject(StartExam) private startExam: StartExam,
    @inject(RunExam) private runExam: RunExam
  ) {}

  /**
   * メインメニューを表示する
   */
  async show(): Promise<void> {
    while (true) {
      this.clearScreen();
      this.displayLogo();

      const action = await prompts({
        type: 'select',
        name: 'value',
        message: 'メニューを選択してください',
        choices: [
          { title: '本番形式の模擬試験（65問）', value: 'full-exam' },
          { title: '練習問題（ドメイン選択可能）', value: 'practice' },
          { title: '問題データを更新', value: 'update' },
          { title: '試験結果の統計', value: 'stats' },
          { title: '終了', value: 'exit' }
        ]
      });

      if (!action.value || action.value === 'exit') {
        console.log(chalk.yellow('アプリケーションを終了します。'));
        break;
      }

      await this.handleAction(action.value);
    }
  }

  /**
   * ユーザーの選択に基づいてアクションを実行
   * @param action 選択されたアクション
   */
  private async handleAction(action: string): Promise<void> {
    try {
      switch (action) {
        case 'full-exam':
          await this.startFullExam();
          break;
        case 'practice':
          await this.startPracticeExam();
          break;
        case 'update':
          await this.updateQuestions();
          break;
        case 'stats':
          await this.showStats();
          break;
      }
    } catch (error) {
      console.error(chalk.red('エラーが発生しました:'));
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      
      await prompts({
        type: 'confirm',
        name: 'continue',
        message: '続行するには Enter キーを押してください',
        initial: true
      });
    }
  }

  /**
   * 本番形式の模擬試験を開始
   */
  private async startFullExam(): Promise<void> {
    // 言語選択
    const langChoice = await this.selectLanguage();
    if (!langChoice) return;

    // 試験セッションを作成
    const session = await this.startExam.execute({
      mode: ExamMode.FULL_EXAM,
      lang: langChoice
    });

    // 試験を実行
    await this.runExam.execute(session);
  }

  /**
   * 練習問題を開始
   */
  private async startPracticeExam(): Promise<void> {
    // 言語選択
    const langChoice = await this.selectLanguage();
    if (!langChoice) return;

    // ドメイン選択
    const domainChoice = await this.selectDomain();
    if (!domainChoice) return;

    // 問題数選択
    const countChoice = await this.selectQuestionCount();
    if (!countChoice) return;

    // 試験セッションを作成
    const session = await this.startExam.execute({
      mode: ExamMode.PRACTICE,
      domain: domainChoice === 'all' ? undefined : domainChoice as Domain,
      count: countChoice,
      lang: langChoice
    });

    // 試験を実行
    await this.runExam.execute(session);
  }

  /**
   * 問題データを更新
   */
  private async updateQuestions(): Promise<void> {
    console.log(chalk.yellow('問題データの更新は現在実装されていません。'));
    
    await prompts({
      type: 'confirm',
      name: 'continue',
      message: '続行するには Enter キーを押してください',
      initial: true
    });
  }

  /**
   * 統計情報を表示
   */
  private async showStats(): Promise<void> {
    console.log(chalk.yellow('試験結果の統計は現在実装されていません。'));
    
    await prompts({
      type: 'confirm',
      name: 'continue',
      message: '続行するには Enter キーを押してください',
      initial: true
    });
  }

  /**
   * 言語を選択
   * @returns 選択された言語コード、またはキャンセル時はnull
   */
  private async selectLanguage(): Promise<string | null> {
    const response = await prompts({
      type: 'select',
      name: 'value',
      message: '言語を選択してください',
      choices: [
        { title: '日本語', value: 'jp' },
        { title: '英語', value: 'en' },
        { title: '戻る', value: 'back' }
      ]
    });

    return response.value === 'back' ? null : response.value;
  }

  /**
   * ドメインを選択
   * @returns 選択されたドメイン、またはキャンセル時はnull
   */
  private async selectDomain(): Promise<string | null> {
    const response = await prompts({
      type: 'select',
      name: 'value',
      message: 'カテゴリを選択してください',
      choices: [
        { title: 'すべて', value: 'all' },
        { title: 'クラウドコンセプト', value: Domain.CLOUD_CONCEPTS },
        { title: 'セキュリティ', value: Domain.SECURITY },
        { title: 'テクノロジー', value: Domain.TECHNOLOGY },
        { title: '請求と料金', value: Domain.BILLING },
        { title: '戻る', value: 'back' }
      ]
    });

    return response.value === 'back' ? null : response.value;
  }

  /**
   * 問題数を選択
   * @returns 選択された問題数、またはキャンセル時はnull
   */
  private async selectQuestionCount(): Promise<number | null> {
    const response = await prompts({
      type: 'select',
      name: 'value',
      message: '問題数を選択してください',
      choices: [
        { title: '5問', value: 5 },
        { title: '10問', value: 10 },
        { title: '20問', value: 20 },
        { title: '30問', value: 30 },
        { title: '戻る', value: 'back' }
      ]
    });

    return response.value === 'back' ? null : response.value;
  }

  /**
   * 画面をクリアする
   */
  private clearScreen(): void {
    // プロセスの種類に応じて画面をクリア
    process.stdout.write(process.platform === 'win32' ? '\x1Bc' : '\x1B[2J\x1B[3J\x1B[H');
  }

  /**
   * アプリケーションのロゴを表示
   */
  private displayLogo(): void {
    console.log(chalk.cyan(`
      ===================================================
       _____  _    _  _____     _____  _____          _     _ 
      |  _  || |  | |/  ___|   /  __ \|  _  |        | |   (_)
      | | | || |  | |\ \`--.    | /  \/| |_| |        | |    _ 
      | | | || |/\\| | \`--. \\   | |    |  _  |        | |   | |
      \\ \\_/ /\\  /\\  //\\__/ /   | \\__/\\| |_| |        | |___| |
       \\___/  \\/  \\/ \\____/     \\____/\\_____/        \\_____/_|
                                                             
         AWS認定クラウドプラクティショナー 模擬試験 CLI
      ===================================================
    `));
  }
} 