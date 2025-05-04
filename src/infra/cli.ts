import 'reflect-metadata';
import { container } from 'tsyringe';
import { QuestionRepository } from '../usecase/ports/QuestionRepository.js';
import { ExamPresenter } from '../usecase/ports/ExamPresenter.js';
import { StatsStore } from '../usecase/ports/StatsStore.js';
import { JsonQuestionRepository } from './repository/JsonQuestionRepository.js';
import { FileStatsStore } from './repository/FileStatsStore.js';
import { CliExamPresenter } from '../interface-adapter/cli/CliExamPresenter.js';
import { MainMenu } from '../interface-adapter/cli/MainMenu.js';
import { StartExam } from '../usecase/StartExam.js';
import { RunExam } from '../usecase/RunExam.js';

// DIコンテナの設定
setupDependencies();

// メインメニューの起動
(async () => {
  try {
    const mainMenu = container.resolve(MainMenu);
    await mainMenu.show();
  } catch (error) {
    console.error('アプリケーション実行中にエラーが発生しました:');
    console.error(error);
    process.exit(1);
  }
})();

/**
 * 依存関係を設定する
 */
function setupDependencies(): void {
  // リポジトリ
  container.register<QuestionRepository>('QuestionRepository', {
    useClass: JsonQuestionRepository
  });
  
  // ストア
  container.register<StatsStore>('StatsStore', {
    useClass: FileStatsStore
  });
  
  // プレゼンター
  container.register<ExamPresenter>('ExamPresenter', {
    useClass: CliExamPresenter
  });
  
  // ユースケース
  container.register(StartExam, {
    useClass: StartExam
  });
  
  container.register(RunExam, {
    useClass: RunExam
  });
  
  // インターフェース
  container.register(MainMenu, {
    useClass: MainMenu
  });
} 