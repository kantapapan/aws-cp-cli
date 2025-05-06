import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JsonQuestionRepository } from './JsonQuestionRepository.js';
import { Question, Domain } from '../../domain/Question.js';
import * as fs from 'fs/promises';

// fs.readFileのモック
vi.mock('fs/promises', () => ({
  readFile: vi.fn()
}));

describe('JsonQuestionRepository', () => {
  let repository: JsonQuestionRepository;
  
  // テスト用のサンプルデータ
  const sampleQuestions = [
    {
      id: 'q001',
      lang: 'jp',
      domain: 'cloud_concepts',
      stem: 'AWSのグローバルインフラストラクチャの特徴として正しいものはどれですか？',
      choices: {
        A: '単一のリージョンのみ',
        B: '複数のリージョンとアベイラビリティーゾーン',
        C: 'エッジロケーションのみ',
        D: 'オンプレミスとクラウドのハイブリッド'
      },
      answer: 'B',
      explanation: 'AWSのグローバルインフラは複数のリージョンとAZで構成されています。',
      updatedAt: 1684123456789
    },
    {
      id: 'q002',
      lang: 'jp',
      domain: 'cloud_concepts',
      stem: 'AWSのグローバルインフラストラクチャの特徴として、正しいものはどれですか？',
      choices: {
        A: '単一のリージョンのみ',
        B: '複数のリージョンとアベイラビリティーゾーン',
        C: 'エッジロケーションのみ',
        D: 'オンプレミスとクラウドのハイブリッド'
      },
      answer: 'B',
      explanation: 'AWSのグローバルインフラは複数のリージョンとAZで構成されています。',
      updatedAt: 1684123456790
    },
    {
      id: 'q003',
      lang: 'jp',
      domain: 'security',
      stem: 'AWSの責任共有モデルにおいて、顧客の責任はどれですか？',
      choices: {
        A: 'クラウドのセキュリティ',
        B: 'クラウド内のセキュリティ',
        C: 'ハードウェアの管理',
        D: 'データセンターの物理的セキュリティ'
      },
      answer: 'B',
      explanation: 'AWSの責任共有モデルでは、顧客はクラウド内のセキュリティを担当します。',
      updatedAt: 1684123456791
    },
    {
      id: 'q004',
      lang: 'jp',
      domain: 'security',
      stem: 'AWSの責任共有モデルにおいて、AWSの責任はどれですか？',
      choices: {
        A: 'クラウドのセキュリティ',
        B: 'クラウド内のセキュリティ',
        C: 'アプリケーションのセキュリティ',
        D: 'ユーザーデータの暗号化'
      },
      answer: 'A',
      explanation: 'AWSの責任共有モデルでは、AWSはクラウド自体のセキュリティを担当します。',
      updatedAt: 1684123456792
    }
  ];

  beforeEach(() => {
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(sampleQuestions));
    repository = new JsonQuestionRepository();
  });

  describe('findRandomWithoutDuplication', () => {
    it('重複のない問題セットを返す', async () => {
      const questions = await repository.findRandomWithoutDuplication({
        count: 3,
        lang: 'jp'
      });
      
      expect(questions.length).toBeLessThanOrEqual(3);
      
      // 重複がないことを確認
      for (let i = 0; i < questions.length; i++) {
        for (let j = i + 1; j < questions.length; j++) {
          const result = questions[i].checkDuplication(questions[j]);
          expect(result.isDuplicate).toBe(false);
        }
      }
    });
    
    it('指定されたドメインの問題だけを返す', async () => {
      const questions = await repository.findRandomWithoutDuplication({
        domain: Domain.SECURITY,
        count: 2,
        lang: 'jp'
      });
      
      expect(questions.length).toBeLessThanOrEqual(2);
      expect(questions.every(q => q.domain === Domain.SECURITY)).toBe(true);
    });
    
    it('類似度の閾値を変更して重複チェックを行う', async () => {
      // 類似度の閾値を低くすると、より厳しい重複チェックになる
      const questions = await repository.findRandomWithoutDuplication({
        count: 3,
        lang: 'jp',
        similarityThreshold: 0.5
      });
      
      expect(questions.length).toBeLessThanOrEqual(3);
      
      // 厳しい類似度チェックでも重複がないことを確認
      for (let i = 0; i < questions.length; i++) {
        for (let j = i + 1; j < questions.length; j++) {
          const result = questions[i].checkDuplication(questions[j], {
            stemSimilarityThreshold: 0.5
          });
          expect(result.isDuplicate).toBe(false);
        }
      }
    });
    
    it('十分な数の問題がない場合、類似度の閾値を下げて再試行する', async () => {
      // コンソール警告をスパイ
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // モック用の類似問題が少ないデータを使用して、閾値緩和の挙動を確認
      const similarQuestions = [
        { ...sampleQuestions[0] },
        { ...sampleQuestions[1] },
        { ...sampleQuestions[2] },
      ];
      
      vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify(similarQuestions));
      const newRepo = new JsonQuestionRepository();
      
      // 3つの問題から、重複のない4つを取得しようとする（閾値緩和が必要）
      const questions = await newRepo.findRandomWithoutDuplication({
        count: 4,
        lang: 'jp',
        similarityThreshold: 0.8
      });
      
      // 警告が出ていることを確認
      expect(consoleWarnSpy).toHaveBeenCalled();
      
      // 利用可能な問題は最大でも3つなので3つ以下
      expect(questions.length).toBeLessThanOrEqual(3);
      
      // スパイをリセット
      consoleWarnSpy.mockRestore();
    });
  });
}); 