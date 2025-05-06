import { describe, it, expect } from 'vitest';
import { Question, Domain, DuplicationCheckResult } from './Question.js';

describe('Question', () => {
  describe('checkDuplication', () => {
    // 基本的な問題データを作成するヘルパー関数
    const createQuestion = (id: string, stem: string, choices: Record<string, string> = {
      A: '選択肢A',
      B: '選択肢B',
      C: '選択肢C',
      D: '選択肢D'
    }) => {
      return Question.create({
        id,
        lang: 'jp',
        domain: 'cloud_concepts',
        stem,
        choices,
        answer: 'A',
        explanation: 'テスト用の説明文'
      });
    };

    it('同一のIDの場合は重複と判定する', () => {
      const q1 = createQuestion('q001', 'テスト問題1');
      const q2 = createQuestion('q001', '全く異なる問題文');
      
      const result = q1.checkDuplication(q2);
      
      expect(result.isDuplicate).toBe(true);
      expect(result.similarityScore).toBe(1.0);
    });
    
    it('同一の問題文の場合は重複と判定する', () => {
      const q1 = createQuestion('q001', 'テスト問題1');
      const q2 = createQuestion('q002', 'テスト問題1');
      
      const result = q1.checkDuplication(q2);
      
      expect(result.isDuplicate).toBe(true);
      expect(result.similarityScore).toBe(1.0);
    });
    
    it('類似した問題文の場合は重複と判定する', () => {
      const q1 = createQuestion('q001', 'AWSのグローバルインフラストラクチャの特徴として正しいものはどれですか？');
      const q2 = createQuestion('q002', 'AWSのグローバルインフラストラクチャの特徴として、正しいものはどれですか？');
      
      const result = q1.checkDuplication(q2);
      
      expect(result.isDuplicate).toBe(true);
      expect(result.similarityScore).toBeGreaterThan(0.8);
    });
    
    it('類似度が閾値未満の場合は重複と判定しない', () => {
      const q1 = createQuestion('q001', 'AWSのグローバルインフラストラクチャの特徴として正しいものはどれですか？');
      const q2 = createQuestion('q002', 'AWSの責任共有モデルにおいて、顧客の責任はどれですか？');
      
      const result = q1.checkDuplication(q2, { stemSimilarityThreshold: 0.8 });
      
      expect(result.isDuplicate).toBe(false);
    });
    
    it('選択肢が類似している場合は重複と判定する', () => {
      const choices1 = {
        A: '単一のリージョンのみ',
        B: '複数のリージョンとアベイラビリティーゾーン',
        C: 'エッジロケーションのみ',
        D: 'オンプレミスとクラウドのハイブリッド'
      };
      
      const choices2 = {
        A: '単一のリージョンのみを利用',
        B: '複数のリージョンとアベイラビリティーゾーンを利用',
        C: 'エッジロケーションのみを利用',
        D: 'オンプレミスとクラウドのハイブリッド構成'
      };
      
      const q1 = createQuestion('q001', '問題1', choices1);
      const q2 = createQuestion('q002', '問題2', choices2);
      
      const result = q1.checkDuplication(q2, { stemSimilarityThreshold: 0.5 });
      
      expect(result.isDuplicate).toBe(true);
    });
    
    it('選択肢チェックを無効にした場合は選択肢の類似性を無視する', () => {
      const choices1 = {
        A: '単一のリージョンのみ',
        B: '複数のリージョンとアベイラビリティーゾーン',
        C: 'エッジロケーションのみ',
        D: 'オンプレミスとクラウドのハイブリッド'
      };
      
      const choices2 = {
        A: '単一のリージョンのみを利用',
        B: '複数のリージョンとアベイラビリティーゾーンを利用',
        C: 'エッジロケーションのみを利用',
        D: 'オンプレミスとクラウドのハイブリッド構成'
      };
      
      const q1 = createQuestion('q001', '問題1', choices1);
      const q2 = createQuestion('q002', '問題2', choices2);
      
      const result = q1.checkDuplication(q2, { 
        stemSimilarityThreshold: 0.5,
        checkChoices: false
      });
      
      expect(result.isDuplicate).toBe(false);
    });
  });
}); 