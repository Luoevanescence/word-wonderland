#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从 bookdown 单页 HTML 提取“词组/短语 + 中文释义”
生成 phrase.json / phrase.csv / phrase.md
依赖：仅 Python3 标准库
"""
import re, json, csv, pathlib, html.parser, uuid
from datetime import datetime

html_file = 'phrase.html'
phrase_re = re.compile(
    r'^(?P<phrase>[\w\s\'\.·/\-–—,()]+?)\s*'   # 英文短语（允许空格、斜杠、连字符、括号）
    r'(?P<chinese>[\u4e00-\u9fff；、，：].*)$',  # 中文释义（必须含汉字）
    re.M
)
import re

def extract_phrase_pairs(text):
    """
    从文本中提取所有 "英文短语 + 中文释义" 对
    支持多种格式：
    - "英文短语 中文释义"
    - "中文释义 . 英文短语 中文释义"
    - "数字编号英文短语 中文释义"
    - "中文释义 英文短语 中文释义"
    """
    pairs = []
    if not text or not text.strip():
        return pairs
    
    # 清理文本：去除前后空白，但保留内部结构
    text = text.strip()
    
    # 模式1: 查找带数字编号的短语（如 "2 observe"、"3comply with"、"132.expose…to…"）
    # 支持格式：数字.英文短语 中文 或 数字英文短语 中文
    numbered_pattern = re.compile(
        r'(\d+\.?\s*)([A-Za-z][A-Za-z0-9\s\'\.·/\-–—,()]*?[A-Za-z0-9\.])\s+([\u4e00-\u9fff][\u4e00-\u9fff；、，：．\s]*)',
        re.S
    )
    
    # 模式2: 查找普通的 "英文短语 中文释义" 对（不包含数字编号）
    # 英文短语：以字母开头，包含字母、数字、空格、标点，后面接空格和中文
    plain_pattern = re.compile(
        r'([A-Za-z][A-Za-z0-9\s\'\.·/\-–—,()]*?[A-Za-z0-9\.])\s+([\u4e00-\u9fff][\u4e00-\u9fff；、，：．\s]*)',
        re.S
    )
    
    # 先提取所有带编号的模式，记录它们的位置
    numbered_ranges = []  # 存储 (start, end) 元组
    numbered_results = []
    
    for match in numbered_pattern.finditer(text):
        phrase = match.group(2).strip()
        meaning = match.group(3).strip()
        if phrase and meaning and len(phrase) >= 2:
            start = match.start()
            end = match.end()
            numbered_ranges.append((start, end))
            numbered_results.append({
                'start': start,
                'end': end,
                'phrase': phrase,
                'meaning': meaning
            })
    
    # 提取所有普通模式，排除已被编号模式覆盖的区域
    plain_results = []
    
    for match in plain_pattern.finditer(text):
        start = match.start()
        end = match.end()
        
        # 检查是否在编号模式的范围内
        in_numbered_range = False
        for nr_start, nr_end in numbered_ranges:
            if nr_start <= start < nr_end:
                in_numbered_range = True
                break
        
        if not in_numbered_range:
            phrase = match.group(1).strip()
            meaning = match.group(2).strip()
            # 过滤掉太短的内容，并确保不是数字开头
            if len(phrase) >= 2 and len(meaning) >= 1 and not phrase[0].isdigit():
                # 检查短语是否以字母开头
                if phrase and phrase[0].isalpha():
                    plain_results.append({
                        'start': start,
                        'end': end,
                        'phrase': phrase,
                        'meaning': meaning
                    })
    
    # 合并所有匹配，按位置排序
    all_matches = numbered_results + plain_results
    all_matches.sort(key=lambda x: x['start'])
    
    # 去重和清理：移除重叠的匹配
    if all_matches:
        final_matches = []
        for current in all_matches:
            if not final_matches:
                final_matches.append(current)
            else:
                prev = final_matches[-1]
                # 如果有重叠，保留更长的匹配或后一个匹配
                if current['start'] < prev['end']:
                    # 重叠：比较长度，保留更长的
                    prev_len = prev['end'] - prev['start']
                    curr_len = current['end'] - current['start']
                    if curr_len > prev_len:
                        final_matches[-1] = current
                else:
                    # 不重叠，直接添加
                    final_matches.append(current)
        
        pairs = [(m['phrase'], m['meaning']) for m in final_matches]
    
    return pairs

def flatten_phrases(coarse: list[dict]) -> list[dict]:
    flat = []
    phrase_id = 1  # 从1开始生成唯一序号
    
    for item in coarse:
        phrase = item.get('phrase', '').strip()
        meaning = item.get('meaning', '').strip()
        
        if not meaning:
            continue
        
        # 如果原始短语本身是数字开头（如 "1obey"），移除开头的数字
        if phrase and re.match(r'^\d+', phrase):
            phrase_cleaned = re.sub(r'^\d+', '', phrase).strip()
            if not phrase_cleaned:
                phrase_cleaned = phrase
        else:
            phrase_cleaned = phrase
        
        # 尝试从 meaning 中提取多个短语对
        pairs = extract_phrase_pairs(meaning)
        
        if pairs:
            # 如果提取到了短语对
            # 检查第一个中文释义是否对应原始短语
            # 如果原始短语存在且以字母开头，尝试将第一个释义匹配给它
            has_original = phrase_cleaned and len(phrase_cleaned) >= 2 and phrase_cleaned[0].isalpha()
            
            if has_original and len(pairs) > 0:
                # 第一个短语对可能是原始短语的释义，或者需要单独添加原始短语
                # 检查第一个提取的短语是否与原始短语相同或相关
                first_extracted_phrase = pairs[0][0].lower().strip()
                original_phrase_lower = phrase_cleaned.lower().strip()
                
                # 如果提取的第一个短语与原始短语不同，先添加原始短语+第一个中文释义
                if first_extracted_phrase != original_phrase_lower:
                    # 尝试从 meaning 开头提取第一个中文释义（如果存在）
                    # 如果 meaning 以中文开头，可能是原始短语的释义
                    # 匹配到第一个英文短语或数字编号之前的中文
                    first_cn_match = re.match(
                        r'^([\u4e00-\u9fff][\u4e00-\u9fff；、，：．\s]*?)(?=\s*[\.。]\s*[A-Za-z]|\s*\d+\.?\s*[A-Za-z]|\s+[A-Za-z][A-Za-z]|$)',
                        meaning
                    )
                    if first_cn_match:
                        first_cn = first_cn_match.group(1).strip()
                        # 清理末尾的标点（如 " ."）
                        first_cn = re.sub(r'[\.。]\s*$', '', first_cn).strip()
                        if first_cn:
                            flat.append({
                                'phraseId': str(phrase_id),
                                'phrase': phrase_cleaned,
                                'meaning': first_cn
                            })
                            phrase_id += 1
                
                # 添加所有提取的短语对
                for en, cn in pairs:
                    flat.append({
                        'phraseId': str(phrase_id),
                        'phrase': en.strip(),
                        'meaning': cn.strip()
                    })
                    phrase_id += 1
            else:
                # 如果没有原始短语，直接使用提取的
                for en, cn in pairs:
                    flat.append({
                        'phraseId': str(phrase_id),
                        'phrase': en.strip(),
                        'meaning': cn.strip()
                    })
                    phrase_id += 1
        else:
            # 如果提取不到短语对，保留原始数据
            if phrase_cleaned and meaning:
                flat.append({
                    'phraseId': str(phrase_id),
                    'phrase': phrase_cleaned,
                    'meaning': meaning
                })
                phrase_id += 1
            elif meaning:
                # 只有 meaning，可能是纯中文
                flat.append({
                    'phraseId': str(phrase_id),
                    'phrase': phrase if phrase else '',
                    'meaning': meaning
                })
                phrase_id += 1
    
    return flat

def parse_html():
    """把 HTML 转义字符还原后，逐行匹配"""
    text = pathlib.Path(html_file).read_text(encoding='utf-8')
    # 先简单去掉标签，保留文字
    text = re.sub(r'<[^>]+>', '', text)
    # HTML 实体还原
    text = html.unescape(text)
    phrases = []
    for line in map(str.strip, text.splitlines()):
        if not line or len(line) < 5:
            continue
        m = phrase_re.match(line)
        if m:
            phrases.append({
                'phrase': m['phrase'].strip(),
                'meaning': m['chinese'].strip()
            })
    return phrases

def convert_to_backend_format(data):
    """
    将提取的短语数据转换为后端格式
    """
    backend_data = []
    current_time = datetime.utcnow().isoformat() + 'Z'
    
    for item in data:
        backend_item = {
            'id': str(uuid.uuid4()),
            'phrase': item.get('phrase', '').strip(),
            'meaning': item.get('meaning', '').strip(),
            'example': '',
            'createdAt': current_time,
            'updatedAt': current_time
        }
        backend_data.append(backend_item)
    
    return backend_data

def save_json(data, f='phrase.json', backend_format=False):
    if backend_format:
        # 转换为后端格式
        backend_data = convert_to_backend_format(data)
        pathlib.Path(f).write_text(json.dumps(backend_data, ensure_ascii=False, indent=2), encoding='utf-8')
        print(f'[OK] {f} (后端格式) 共 {len(backend_data)} 条')
    else:
        # 原始格式（保留 phraseId）
        pathlib.Path(f).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
        print(f'[OK] {f}  共 {len(data)} 条')

def save_csv(data, f='phrase.csv'):
    with open(f, 'w', newline='', encoding='utf-8-sig') as csvf:
        writer = csv.DictWriter(csvf, fieldnames=['phraseId', 'phrase', 'meaning'])
        writer.writeheader()
        writer.writerows(data)
    print(f'[OK] {f}')

def save_md(data, f='phrase.md'):
    lines = ['| 序号 | 词组 / 短语 | 中文释义 |', '|------|-------------|----------|']
    for it in data:
        phrase_id = it.get('phraseId', '')
        lines.append(f"| {phrase_id} | {it['phrase']} | {it['meaning']} |")
    pathlib.Path(f).write_text('\n'.join(lines), encoding='utf-8')
    print(f'[OK] {f}')

def main():
    import sys
    
    data = parse_html()
    if not data:
        print('未提取到任何短语，请检查 phrase.html 内容')
        return
    data = flatten_phrases(data) 
    
    # 默认生成后端格式（适配 word-wonderland-backend/data/phrases.json）
    save_json(data, 'phrase.json', backend_format=True)
    
    # 如果指定了 --original 或 -o 参数，也生成原始格式（带 phraseId）
    if '--original' in sys.argv or '-o' in sys.argv:
        save_json(data, 'phrase_original.json', backend_format=False)
        print('已同时生成原始格式文件 phrase_original.json')
    
    save_csv(data)
    save_md(data)

if __name__ == '__main__':
    main()