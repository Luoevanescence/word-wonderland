#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
cet6_docx2json_all_tables.py
读取 docx 里所有表格，批量转换为目标 JSON 格式
生成 cet6.json
"""

import json
import re
import uuid
from datetime import datetime, timezone
from docx import Document
from pathlib import Path

# ------------------------------------------------------------------
DOCX_FILE = '大学英语六级词汇表(全)含音标.docx'
OUT_FILE  = 'cet6.json'

# 升级版：只以「英文词性 + 点」作为分割点，释义可含括号、中文
RE_DEF = re.compile(r'([a-z]+\.)(.*?)(?=[a-z]+\.|$)', re.I)
# ------------------------------------------------------------------
def parse_meanings(raw: str):
    raw = raw.strip()
    if not raw:
        return []

    parts = RE_DEF.findall(raw)
    if not parts:
        return [{'partOfSpeech': 'unknown', 'meaning': re.sub(r'\s+', ' ', raw).strip('；,， ')}]

    definitions = []
    for pos, meaning in parts:
        meaning = re.sub(r'\s+', ' ', meaning).strip('；,， ')  # 统一清空格、分隔符
        if meaning:
            definitions.append({'partOfSpeech': pos.strip(),
                                'meaning': meaning})
    return definitions
# ------------------------------------------------------------------
def main():
    doc = Document(DOCX_FILE)
    data = []
    now = datetime.now(timezone.utc).isoformat(timespec='milliseconds')

    for tbl_idx, table in enumerate(doc.tables, start=1):
        rows = table.rows[1:]            # 跳过表头
        for row in rows:
            cells = row.cells
            if len(cells) < 4:
                continue
            word = cells[1].text.strip()
            if not word:
                continue
            definitions = parse_meanings(cells[3].text)
            data.append({
                'id': str(uuid.uuid4()),
                'word': word,
                'definitions': definitions,
                'createdAt': now,
                'updatedAt': now
            })

    Path(OUT_FILE).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'转换完成！共处理 {len(data)} 条记录，已保存到 {OUT_FILE}')

# ------------------------------------------------------------------
if __name__ == '__main__':
    main()