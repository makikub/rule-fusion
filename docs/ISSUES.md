# RuleFusion Issues & Roadmap

## 🚀 MVP v0.1.0 完了項目

### ✅ 実装済み
- [x] 基本的なCLI構造
- [x] ファイル検出機能（FileDetector）
- [x] 静的解析エンジン（StaticEngine）
- [x] 4つの主要ルール実装
- [x] 設定ファイル対応（.rulefusion.yml）
- [x] コンソールレポーター
- [x] TypeScript型定義
- [x] 基本的なテスト

---

## 🔧 優先度: 高 - MVP改善

### Issue #1: AJVスキーマ検証の実装
**優先度**: 高  
**推定工数**: 2-3日  
**担当**: 未定

#### 概要
現在のFileParserは構文解析のみで、スキーマ検証が未実装。

#### 要件
- [ ] AJVライブラリを使用したスキーマ検証
- [ ] 各ファイル形式（YAML/JSON/MD）用のスキーマ定義
- [ ] エラー位置情報の詳細化（行・列番号）
- [ ] カスタムスキーマのサポート

#### 関連ファイル
- `src/utils/file-parser.ts`
- `src/types/config.ts`
- `src/engines/static-engine.ts`

---

### Issue #2: テストカバレッジの拡充
**優先度**: 高  
**推定工数**: 3-4日  
**担当**: 未定

#### 概要
現在2つのテストファイルのみで、カバレッジが不足。

#### 要件
- [ ] FileDetectorの単体テスト
- [ ] FileParserの単体テスト
- [ ] ConsoleReporterの単体テスト
- [ ] 統合テスト（エンドツーエンド）
- [ ] パフォーマンステスト（1kファイル/30秒要件）

#### 関連ファイル
- `src/__tests__/file-detector.test.ts`
- `src/__tests__/file-parser.test.ts`
- `src/__tests__/console-reporter.test.ts`
- `src/__tests__/integration.test.ts`

---

### Issue #3: エラーハンドリングの強化
**優先度**: 中  
**推定工数**: 2日  
**担当**: 未定

#### 概要
エラーメッセージと位置情報をより詳細に。

#### 要件
- [ ] 行・列番号の正確な取得
- [ ] ユーザーフレンドリーなエラーメッセージ
- [ ] エラーの分類と優先度付け
- [ ] デバッグ情報の追加

#### 関連ファイル
- `src/types/config.ts`
- `src/engines/static-engine.ts`
- `src/reporters/console-reporter.ts`

---

## 🎯 優先度: 中 - 機能拡張

### Issue #4: AIモードの基本実装
**優先度**: 中  
**推定工数**: 5-7日  
**担当**: 未定

#### 概要
AIモードのフォールバック処理と基本構造。

#### 要件
- [ ] AIエンジンの基本クラス設計
- [ ] プラグインアーキテクチャの準備
- [ ] フォールバック処理の実装
- [ ] 設定ファイルでのAI設定

#### 関連ファイル
- `src/engines/ai-engine.ts`
- `src/types/config.ts`
- `src/cli.ts`

---

### Issue #5: パフォーマンス最適化
**優先度**: 中  
**推定工数**: 3-4日  
**担当**: 未定

#### 概要
大量ファイル処理時のパフォーマンス改善。

#### 要件
- [ ] 並列処理の実装
- [ ] メモリ使用量の最適化
- [ ] キャッシュ機能の追加
- [ ] ベンチマークテスト

#### 関連ファイル
- `src/engines/static-engine.ts`
- `src/core/file-detector.ts`
- `src/__tests__/performance.test.ts`

---

### Issue #6: Markdownパーサーの強化
**優先度**: 中  
**推定工数**: 2-3日  
**担当**: 未定

#### 概要
より柔軟なMarkdownルール解析。

#### 要件
- [ ] より多くのMarkdown構文サポート
- [ ] ネストしたリストの解析
- [ ] コードブロック内のルール解析
- [ ] より正確な位置情報

#### 関連ファイル
- `src/utils/file-parser.ts`
- `src/__tests__/file-parser.test.ts`

---

## 🔮 優先度: 低 - 将来機能

### Issue #7: ベストプラクティスカタログ
**優先度**: 低  
**推定工数**: 7-10日  
**担当**: 未定

#### 概要
v0.3.0予定のベストプラクティス機能。

#### 要件
- [ ] カタログ形式の定義
- [ ] StaticPracticesEngineの実装
- [ ] カスタムルールのサポート
- [ ] ドキュメント作成

---

### Issue #8: HTMLレポート機能
**優先度**: 低  
**推定工数**: 5-7日  
**担当**: 未定

#### 概要
ブラウザで表示可能なHTMLレポート。

#### 要件
- [ ] HTMLレポーターの実装
- [ ] インタラクティブなUI
- [ ] フィルタリング機能
- [ ] エクスポート機能

---

## 📋 リリース計画

### v0.1.1 (Hotfix)
- Issue #1: AJVスキーマ検証
- Issue #2: テストカバレッジ拡充

### v0.1.2 (Minor)
- Issue #3: エラーハンドリング強化
- Issue #6: Markdownパーサー強化

### v0.2.0 (Minor)
- Issue #4: AIモード基本実装
- Issue #5: パフォーマンス最適化

### v0.3.0 (Major)
- Issue #7: ベストプラクティスカタログ
- Issue #8: HTMLレポート機能

---

## 🏷️ Issue ラベル

- `bug`: バグ修正
- `enhancement`: 機能改善
- `feature`: 新機能
- `performance`: パフォーマンス関連
- `testing`: テスト関連
- `documentation`: ドキュメント
- `mvp`: MVP関連
- `v0.1.x`: v0.1系リリース
- `v0.2.x`: v0.2系リリース
- `v0.3.x`: v0.3系リリース 