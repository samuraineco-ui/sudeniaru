import os
import glob
import markdown
import frontmatter
from datetime import datetime

# --- Settings ---
POSTS_DIR = 'blog/posts'
OUTPUT_DIR = 'blog'
SITE_TITLE = '株式会社スデニアル - ブログ'

# --- HTML Templates ---
BASE_TEMPLATE = """<!DOCTYPE html>
<html lang="ja">
<head>
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-CTWTX2FZX8"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('js', new Date());

      gtag('config', 'G-CTWTX2FZX8');
    </script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{page_title}</title>
    {meta_tags}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;600&family=Zen+Old+Mincho:wght@400;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap" rel="stylesheet">
    <style>
        :root {{
            --bg-color: #2E8B57;
            --text-color: #FFFFFF;
            --accent-color: #C1E1C1;
            --decoration-color: rgba(255, 255, 255, 0.12);
        }}
        body {{
            margin: 0;
            padding: 0;
            font-family: "Shippori Mincho", "Zen Old Mincho", "Yu Mincho", "Hiragino Mincho ProN", serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            line-height: 1.8;
            min-height: 100vh;
        }}
        .bg-decoration {{
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-family: 'Oswald', 'Impact', sans-serif;
            font-weight: 700;
            font-size: 28vw;
            color: var(--decoration-color);
            z-index: -1;
            white-space: nowrap;
            letter-spacing: -0.02em;
            line-height: 1;
            user-select: none;
            pointer-events: none;
        }}
        header {{
            padding: 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
        header img {{
            height: 50px;
        }}
        .back-link {{
            color: var(--text-color);
            text-decoration: none;
            font-size: 1.1rem;
            border-bottom: 1px solid var(--accent-color);
            padding-bottom: 2px;
            transition: color 0.3s;
        }}
        .back-link:hover {{
            color: var(--accent-color);
        }}
        .container {{
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px 80px;
        }}
        /* Typography */
        h1 {{
            font-size: 2.2rem;
            margin-bottom: 10px;
            letter-spacing: 0.1em;
            border-left: 5px solid var(--accent-color);
            padding-left: 15px;
        }}
        .post-date {{
            font-size: 0.95rem;
            opacity: 0.8;
            margin-bottom: 40px;
            display: block;
        }}
        h2 {{
            font-size: 1.5rem;
            margin-top: 50px;
            margin-bottom: 20px;
            border-bottom: 1px solid rgba(255,255,255,0.3);
            padding-bottom: 10px;
        }}
        p {{
            margin-bottom: 20px;
            font-size: 1.05rem;
            letter-spacing: 0.05em;
        }}
        a {{
            color: var(--accent-color);
        }}
        /* Blog List Styles */
        .post-card {{
            border: 1px solid rgba(255,255,255,0.2);
            padding: 30px;
            margin-bottom: 30px;
            border-radius: 8px;
            background: rgba(0,0,0,0.1);
            transition: transform 0.2s, background 0.2s;
        }}
        .post-card:hover {{
            transform: translateY(-2px);
            background: rgba(0,0,0,0.15);
        }}
        .post-card h2 {{
            margin-top: 0;
            border: none;
            padding: 0;
            margin-bottom: 15px;
        }}
        .post-card h2 a {{
            text-decoration: none;
            color: var(--text-color);
        }}
        @media (max-width: 768px) {{
            .bg-decoration {{
                font-size: 35vw;
                transform: translate(-50%, -50%) rotate(90deg);
            }}
            header {{ padding: 20px; }}
            .container {{ padding: 20px 20px 60px; }}
            h1 {{ font-size: 1.8rem; }}
        }}
    </style>
</head>
<body>
    <div class="bg-decoration">SUDENIARU</div>
    <header>
        <a href="../index.html"><img src="../logo.png" alt="sudeniaru"></a>
        <a href="{top_link_url}" class="back-link">{top_link_text}</a>
    </header>
    <main class="container">
        {content}
    </main>
</body>
</html>
"""

def init():
    os.makedirs(POSTS_DIR, exist_ok=True)
    # デモ用の記事が存在しない場合のみ作成
    demo_file = os.path.join(POSTS_DIR, 'hello-world.md')
    if not os.path.exists(demo_file):
        with open(demo_file, 'w', encoding='utf-8') as f:
            f.write("""---
title: スデニアルのブログを始めました
date: 2026-02-27
description: すでにある価値を発見し未来につなげる株式会社スデニアルの公式ブログです。
---

はじめまして、**株式会社スデニアル**です。

私たちは「ないではなく、あるから始める」をテーマに、変化に強い業務システムの開発支援や組織の活性化支援を行っています。

このブログでは、
* 日々の気づきやアイデア
* 業務改善のヒント
* 組織課題との向き合い方

などについて、少しずつ発信していきたいと思います。

## なぜブログを始めたのか

私たちが大切にしている「すでにある価値」に光を当てるプロセスの中で得た学びは、きっと他の方々の役にも立つと感じたからです。

これから、どうぞよろしくお願いいたします。
""")

def build():
    posts = []
    
    # 全てのマークダウンファイルを読み込む
    for file_path in glob.glob(os.path.join(POSTS_DIR, '*.md')):
        with open(file_path, 'r', encoding='utf-8') as f:
            post = frontmatter.load(f)
            
            # メタデータがなければデフォルト値を設定
            title = post.get('title', '無題')
            date_str = str(post.get('date', datetime.today().strftime('%Y-%m-%d')))
            desc = post.get('description', '')
            
            # HTMLに変換
            html_content = markdown.markdown(post.content, extensions=['tables', 'fenced_code'])
            
            slug = os.path.splitext(os.path.basename(file_path))[0]
            output_path = os.path.join(OUTPUT_DIR, f'{slug}.html')
            
            posts.append({
                'title': title,
                'date': date_str,
                'desc': desc,
                'slug': slug,
                'output_path': output_path,
                'html_content': html_content
            })

    # 日付で降順ソート
    posts.sort(key=lambda x: x['date'], reverse=True)

    # 各記事のHTMLページを生成
    for post in posts:
        meta_tags = f'<meta name="description" content="{post["desc"]}">'
        page_content = f"""
        <h1>{post['title']}</h1>
        <span class="post-date">{post['date']}</span>
        <div class="post-body">
            {post['html_content']}
        </div>
        """
        html = BASE_TEMPLATE.format(
            page_title=f"{post['title']} | {SITE_TITLE}",
            meta_tags=meta_tags,
            top_link_url="index.html",
            top_link_text="ブログ一覧へ戻る",
            content=page_content
        )
        with open(post['output_path'], 'w', encoding='utf-8') as f:
            f.write(html)

    # ブログ一覧のHTMLページを生成
    list_items = ""
    for post in posts:
        list_items += f"""
        <article class="post-card">
            <span class="post-date">{post['date']}</span>
            <h2><a href="{post['slug']}.html">{post['title']}</a></h2>
            <p>{post['desc']}</p>
        </article>
        """
    
    if not list_items:
        list_items = "<p>まだ記事がありません。</p>"

    list_html = BASE_TEMPLATE.format(
        page_title=SITE_TITLE,
        meta_tags='<meta name="description" content="株式会社スデニアルの公式ブログ一覧です。">',
        top_link_url="../index.html",
        top_link_text="コーポレートサイトへ戻る",
        content=f"<h1>Blog</h1>{list_items}"
    )

    with open(os.path.join(OUTPUT_DIR, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(list_html)

    print(f"ビルド完了！ {len(posts)} 件の記事を生成しました。")

if __name__ == '__main__':
    init()
    build()
