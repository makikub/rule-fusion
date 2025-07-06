````markdown
# RuleFusion 要件定義（サマリ版 v0.6）

## 1. 背景
GitHub Copilot／Cursor／Claude Code など複数の AI コーディング支援ツールが  
**同じリポジトリ**を参照する機会が増えている。  
それぞれが読む「ルールファイル」は **散在・重複・齟齬** が起きやすく、  
品質低下やトラブルの温床になる。

---

## 2. 目的
1. ルールファイルの **存在・構文・整合性** を自動チェック  
2. CI でプルリク段階に **ブロック／警告** を出し、早期是正  
3. OSS として公開し、外部コントリビューションを促進

---

## 3. スコープ

| 項目 | 内容 |
|------|------|
| **初期対象ツール** | GitHub Copilot / Cursor / Claude Code |
| **対象形式** | YAML・JSON・Markdown（H2＋箇条書き or Front‑matter） |
| **MVP** | カレントディレクトリ解析＋設定ファイル指定のみ |
| **除外 (v0.1)** | リモートリポジトリ解析・GitHub Checks・HTML レポート |

---

## 4. 機能要件

| ID | 機能 | 詳細 (MVP static) |
|----|------|------------------|
| F‑01 | ファイル検出 | `.rulefusion.yml` の `tools.*.include` グロブで列挙 |
| F‑02 | スキーマ検証 | AJV で型・必須項目チェック |
| F‑03 | 齟齬判定 | `duplicate‑key` / `undefined‑ref` / `priority‑cycle` / `range‑conflict` |
| F‑04 | レポート | CLI へカラー表示・Exit code 0/1 |
| F‑05 | 設定読込 | `.rulefusion.yml` で除外パス・ルールレベル変更 |

### 4.1 AI 拡張モード（任意）
| 追加ルール | 内容例 |
|------------|--------|
| `natural‑language‑conflict` | 自然言語ベースの論理矛盾検知 |
| `style‑consistency` | 重複・冗長なスタイル条項の集約提案 |

> AI モードは `--mode ai` か `.rulefusion.yml` で `ai.enabled: true` を指定。  
> API キー未設定時は自動的に static モードへフォールバック。

---

## 5. 非機能要件

| 区分 | Static | AI |
|------|--------|----|
| ライセンス | **MIT** |
| 実装 | **TypeScript (Node 20+) / npm 配布 / npx 実行** |
| ネットワーク | 不要 | HTTPS（生成 AI API） |
| 決定性 | 100 % | ベストエフォート（結果キャッシュ可） |
| コスト | 0 円 | API 従量課金（ユーザ負担） |
| パフォーマンス | 1 k ファイル / 10 万行 ≦ 30 s |

---

## 6. CLI 仕様

```bash
# 静的解析（デフォルト）
npx rulefusion

# 設定ファイル指定
npx rulefusion --config .rulefusion.yml

# AI 解析を有効化
npx rulefusion --mode ai --ai-provider openai --ai-model gpt-4o-mini
````

---

## 7. 設定ファイル `.rulefusion.yml`（抜粋）

```yaml
tools:
  copilot: { include: [".copilot/**/*.yml"] }
  cursor:  { include: [".cursor/**/*.md"] }
  claude:  { include: [".claude/**/*.yml"] }

exclude: ["examples/**"]

rules:
  duplicate-key: error
  undefined-ref: error
  priority-cycle: error
  range-conflict: warning

ai:
  enabled: false          # true で AI モード
  provider: openai
  model: gpt-4o-mini

bestPractices:
  enabled: true           # v0.3 予定
  catalogs: [".rulefusion-practices/**/*.yml"]
```

---

## 8. アーキテクチャ

```
 ┌────────── CLI ──────────┐
 │                         │
 │  StaticEngine  AiEngine │  ← プラグインロード
 │        │          │     │
 └───┬────┴────┬─────┴─────┘
     │          │
  RuleSet    IAiProvider
     │          │
   ReportAggregator → Reporter (console / exit)
```

* AI 依存はプラグイン（例 `@rulefusion/plugin-openai`）に分離
* Markdown は `remark` AST → KV 抽出 → 共通ルールで判定

---

## 9. ベストプラクティス準拠チェック（ロードマップ）

| フェーズ | 期間※       | 内容                              |
| ---- | --------- | ------------------------------- |
| 5    | 8/10–8/20 | YAML カタログ＋StaticPracticesEngine |
| 6    | 8/21–9/05 | AI プラグインでベストプラクティス照合            |
| 7    | 9/06      | v0.3.0 リリース                     |

※ 目安。MVP (v0.1.0) は 8/03 npm 公開予定。

---

## 10. 既存類似ツールとの違い (概要)

| 種別           | 既存 OSS          | RuleFusion               |
| ------------ | --------------- | ------------------------ |
| プロンプト評価      | Promptfoo 等     | 対象外（実行時テスト）              |
| ガードレール       | Guardrails AI 等 | 静的解析中心                   |
| プロンプト整形／lint | promptlint 等    | **ルールファイル横断で構文＋整合性チェック** |
| 生成 AI 併用     | 一部ツールが必須        | **オプション**（デフォルト Off）     |

---

## 11. まとめ

**RuleFusion** は **「複数 AI ツールが参照するルールファイルを一貫性チェック」** する OSS。

* デフォルトは **完全オフライン静的検査**（YAML/JSON/MD）
* 必要に応じ **生成 AI で自然言語矛盾も検知**
* 拡張は **プラグイン** と **ベストプラクティスカタログ** で柔軟に対応
  コミュニティのフィードバックを取り込みつつ、MVP → v0.3 へ段階的に進化させる。

```
