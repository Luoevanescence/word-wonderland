#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
爬取 https://bookdown.org/wxhyihuan/EnW4CET6-1606998033389
单页 HTML → 按章节提取单词、音标、释义
生成 cet6_bookdown.json / .csv / .md 三种格式
"""
import re, json, csv, pathlib, sys
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm

URL = "https://bookdown.org/wxhyihuan/EnW4CET6-1606998033389"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/122.0.0.0 Safari/537.36"
}

# 正则：匹配单词、音标、基本释义
RE_WORD = re.compile(
    r"^(?P<word>[A-Za-z]+)\s*"                 # 单词
    r"(?P<phonetic>\[.*?\])?\s*"               # 可选音标
    r"(?P<mean>.*)$"                           # 释义
)

def fetch_html():
    """获取单页 HTML"""
    resp = requests.get(URL, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    resp.encoding = resp.apparent_encoding  # 自动识别中文编码
    return resp.text

def parse_one_page(html: str):
    """
    Bookdown 单页结构：
    <div class="page-inner">
       <section id="id" class="level2">   ← 章节
          <h2> 章节标题 </h2>
          <p> 单词 [音标] 释义 </p>
          ...
    """
    soup = BeautifulSoup(html, "lxml")

    data = []
    # 所有二级标题就是章节
    for sec in soup.select("section.level2"):
        h2 = sec.find("h2")
        if not h2:
            continue
        chapter = h2.get_text(strip=True)
        # 收集该章节下所有段落
        for p in sec.select("p"):
            line = p.get_text(strip=True)
            if not line:
                continue
            m = RE_WORD.match(line)
            if not m:          # 不符合单词行格式就跳过
                continue
            data.append({
                "chapter": chapter,
                "word": m["word"],
                "phonetic": m["phonetic"] or "",
                "meaning": m["mean"].strip()
            })
    return data

def save_json(data, file="cet6_bookdown.json"):
    with open(file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"[OK] JSON → {file}  共 {len(data)} 条")

def save_csv(data, file="cet6_bookdown.csv"):
    with open(file, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=["chapter", "word", "phonetic", "meaning"])
        w.writeheader()
        w.writerows(data)
    print(f"[OK] CSV  → {file}")

def save_markdown(data, file="cet6_bookdown.md"):
    lines = ["| 章节 | 单词 | 音标 | 释义 |",
             "|------|------|------|------|"]
    for it in data:
        lines.append(f"| {it['chapter']} | {it['word']} | {it['phonetic']} | {it['meaning']} |")
    pathlib.Path(file).write_text("\n".join(lines), encoding="utf-8")
    print(f"[OK] Markdown → {file}")

def main():
    print("正在抓取……")
    html = fetch_html()
    print("正在解析……")
    data = parse_one_page(html)
    if not data:
        print("未解析到任何单词，可能页面结构已变动")
        sys.exit(1)
    save_json(data)
    save_csv(data)
    save_markdown(data)

if __name__ == "__main__":
    main()